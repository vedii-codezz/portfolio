import { spawn } from 'node:child_process';
import fs from 'node:fs/promises';
import assert from 'node:assert/strict';
import { projects } from '../data/projects.ts';
const browser = spawn(`${process.env.LOCALAPPDATA}/ms-playwright/chromium_headless_shell-1248/chrome-headless-shell-win64/chrome-headless-shell.exe`, ['--remote-debugging-port=9338', '--no-sandbox', '--disable-gpu', 'about:blank'], { windowsHide:true, stdio:'ignore' });
const delay = ms => new Promise(resolve => setTimeout(resolve,ms));
let socket;
try {
 let tabs;
 for(let i=0;i<50;i++){try{tabs=await(await fetch('http://127.0.0.1:9338/json')).json();break;}catch{await delay(100);}}
 assert.ok(tabs,'Chromium starts');
 socket=new WebSocket(tabs[0].webSocketDebuggerUrl);await new Promise(resolve=>socket.addEventListener('open',resolve,{once:true}));
 let serial=0;const pending=new Map();const errors=[];
 socket.addEventListener('message',event=>{const data=JSON.parse(event.data);if(data.method==='Runtime.exceptionThrown')errors.push(data.params.exceptionDetails);if(data.id){const request=pending.get(data.id);pending.delete(data.id);if(data.error)request.reject(Error(JSON.stringify(data.error)));else request.resolve(data.result);}});
 const send=(method,params={})=>new Promise((resolve,reject)=>{const id=++serial;pending.set(id,{resolve,reject});socket.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>{const result=await send('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});if(result.exceptionDetails)throw Error(JSON.stringify(result.exceptionDetails));return result.result.value;};
 const until=async expression=>{for(let i=0;i<100;i++){if(await evaluate(expression))return;await delay(100);}throw Error(`Timed out: ${expression}`);};
 const key=async(value,shift=false)=>{await send('Input.dispatchKeyEvent',{type:'keyDown',key:value,code:value,modifiers:shift?8:0});await send('Input.dispatchKeyEvent',{type:'keyUp',key:value,code:value,modifiers:shift?8:0});};
 const click=selector=>evaluate(`document.querySelector(${JSON.stringify(selector)}).click()`);
 await send('Page.enable');await send('Runtime.enable');
 await send('Emulation.setDeviceMetricsOverride',{width:1440,height:1000,deviceScaleFactor:1,mobile:false});
 await send('Page.navigate',{url:'http://127.0.0.1:3001/'});
 await until(`!!document.querySelector('.site-header')`);
 assert.ok(await evaluate(`!!document.querySelector('.menu-toggle')`),'Header exposes the new Menu control');
 if(await evaluate(`document.documentElement.dataset.lotusLoading!=='complete'`)){
  await click('.menu-toggle');assert.equal(await evaluate(`document.querySelector('.menu-toggle').getAttribute('aria-expanded')`),'false','Menu waits for lotus loader');
 }
 await until(`document.documentElement.dataset.lotusLoading==='complete'`);
 assert.equal(await evaluate(`document.querySelectorAll('.navigation-shell .theme-toggle').length`),1,'Existing theme toggle is reused once');
 const open=async()=>{await click('.menu-toggle');await until(`document.querySelector('.navigation-shell').dataset.menuState==='open'`);};
 const close=async()=>{await click('.menu-toggle');await until(`document.querySelector('.navigation-shell').dataset.menuState==='closed'`);};
 await open();
 assert.ok(await evaluate(`(()=>{const p=document.querySelector('.staggered-panel'),o=document.querySelector('.staggered-overlay');return Math.abs(p.getBoundingClientRect().right-o.getBoundingClientRect().right)<1&&o.scrollLeft===0})()`),'Panel opens visibly without hidden horizontal scrolling');
 assert.equal(await evaluate(`document.querySelector('main').inert`),true);
 assert.equal(await evaluate(`getComputedStyle(document.body).overflow`),'hidden');
 await until(`document.activeElement.getAttribute('href')==='#home'`);
 assert.deepEqual(await evaluate(`[...document.querySelectorAll('.staggered-links a')].map(a=>a.getAttribute('href'))`),['#home','#work','#playground','#story','#stack','#contact']);
 assert.deepEqual(await evaluate(`[...document.querySelectorAll('.staggered-socials a')].map(a=>a.getAttribute('href'))`),['https://github.com/vedii-codezz','https://www.linkedin.com/in/bedantikamondal2007/','mailto:bedantikamondal28@gmail.com']);
 assert.ok(await evaluate(`[...document.querySelectorAll('.staggered-socials a[href^="https:"]')].every(a=>a.target==='_blank'&&a.rel.includes('noopener')&&a.rel.includes('noreferrer'))`));
 for(let i=0;i<18;i++){await key('Tab');assert.ok(await evaluate(`document.querySelector('.navigation-shell').contains(document.activeElement)`),'Focus stays inside dialog');}
 await evaluate(`document.querySelector('.navigation-shell .wordmark').focus()`);await key('Tab',true);
 assert.equal(await evaluate(`document.activeElement.getAttribute('href')`),'mailto:bedantikamondal28@gmail.com','Shift+Tab wraps to final social');
 const y=await evaluate('scrollY');await send('Input.dispatchMouseEvent',{type:'mouseWheel',x:100,y:500,deltaX:0,deltaY:500});await delay(150);assert.equal(await evaluate('scrollY'),y,'Background cannot wheel-scroll');
 await key('Escape');await until(`document.querySelector('.navigation-shell').dataset.menuState==='closed'`);
 assert.equal(await evaluate(`document.activeElement.classList.contains('menu-toggle')`),true);
 assert.equal(await evaluate(`document.querySelector('main').inert`),false);
 assert.notEqual(await evaluate(`getComputedStyle(document.body).overflow`),'hidden');
 console.log('PASS destinations, social security attributes, focus trap/restore, Escape, scroll lock/restore, loader gate');
 for(const anchor of ['home','work','playground','story','stack','contact']){
  await open();await click(`.staggered-links a[href="#${anchor}"]`);await until(`document.querySelector('.navigation-shell').dataset.menuState==='closed'`);await delay(150);
  assert.equal(await evaluate('location.hash'),`#${anchor}`);
  await until(`(()=>{const target=document.querySelector('#${anchor}');const top=target.getBoundingClientRect().top+scrollY;const padding=parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop)||0;const goal=Math.max(0,Math.min(top-padding,document.documentElement.scrollHeight-innerHeight));return Math.abs(scrollY-goal)<4})()`);
 }
 console.log('PASS all six anchors close and navigate after restoring scrolling');
 await fs.mkdir('docs/navigation-verification',{recursive:true});
 for(const width of [320,390,768,1024,1440]){
  await send('Emulation.setDeviceMetricsOverride',{width,height:width<768?640:1000,deviceScaleFactor:1,mobile:width<768});
  await evaluate(`window.scrollTo({top:0,behavior:'instant'})`);await open();
  for(const theme of ['light','dark']){
   if(await evaluate(`document.documentElement.dataset.theme!=='${theme}'`))await click('.navigation-shell .theme-toggle');
   await delay(600);
   const fit=await evaluate(`(()=>{const p=document.querySelector('.staggered-panel'),h=document.querySelector('.site-header');return {overflow:document.documentElement.scrollWidth>innerWidth,panelOverflow:p.scrollWidth>p.clientWidth,items:[...document.querySelectorAll('.staggered-links a')].every(a=>a.scrollWidth<=a.clientWidth+2),theme:document.documentElement.dataset.theme,open:document.querySelector('.navigation-shell').dataset.menuState,header:h.getBoundingClientRect().right<=innerWidth}})()`);
   assert.equal(fit.overflow,false,`no page overflow at ${width}`);assert.equal(fit.panelOverflow,false);assert.ok(fit.items);assert.equal(fit.theme,theme);assert.equal(fit.open,'open');assert.ok(fit.header);
   assert.ok(await evaluate(`[...document.querySelectorAll('.menu-number')].every(number=>getComputedStyle(number).display!=='none')`),'All six item numbers remain visible on mobile');
   assert.ok(await evaluate(`getComputedStyle(document.querySelector('.navigation-shell .lotus-mark')).color!==getComputedStyle(document.querySelector('.staggered-panel')).backgroundColor`),'Lotus remains visible against the open panel');
   assert.ok(await evaluate(`[...document.querySelectorAll('.menu-label-mask')].every(mask=>mask.scrollWidth<=mask.clientWidth+1)`),'Large labels are not clipped');
   const alignment=await evaluate(`(()=>{const p=document.querySelector('.staggered-panel'),o=document.querySelector('.staggered-overlay');return {right:p.getBoundingClientRect().right,viewportEdge:o.getBoundingClientRect().right,hiddenScroll:o.scrollLeft}})()`);
   assert.ok(Math.abs(alignment.right-alignment.viewportEdge)<1&&alignment.hiddenScroll===0,`Open panel reaches the usable viewport edge after resize: ${JSON.stringify(alignment)}`);
   assert.ok(await evaluate(`(()=>{const a=document.querySelector('.staggered-links a'),r=a.getBoundingClientRect();const hit=document.elementFromPoint(r.left+r.width/2,r.top+r.height/2);return hit?.closest('.staggered-links a')===a&&Number(getComputedStyle(a.querySelector('[data-menu-label]')).opacity)>.99})()`),'Visible menu labels receive pointer input');
   const shot=await send('Page.captureScreenshot',{format:'png'});await fs.writeFile(`docs/navigation-verification/${width}-${theme}.png`,Buffer.from(shot.data,'base64'));
  }
  await close();console.log(`PASS ${width}px in both themes: fit, live theme switch, screenshots`);
 }
 await send('Emulation.setDeviceMetricsOverride',{width:320,height:430,deviceScaleFactor:1,mobile:true});await open();
 assert.ok(await evaluate(`(()=>{const p=document.querySelector('.staggered-panel');p.scrollTop=p.scrollHeight;const a=p.querySelector('.staggered-socials a:last-child').getBoundingClientRect();return a.bottom<=innerHeight&&a.top>=0})()`),'Social links reachable by internal scroll on a short screen');await close();
 for(let i=0;i<6;i++){await click('.menu-toggle');await delay(35);}await until(`document.querySelector('.navigation-shell').dataset.menuState==='closed'`);assert.equal(await evaluate(`document.querySelector('main').inert`),false);
 await send('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});await click('.menu-toggle');await delay(50);assert.equal(await evaluate(`document.querySelector('.navigation-shell').dataset.menuState`),'open');await click('.menu-toggle');await delay(50);assert.equal(await evaluate(`document.querySelector('.navigation-shell').dataset.menuState`),'closed');
 await evaluate(`document.getElementById('work').scrollIntoView({behavior:'instant'})`);
 await until(`document.querySelectorAll('#work .ag-panel').length===${projects.length}`);
 assert.deepEqual(errors,[],'No browser exceptions');
 console.log('PASS short mobile scrolling, rapid toggles, reduced motion, Selected Work preservation, no browser exceptions');
} finally {socket?.close();browser.kill();}
