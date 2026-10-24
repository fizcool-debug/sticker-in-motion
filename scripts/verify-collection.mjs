import { browserOptions, appUrl } from './browser-tools.mjs';
import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import { chromium } from 'playwright';
const browser=await chromium.launch(browserOptions());
const origin=appUrl;
try {
 await mkdir('work/qa',{recursive:true});
 for(const [name,viewport] of [['mobile',{width:393,height:852}],['desktop',{width:1440,height:900}]]) {
  const page=await browser.newPage({viewport});const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>{throw new DOMException('Denied','NotAllowedError');};});
  await page.goto(origin+'/#preview');
  await page.getByLabel('Preview sticker', { exact: true }).selectOption('red-no-rush');
  await page.waitForFunction(()=>document.querySelector('.supplied-video')?.readyState>=2);
  const metadata=await page.locator('.supplied-video').evaluate(async video=>{await video.play();return {width:video.videoWidth,height:video.videoHeight,duration:video.duration,loop:video.loop,muted:video.muted,inline:video.playsInline};});
  assert.equal(metadata.width,2048);assert.equal(metadata.height,2048);assert.ok(Math.abs(metadata.duration-8/6)<.02);assert.ok(metadata.loop&&metadata.muted&&metadata.inline);
  await page.waitForFunction(()=>document.querySelector('.supplied-video').currentTime>.2);
  await page.locator('.supplied-video').evaluate(video=>video.pause());
  await page.screenshot({path:`work/qa/${name}-red-preview.png`});
  assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);
  await page.getByLabel('Preview sticker', { exact: true }).selectOption('cet');
  await page.getByRole('button',{name:'Play video'}).click();await page.getByRole('button',{name:'Pause video'}).waitFor();
  await page.getByRole('button',{name:'Back to scanner'}).click();await page.getByRole('button',{name:'Try camera again'}).waitFor();
  assert.ok(!(await page.locator('body').innerText()).includes('CET'));
  assert.deepEqual(errors,[]); console.log(name,JSON.stringify(metadata),'CET preview and camera recovery pass');await page.close();
 }
 const page=await browser.newPage({viewport:{width:393,height:852}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.addInitScript(()=>{navigator.mediaDevices.getUserMedia=async()=>{
  const canvas=document.createElement('canvas');canvas.width=960;canvas.height=720;const ctx=canvas.getContext('2d');
  const images=await Promise.all(['red-no-rush','cet'].map(async id=>{const im=new Image();im.src=`/stickers/${id}/target.jpg`;await im.decode();return im;}));
  window.syntheticTarget=0;const timer=setInterval(()=>{ctx.fillStyle='#aaa69f';ctx.fillRect(0,0,960,720);if(window.syntheticTarget>=0)ctx.drawImage(images[window.syntheticTarget],260,140,440,440);},50);
  const stream=canvas.captureStream(20);const track=stream.getVideoTracks()[0];const stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);window.syntheticStopped=true;stop();};return stream;
 };});
 await page.goto(origin+'/');
 await page.getByText('Red No Rush is in motion',{exact:false}).waitFor({state:'attached',timeout:60000});
 await page.getByRole('button',{name:'Replay animation'}).click();
 await page.screenshot({path:'work/qa/red-tracking-frame-a.png'});
 await page.waitForTimeout(500);await page.screenshot({path:'work/qa/red-tracking-frame-b.png'});
 await page.evaluate(()=>window.syntheticTarget=-1);await page.locator('[data-scan-state="lost"]').waitFor({state:'attached',timeout:30000});
 await page.evaluate(()=>window.syntheticTarget=1);await page.getByText('CET is in motion',{exact:false}).waitFor({state:'attached',timeout:30000});
 await page.evaluate(()=>window.syntheticTarget=0);await page.getByText('Red No Rush is in motion',{exact:false}).waitFor({state:'attached',timeout:30000});
 await page.getByRole('button',{name:'Preview',exact:false}).click();await page.waitForFunction(()=>window.syntheticStopped);
 assert.deepEqual(errors,[]);
 const result={syntheticCamera:true,redDetection:true,cetDetection:true,switching:true,loss:true,reacquisition:true,replay:true,cameraCleanup:true,pageErrors:errors};await writeFile('work/qa/collection-results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{await browser.close();}
