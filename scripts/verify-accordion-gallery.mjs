import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const profile = await mkdtemp(join(tmpdir(), 'portfolio-chrome-'));
const chrome = spawn(process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless', '--no-sandbox', '--disable-gpu', '--no-proxy-server',
  '--remote-debugging-port=9337', '--user-data-dir=' + profile, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
const url = process.env.PORTFOLIO_REVIEW_URL ?? 'http://127.0.0.1:3101/';
const output = process.env.PORTFOLIO_REVIEW_OUTPUT;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
let socket;

try {
  let tabs;
  for (let attempt = 0; attempt < 60; attempt++) {
    try { tabs = await (await fetch('http://127.0.0.1:9337/json')).json(); break; }
    catch { await delay(100); }
  }
  assert.ok(tabs, 'Chrome debugging endpoint is available');
  socket = new WebSocket(tabs.find(tab => tab.type === 'page').webSocketDebuggerUrl);
  await new Promise(resolve => socket.addEventListener('open', resolve, { once: true }));
  const pending = new Map();
  let serial = 0;
  socket.addEventListener('message', event => {
    const message = JSON.parse(event.data);
    const callbacks = pending.get(message.id);
    if (!callbacks) return;
    pending.delete(message.id);
    if (message.error) callbacks.reject(new Error(JSON.stringify(message.error)));
    else callbacks.resolve(message.result);
  });
  const send = (method, params = {}) => new Promise((resolve, reject) => {
    const id = ++serial;
    pending.set(id, { resolve, reject });
    socket.send(JSON.stringify({ id, method, params }));
  });
  const evaluate = async expression => {
    const result = await send('Runtime.evaluate', { expression, returnByValue: true });
    if (result.exceptionDetails) throw new Error(JSON.stringify(result.exceptionDetails));
    return result.result.value;
  };
  const until = async expression => {
    for (let attempt = 0; attempt < 100; attempt++) {
      if (await evaluate(expression)) return;
      await delay(100);
    }
    const active = await evaluate(`(() => {
      const element = document.activeElement;
      return { html: element?.outerHTML.slice(0, 170), rect: element?.getBoundingClientRect().toJSON(),
        width: innerWidth, height: innerHeight, scrollY, focusVisible: element?.matches(':focus-visible') };
    })()`);
    assert.fail(expression + ' ' + JSON.stringify(active));
  };
  const viewport = width => send('Emulation.setDeviceMetricsOverride', { width, height: 800, deviceScaleFactor: 1, mobile: width < 650 });
  const navigate = async suffix => {
    await send('Page.navigate', { url: url + '?' + suffix });
    await until(`location.search===${JSON.stringify('?' + suffix)} && document.readyState==='complete'`);
  };
  const gallery = '.work-accordion .ag-root';
  const count = () => evaluate(`({page:document.querySelectorAll('*').length,work:document.querySelectorAll('#work *').length})`);
  const scroll = async expression => {
    await evaluate(`scrollTo({top:${expression},behavior:'instant'})`);
    await delay(200);
  };
  const select = index => until(`document.querySelectorAll('.ag-panel')[${index}]?.getAttribute('aria-current') === 'true'`);
  const key = async (name, code) => {
    await send('Input.dispatchKeyEvent', { type: 'keyDown', key: name, windowsVirtualKeyCode: code });
    await send('Input.dispatchKeyEvent', { type: 'keyUp', key: name, windowsVirtualKeyCode: code });
  };
  async function screenshot(name) {
    if (!output) return;
    const shot = await send('Page.captureScreenshot', { format: 'png' });
    await writeFile(join(output, name + '.png'), Buffer.from(shot.data, 'base64'));
  }
  if (output) await mkdir(output, { recursive: true });
  await send('Page.enable');
  for (const width of [1280,1440,1920,768,360]) {
    await viewport(width);
    await navigate('width=' + width);
    await until(`document.documentElement.dataset.lotusLoading === 'complete'`);
    const initial = await evaluate(`(() => {
      const work = document.getElementById('work');
      return { height: work.offsetHeight, top: work.offsetTop, gallery: !!document.querySelector('${gallery}') };
    })()`);
    if (initial.top > 1000) assert.equal(initial.gallery, false, 'Gallery is deferred outside the observer margin');
    await scroll(`document.getElementById('work').offsetTop - 300`);
    await until(`document.querySelectorAll('.ag-panel').length === 5`);
    await delay(1100);
    const layout = await evaluate(`(() => {
      const root = document.querySelector('${gallery}');
      const track = root.querySelector('.ag-track');
      const work = document.getElementById('work');
      const ancestors = [];
      for (let element = root.parentElement; element && element !== document.documentElement; element = element.parentElement) {
        const s = getComputedStyle(element);
        if (s.transform !== 'none' || s.filter !== 'none' || s.willChange !== 'auto' || s.contain !== 'none' ||
            !['visible'].includes(s.overflowX) || !['visible'].includes(s.overflowY)) ancestors.push(element.className);
      }
      return { height: work.offsetHeight, direction: getComputedStyle(track).flexDirection,
        overflow: document.documentElement.scrollWidth > innerWidth, ancestors,
        expected: [...track.querySelectorAll('.ag-title')].map(el => el.textContent) };
    })()`);
    assert.ok(Math.abs(layout.height - initial.height) <= 4, JSON.stringify({initial,layout}));
    assert.equal(layout.direction, width >= 1024 ? 'row' : 'column');
    assert.equal(layout.overflow, false);
    assert.deepEqual(layout.ancestors, []);
    assert.deepEqual(layout.expected, ['Finora','VEYRA','APTLY','Nikot-e-Metro','LUMA']);
    if (width === 1280) console.log('DOM after gallery mount', await count());

    for (const theme of ['light','dark']) {
      await evaluate(`document.documentElement.dataset.theme = '${theme}'`);
      await delay(450);
      if (width >= 1024) {
        await scroll(`document.getElementById('work').offsetTop - 300`);
        const { start, distance } = await evaluate(`(() => {
          const root = document.querySelector('${gallery}');
          const spacer = root.parentElement;
          return {
            start: spacer.getBoundingClientRect().top + scrollY + (root.offsetHeight - innerHeight) / 2,
            distance: parseFloat(spacer.style.paddingBottom),
          };
        })()`);
        assert.ok(distance > 0);
        for (let index = 0; index < 5; index++) {
          await scroll(String(Math.ceil(start + (index === 4 ? .98 : index / 4 + .015) * distance)));
          await select(index);
          assert.equal(await evaluate(`getComputedStyle(document.querySelector('${gallery}')).position`), 'fixed');
          await delay(650);
          await screenshot(`accordion-${width}-${theme}-${index + 1}`);
        }
        await scroll(String(start + distance + 50));
        assert.notEqual(await evaluate(`getComputedStyle(document.querySelector('${gallery}')).position`), 'fixed');
        assert.ok(await evaluate(`(() => {
          const work = document.getElementById('work');
          const next = work.nextElementSibling.getBoundingClientRect();
          return next.top >= work.getBoundingClientRect().bottom - 1 && next.top < innerHeight;
        })()`), 'Next section follows the pin');
      } else {
        assert.equal(await evaluate(`document.querySelector('#work .pin-spacer') !== null`), false);
        await evaluate(`document.querySelectorAll('.ag-panel')[2].click()`);
        await select(2);
        await evaluate(`document.querySelector('.ag-track').scrollIntoView({block:'center',behavior:'instant'})`);
        await delay(700);
        await screenshot(`accordion-${width}-${theme}`);
        for (const index of [0,1,2,3,4]) {
          await evaluate(`document.querySelectorAll('.ag-panel')[${index}].click()`);
          await select(index);
          assert.ok(await evaluate(`!document.querySelector('dialog[open]')`));
        }
      }
      console.log(`PASS ${width}px ${theme}`);
    }
  }

  await viewport(1440);
  await navigate('keyboard');
  await until(`document.documentElement.dataset.lotusLoading === 'complete'`);
  await scroll(`document.getElementById('work').offsetTop - 150`);
  await until(`document.querySelectorAll('.ag-panel').length === 5`);
  await evaluate(`document.querySelector('.ag-panel').focus()`);
  await key('Tab',9);
  await select(1);
  await key('ArrowRight',39);
  await select(2);
  await key('End',35);
  await select(4);
  await key('Home',36);
  await select(0);
  assert.ok(await evaluate(`document.activeElement.matches(':focus-visible') && getComputedStyle(document.activeElement).outlineStyle === 'solid'`));
  await key('Enter',13);
  await until(`document.querySelector('dialog[open] h2')?.textContent === 'Finora'`);
  await key('Escape',27);
  await until(`!document.querySelector('dialog[open]') && document.activeElement === document.querySelector('.ag-panel')`);

  await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
  await until(`!document.querySelector('#work .pin-spacer')`);
  await evaluate(`document.querySelectorAll('.ag-panel')[4].click()`);
  await select(4);
  assert.ok(await evaluate(`[...document.querySelectorAll('.ag-panel')].every(panel => getComputedStyle(panel).opacity === '1')`));
  console.log('PASS keyboard, focus ring, modal Escape/focus restoration, reduced motion');
} finally {
  socket?.close();
  chrome.kill();
}
