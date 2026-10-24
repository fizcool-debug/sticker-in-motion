import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const adb=(process.env.ANDROID_HOME||'C:/Users/Bhawesh/AppData/Local/Android/Sdk')+'/platform-tools/adb.exe';
const serial=process.env.ANDROID_TEST_DEVICE||'emulator-5554';
const shell=(...args)=>execFileSync(adb,['-s',serial,'shell',...args],{encoding:'utf8'});
await mkdir('work/qa/android',{recursive:true});
const screenshot=async name=>writeFile(`work/qa/android/${name}.png`,execFileSync(adb,['-s',serial,'exec-out','screencap','-p'],{maxBuffer:16*1024*1024}));
const b=await chromium.connectOverCDP('http://127.0.0.1:9222');
try{
const p=b.contexts()[0].pages()[0];const errors=[];p.on('pageerror',e=>errors.push(e.message));
await p.locator('[data-scan-state="scanning"]').waitFor({timeout:45000});
const camera=await p.locator('.camera-surface video').evaluate(v=>({width:v.videoWidth,height:v.videoHeight,live:v.srcObject.getVideoTracks()[0].readyState}));assert.ok(camera.width>0&&camera.height>0&&camera.live==='live');
assert.equal(await p.locator('.scanner .topbar, .scanner .scan-panel').count(),0);
await p.waitForFunction(()=>!document.querySelector('.camera-hint'));
await screenshot('scanner');
await p.getByRole('button',{name:'Preview',exact:false}).click();
assert.equal(await p.locator('.camera-surface video').count(),0);
await p.getByLabel('Preview sticker', { exact: true }).selectOption('red-no-rush');await p.locator('.supplied-video').evaluate(v=>v.play());await p.waitForFunction(()=>document.querySelector('.supplied-video')?.currentTime>.2);
await p.locator('.supplied-video').evaluate(v=>v.pause());
await screenshot('red-preview');
await p.getByRole('button',{name:'View the sticker artwork'}).click();await p.getByAltText('Red No Rush original sticker artwork').waitFor();
shell('input','keyevent','4');await p.locator('.supplied-video').waitFor();
await p.getByLabel('Preview sticker', { exact: true }).selectOption('cet');await p.getByRole('button',{name:'Play video'}).click();await p.getByRole('button',{name:'Pause video'}).waitFor();
shell('input','keyevent','4');await p.locator('[data-scan-state="scanning"]').waitFor({timeout:30000});
shell('input','keyevent','3');await p.waitForTimeout(1500);shell('am','start','-n','com.fizcool.stickerinmotion/.MainActivity');await p.getByRole('button',{name:'Resume camera'}).waitFor();assert.equal(await p.locator('.camera-surface video').count(),0);
await p.getByRole('button',{name:'Resume camera'}).click();await p.locator('[data-scan-state="scanning"]').waitFor({timeout:30000});
shell('settings','put','system','font_scale','1.3');await new Promise(r=>setTimeout(r,2000));const scaled=await chromium.connectOverCDP('http://127.0.0.1:9222');await scaled.contexts()[0].pages()[0].locator('[data-scan-state="scanning"]').waitFor({timeout:30000});await screenshot('font-scale-130');await scaled.close();
shell('settings','put','system','font_scale','1.0');shell('settings','put','system','accelerometer_rotation','0');shell('settings','put','system','user_rotation','1');await new Promise(r=>setTimeout(r,2000));const rotated=await chromium.connectOverCDP('http://127.0.0.1:9222');const landscape=rotated.contexts()[0].pages()[0];await landscape.locator('[data-scan-state="scanning"]').waitFor({timeout:30000});await screenshot('landscape');assert.equal(await landscape.evaluate(()=>document.documentElement.scrollWidth>innerWidth),false);await rotated.close();
shell('settings','put','system','user_rotation','0');shell('settings','put','system','accelerometer_rotation','1');
assert.deepEqual(errors,[]);const result={device:'Android API 37 emulator; not Redmi hardware',camera,previewPlayback:true,artworkBack:true,previewBack:true,backgroundCameraCleanup:true,resume:true,fontScaleScreenshot:true,landscape:true,pageErrors:errors};await writeFile('work/qa/android/results.json',JSON.stringify(result,null,2));console.log(JSON.stringify(result));
}finally{shell('settings','put','system','font_scale','1.0');shell('settings','put','system','user_rotation','0');shell('settings','put','system','accelerometer_rotation','1');await b.close();}



