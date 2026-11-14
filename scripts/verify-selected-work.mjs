import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { mkdtemp } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

const profile = await mkdtemp(join(tmpdir(), 'portfolio-chrome-'));
const chrome = spawn(process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe', [
  '--headless', '--no-sandbox', '--disable-gpu', '--no-proxy-server',
  '--remote-debugging-port=9337', '--user-data-dir=' + profile, 'about:blank',
], { windowsHide: true, stdio: 'ignore' });
const url = process.env.PORTFOLIO_REVIEW_URL ?? 'http://127.0.0.1:3101/';
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
  const counts = () => evaluate(`({page: document.querySelectorAll('*').length, work: document.querySelectorAll('#work *').length})`);
  await send('Page.enable');
  await viewport(1280);
  await navigate('baseline=' + process.argv.includes('--baseline'));
  await until(`document.documentElement.dataset.lotusLoading === 'complete'`);
  if (process.argv.includes('--baseline')) {
    await until(`document.querySelector('.circular-carousel')?.hasAttribute('data-ring-ready')`);
    console.log('Baseline DOM', await counts());
  } else {
    console.log('Showcase DOM', await counts());
    for (const width of [360, 768, 1280]) {
      await viewport(width);
      for (const theme of ['light', 'dark']) {
        await evaluate(`document.documentElement.dataset.theme='${theme}'; document.querySelector('#work').scrollIntoView({behavior:'instant'})`);
        if (width >= 1024) await until(`document.querySelector('.work-showcase').hasAttribute('data-parallax')`);
        await delay(700);
        assert.deepEqual(await evaluate(`(() => {
          const showcase = document.querySelector('.work-showcase');
          const lanes = [...showcase.querySelectorAll('.work-lane')];
          return {
            cards: lanes.map(lane => lane.children[0].children.length),
            detail: getComputedStyle(lanes[1]).display !== 'none',
            overflow: [...lanes[0].querySelectorAll('.work-card')].some(card => {
              if (innerWidth >= 1024) return false;
              const rect = card.getBoundingClientRect();
              return rect.left < 0 || rect.right > document.documentElement.clientWidth + 1;
            }),
            headings: showcase.querySelectorAll('h3').length,
          };
        })()`), { cards: [5, 5], detail: width >= 1024, overflow: false, headings: 5 });
        const contrast = await evaluate(`(() => {
          function luminance(color) {
            return color.match(/[0-9.]+/g).slice(0, 3).map(Number).reduce((sum, channel, index) => {
              const s = channel / 255;
              return sum + [0.2126, 0.7152, 0.0722][index] * (s <= .04045 ? s / 12.92 : ((s + .055) / 1.055) ** 2.4);
            }, 0);
          }
          const background = luminance(getComputedStyle(document.body).backgroundColor);
          return [...document.querySelectorAll('.work-caption :is(span,p,h3)')].map(element => {
            const foreground = luminance(getComputedStyle(element).color);
            return (Math.max(background, foreground) + .05) / (Math.min(background, foreground) + .05);
          });
        })()`);
        assert.ok(contrast.every(ratio => ratio >= 4.5), `${theme} caption contrast: ${contrast}`);
        if (width >= 1024) {
          const frames = [];
          for (const position of [.9, .5, .1]) {
            await evaluate(`(() => {
              const area = document.querySelector('.work-showcase').getBoundingClientRect();
              scrollTo({top:scrollY + area.top - innerHeight * ${position}, behavior:'instant'});
            })()`);
            await delay(160);
            frames.push(await evaluate(`({
              tilt: Number(document.querySelector('.work-rows').style.opacity),
              x: [...document.querySelectorAll('.work-track')].map(track => new DOMMatrix(getComputedStyle(track).transform).m41)
            })`));
          }
          assert.ok(frames[0].tilt < frames[1].tilt && frames[1].tilt > .99, JSON.stringify(frames));
          assert.ok(frames[0].x[0] < frames[2].x[0] && frames[0].x[1] > frames[2].x[1], JSON.stringify(frames));
        }
        await evaluate(`document.querySelector('.work-lane:first-child .work-card:last-child').focus();`);
        await until(`(() => {
          const rect = document.activeElement.getBoundingClientRect();
          return rect.left >= 0 && rect.right <= innerWidth && rect.top < innerHeight && rect.bottom > 0;
        })()`);
        await send('Input.dispatchKeyEvent', { type: 'keyDown', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
        await send('Input.dispatchKeyEvent', { type: 'keyUp', key: 'Enter', code: 'Enter', windowsVirtualKeyCode: 13 });
        await until(`document.querySelector('dialog[open] h2')?.textContent === 'LUMA'`);
        await evaluate(`document.querySelector('dialog[open] button').click()`);
        await until(`document.activeElement.querySelector('h3')?.textContent === 'LUMA'`);
        await evaluate('document.activeElement.blur()');
        console.log(`PASS ${width}px ${theme}: layout, scrolling and keyboard case study`);
      }
    }
    await send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    await until(`!document.querySelector('.work-showcase').hasAttribute('data-parallax')`);
    assert.ok(await evaluate(`[...document.querySelectorAll('.work-track,.work-rows,.work-card')].every(el => getComputedStyle(el).transform === 'none' && getComputedStyle(el).opacity === '1')`));
    await send('Emulation.setScriptExecutionDisabled', { value: true });
    await navigate('no-js');
    assert.ok(await evaluate(`[...document.querySelectorAll('.work-lane:first-child a')].every(card => card.href.startsWith('https://') && card.getBoundingClientRect().height > 0)`));
    console.log('PASS reduced motion and JavaScript-disabled cards');
  }
} finally {
  socket?.close();
  chrome.kill();
}
