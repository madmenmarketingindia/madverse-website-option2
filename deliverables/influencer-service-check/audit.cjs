const fs = require('fs');
const path = require('path');
const {spawn} = require('child_process');
const {pathToFileURL} = require('url');
const out = path.resolve('deliverables/influencer-service-check');
const chrome = spawn('C:/Program Files/Google/Chrome/Application/chrome.exe', ['--headless=new','--disable-gpu','--no-sandbox','--disable-extensions','--no-first-run','--no-default-browser-check','--remote-debugging-port=9389',`--user-data-dir=${out}/visual-profile`,'about:blank'], {windowsHide:true,stdio:'ignore'});
(async()=>{
let ws;
try {
 let tabs;
 for(let i=0;i<40;i++){try{tabs=await (await fetch('http://127.0.0.1:9389/json')).json();break;}catch{await new Promise(r=>setTimeout(r,250));}}
 if(!tabs) throw Error('Chrome did not start');
 console.log('Connecting', tabs.map(t=>t.url));
 ws=new WebSocket(tabs.find(t=>t.url==='about:blank').webSocketDebuggerUrl);
 await new Promise(r=>ws.addEventListener('open',r,{once:true}));
 ws.addEventListener('close',e=>console.log('Socket closed',e.code,e.reason));
 let seq=0; const pending=new Map();
 ws.addEventListener('message',e=>{const m=JSON.parse(e.data);if(pending.has(m.id)){const [resolve,reject]=pending.get(m.id);pending.delete(m.id);m.error?reject(Error(JSON.stringify(m.error))):resolve(m.result);}});
 const call=(method,params={})=>new Promise((resolve,reject)=>{const id=++seq;pending.set(id,[resolve,reject]);ws.send(JSON.stringify({id,method,params}));});
 const evaluate=async expression=>(await call('Runtime.evaluate',{expression,awaitPromise:true,returnByValue:true})).result.value;
 await call('Page.enable');
 const results=[];
 for(const [width,height] of [[320,844],[390,844],[768,1024],[1366,768]]) {
  await call('Emulation.setDeviceMetricsOverride',{width,height,deviceScaleFactor:1,mobile:width<901});
  await call('Page.navigate',{url:pathToFileURL(path.resolve('influencer-creator-marketing-service.html')).href});
  await new Promise(r=>setTimeout(r,900));
  await evaluate('document.fonts.ready.then(()=>true)');
  await evaluate('Promise.all([...document.images].map(i=>{i.loading="eager";return i.decode().catch(()=>{});})).then(()=>true)');
  const layout=await evaluate(`(()=>{ const els=[...document.querySelectorAll('main *,header.site-header *,footer *')]; return {heroBottom:document.querySelector(".influencer-hero").getBoundingClientRect().bottom,viewportHeight:innerHeight,viewport:innerWidth,scrollWidth:document.documentElement.scrollWidth,overflow:els.filter(e=>{let r=e.getBoundingClientRect();return r.width>0&&(r.right>innerWidth+1||r.left< -1)&&getComputedStyle(e).visibility!=='hidden'&&!e.closest('[inert]');}).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,60),width:e.getBoundingClientRect().width})),clippedText:els.filter(e=>e.matches('h1,h2,h3,p,a,li')&&e.clientWidth>0&&e.scrollWidth>e.clientWidth+2&&!e.closest('[inert]')).map(e=>({tag:e.tagName,class:e.className,text:e.textContent.trim().slice(0,70)})),brokenImages:[...document.images].filter(i=>!i.naturalWidth).map(i=>i.src)};})()`);
  const image=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true});
  fs.writeFileSync(`${out}/${width}-${height}.png`,Buffer.from(image.data,'base64'));
  for(const [i,selector] of ['.influencer-formats'].entries()) {
   const y=await evaluate(`document.querySelector('${selector}').getBoundingClientRect().top+scrollY`);
   const shot=await call('Page.captureScreenshot',{format:'png',captureBeyondViewport:true,clip:{x:0,y,width,height:844,scale:1}});
   fs.writeFileSync(`${out}/${width}-${height}-section-${i}.png`,Buffer.from(shot.data,'base64'));
  }

  await evaluate('document.querySelector(".nav-toggle").click()');
  layout.menuOpens=await evaluate('document.querySelector(".nav-toggle").getAttribute("aria-expanded")==="true" && !document.querySelector("#site-navigation").inert');
  await call('Input.dispatchKeyEvent',{type:'keyDown',key:'Escape',code:'Escape',windowsVirtualKeyCode:27});
  layout.escapeClosesMenu=await evaluate('document.querySelector(".nav-toggle").getAttribute("aria-expanded")==="false"');
  results.push({width,...layout});
 }
 fs.writeFileSync(`${out}/results.json`,JSON.stringify(results,null,2));
 console.log(JSON.stringify(results,null,2));
 call('Browser.close').catch(()=>{}); setTimeout(()=>process.exit(0),500);
} finally {if(ws)ws.close();chrome.kill();}
})().catch(e=>{console.error(e);process.exitCode=1;});