import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { techStack } from '../data/tech-stack.ts';

const output=process.env.PORTFOLIO_REVIEW_OUTPUT;
const matrixOnly=process.argv.includes('--matrix-only');
const controlsOnly=process.argv.includes('--controls-only');
assert.ok(output,'Set PORTFOLIO_REVIEW_OUTPUT to a directory outside the repository');
const browser=spawn('C:/Users/monda/AppData/Local/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe',['--remote-debugging-port=9343','--no-sandbox','--disable-gpu','about:blank'],{windowsHide:true,stdio:'ignore'});
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
let socket;
try {
  let tabs;for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9343/json')).json();break;}catch{await delay(100);}}
  assert.ok(tabs);socket=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
  let serial=0;const pending=new Map(),errors=[],results=[];
  socket.addEventListener('message',event=>{const m=JSON.parse(event.data);if(m.method==='Runtime.exceptionThrown')errors.push(m.params.exceptionDetails);if(m.method==='Runtime.consoleAPICalled'&&m.params.type==='error')errors.push(m.params.args);if(m.id){const p=pending.get(m.id);pending.delete(m.id);if(m.error)p.reject(Error(JSON.stringify(m.error)));else p.resolve(m.result);}});
  const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
  const evaluate=async expression=>{const r=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(r.exceptionDetails)throw Error(JSON.stringify(r.exceptionDetails));return r.result.value;};
  const until=async expression=>{for(let i=0;i<150;i++){if(await evaluate(expression))return;await delay(100);}throw Error(`Timed out: ${expression}`);};
  const scroll=async selector=>{await evaluate(`document.querySelector(${JSON.stringify(selector)}).scrollIntoView({block:'center',behavior:'instant'})`);await delay(1000);};
  await fs.mkdir(output,{recursive:true});await send('Page.enable');await send('Runtime.enable');
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});
  await send('Page.navigate',{url:process.env.PORTFOLIO_REVIEW_URL??'http://127.0.0.1:3001/'});
  await until(`document.documentElement?.dataset.lotusLoading==='complete'&&!!document.querySelector('.toolkit-flip-grid')`);
  await evaluate('document.fonts.ready');await delay(1900);
  if(!matrixOnly&&!controlsOnly) {
  await scroll('#playground');
  assert.ok(await evaluate(`document.querySelector('.pengu-character img')?.naturalWidth>0`),'Pengu artwork rendered');
  await evaluate(`document.querySelector('.pengu-reaction').click()`);await delay(80);
  assert.ok(await evaluate(`getComputedStyle(document.querySelector('.pengu-reaction')).transform!=='none'`),'Pengu reaction animates');
  await scroll('#story');
  assert.ok(await evaluate(`!!document.querySelector('.journey-rail svg') && !!document.querySelector('[data-chapter="education"] h3')`),'Journey art and education remain');
  await scroll('#contact');
  assert.equal(await evaluate(`document.querySelector('.contact-email').getAttribute('href')`),'mailto:bedantikamondal28@gmail.com');
  await until(`[...document.querySelectorAll('#contact [data-contact-reveal]')].every(e=>getComputedStyle(e).opacity==='1')`);
  console.log('PASS full-site interactions: Pengu reaction, Journey artwork, education and contact reveal.');
  }
  for(const [width,height] of (controlsOnly?[]:[[320,640],[390,844],[768,1024],[1024,768],[1280,800],[1440,900],[1920,1080]])) {
    await send('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<650});
    for(const theme of ['light','dark']) {
      await evaluate(`document.documentElement.dataset.theme='${theme}'`);
      // Exercise all scroll entrances and inspect section-level containment.
      for(const section of (matrixOnly?[]:['#home','#work','#playground','#story','#stack','#contact','.site-footer'])) {
        await scroll(section);
        if(width===390||width===1440){const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`${output}/${width}-${theme}-${section.replace(/[^a-z]/g,'')}.png`,Buffer.from(shot.data,'base64'));}
      }
      await scroll('.toolkit-flip-grid');
      const layout=await evaluate(`(()=>{const grid=document.querySelector('.toolkit-flip-grid');return {columns:getComputedStyle(grid).gridTemplateColumns.split(' ').length,overflow:document.documentElement.scrollWidth>innerWidth,cards:[...document.querySelectorAll('.flip-card')].map(c=>({width:c.offsetWidth,height:c.offsetHeight})),sections:[...document.querySelectorAll('main section,.site-footer')].map(e=>({id:e.id||e.className,left:e.getBoundingClientRect().left,right:e.getBoundingClientRect().right})),titles:[...document.querySelectorAll('.toolkit-flip-title')].map(e=>({text:e.textContent,overflow:e.scrollWidth>e.clientWidth+1})),ornaments:[...document.querySelectorAll('.toolkit-alpona')].map(e=>({hidden:e.getAttribute('aria-hidden'),pointer:getComputedStyle(e).pointerEvents}))}})()`);
      assert.equal(layout.columns,width>=1200?4:width>=650?2:1);
      assert.equal(layout.overflow,false,`${width} ${theme}: no page overflow`);
      assert.ok(layout.cards.every(c=>c.height===layout.cards[0].height),`Equal card heights: ${JSON.stringify(layout.cards)}`);
      assert.ok(layout.titles.every(t=>!t.overflow),JSON.stringify(layout.titles));
      assert.ok(layout.ornaments.every(o=>o.hidden==='true'&&o.pointer==='none'));
      assert.deepEqual(await evaluate(`[...document.querySelectorAll('.toolkit-flip-technologies li')].map(e=>e.textContent)`),techStack.flatMap(c=>c.technologies));
      for(const face of ['front','back']) {
        if(face==='back') {
          for(let i=0;i<4;i++) {
            await evaluate(`document.querySelectorAll('.flip-card-control')[${i}].click()`);await delay(900);
            assert.equal(await evaluate(`document.querySelectorAll('.flip-card[data-flipped="true"]').length`),i+1,'Each card flips independently');
          }
        }
        const fits=await evaluate(`[...document.querySelectorAll('[data-flip-face="${face}"] .toolkit-flip-content')].map(e=>({overflow:e.scrollHeight>e.clientHeight+1||e.scrollWidth>e.clientWidth+1,heading:e.querySelector('h3').getBoundingClientRect().bottom,cue:e.querySelector('.toolkit-flip-cue').getBoundingClientRect().top,pills:[...e.querySelectorAll('li')].map(p=>({bottom:p.getBoundingClientRect().bottom,right:p.getBoundingClientRect().right})),right:e.getBoundingClientRect().right}))`);
        assert.ok(fits.every(f=>!f.overflow&&f.heading<f.cue&&f.pills.every(p=>p.bottom<=f.cue&&p.right<=f.right)),`${width} ${theme} ${face}: ${JSON.stringify(fits)}`);
        // Beyond-viewport captures can include the offscreen fixed skip link.
        await evaluate(`document.querySelector('.skip-link').style.visibility='hidden'`);
        const clip=await evaluate(`(()=>{const r=document.querySelector('.toolkit-flip-grid').getBoundingClientRect();return {x:r.x+scrollX,y:r.y+scrollY,width:r.width,height:r.height,scale:1}})()`);
        const shot=await send('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip});await fs.writeFile(`${output}/${width}-${theme}-${face}.png`,Buffer.from(shot.data,'base64'));
        await evaluate(`document.querySelector('.skip-link').style.removeProperty('visibility')`);
      }
      await evaluate(`document.querySelectorAll('.flip-card-control').forEach(b=>b.click())`);await delay(900);
      results.push({width,height,theme,...layout});console.log(`PASS ${width}x${height} ${theme}: ${layout.columns} columns, ${layout.cards[0].width}x${layout.cards[0].height}, faces fit, 19 technologies, independent flips, no overflow.`);
    }
  }
  await send('Emulation.setDeviceMetricsOverride',{width:1440,height:900,deviceScaleFactor:1,mobile:false});await scroll('.toolkit-flip-grid');
  await evaluate(`document.querySelector('.flip-card-control').focus()`);
  assert.ok(await evaluate(`document.activeElement===document.querySelector('.flip-card-control')`),'Card control receives focus');
  await send('Input.dispatchKeyEvent',{type:'keyDown',key:'Enter',code:'Enter',text:'\r',unmodifiedText:'\r',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});await send('Input.dispatchKeyEvent',{type:'keyUp',key:'Enter',code:'Enter',windowsVirtualKeyCode:13,nativeVirtualKeyCode:13});await delay(1000);
  assert.equal(await evaluate(`document.querySelector('.flip-card-control').getAttribute('aria-pressed')`),'true');
  assert.ok(await evaluate(`document.querySelector('.flip-card-front').inert && !document.querySelector('.flip-card-back').inert`),'Hidden face inert');
  assert.ok(await evaluate(`getComputedStyle(document.querySelector('.flip-card-control')).outlineStyle==='solid'`),'Keyboard focus visible');
  const pointer=await evaluate(`(()=>{const r=document.querySelector('.flip-card').getBoundingClientRect();return {x:r.x+r.width*.7,y:r.y+r.height*.4}})()`);
  await send('Input.dispatchMouseEvent',{type:'mouseMoved',...pointer});await delay(250);
  assert.ok(await evaluate(`document.querySelector('.flip-card-tilt').style.transform.includes('rotateX')`));
  assert.ok(await evaluate(`Number(getComputedStyle(document.querySelector('.flip-card-glare')).opacity)>0`));
  await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await delay(300);
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.flip-card-tilt')).transform`),'none');
  assert.equal(await evaluate(`getComputedStyle(document.querySelector('.flip-card-glare')).display`),'none');
  await evaluate(`document.querySelector('.flip-card-control').click()`);await delay(100);
  assert.equal(await evaluate(`document.querySelector('.flip-card').dataset.flipped`),'false');
  assert.ok(await evaluate(`[...document.querySelectorAll('[data-stack-category]')].every(e=>getComputedStyle(e).opacity==='1')`));
  assert.deepEqual(errors,[],'No console errors or hydration warnings');
  await fs.writeFile(`${output}/${controlsOnly?'controls':'measurements'}.json`,JSON.stringify(results,null,2));
  console.log('PASS keyboard flip, focus outline, inert hidden face, pointer tilt/glare, reduced motion and no console/hydration errors.');
} finally {socket?.close();browser.kill();}
