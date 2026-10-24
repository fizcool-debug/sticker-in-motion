import { adbPath } from './browser-tools.mjs';
import {execFileSync} from 'node:child_process';
import {mkdir, writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
import { chromium } from 'playwright';
const adb = adbPath();
const serial = process.env.ANDROID_TEST_DEVICE || 'emulator-5554';
await mkdir('work/qa/android', {recursive:true});
const shot = async name => writeFile(`work/qa/android/${name}.png`, execFileSync(adb, ['-s',serial,'exec-out','screencap','-p'], {maxBuffer:16*1024*1024}));
const browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
try {
  const page = browser.contexts()[0].pages()[0];
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.locator('[data-scan-state="scanning"]').waitFor({timeout:60000});
  assert.equal(await page.locator('.scanner .topbar, .scanner .scan-panel').count(), 0);
  await page.getByRole('button', {name:'Preview stickers'}).click();
  await page.getByLabel('Preview sticker').selectOption('aeris');
  assert.equal(await page.getByLabel('Preview sticker').locator('option').count(), 4);
  await page.locator('.supplied-video').evaluate(video => video.play());
  await page.waitForFunction(() => document.querySelector('.supplied-video').currentTime > .3);
  const preview = await page.locator('.supplied-video').evaluate(video => ({duration:video.duration,width:video.videoWidth,height:video.videoHeight}));
  assert.deepEqual(preview, {duration:10,width:810,height:1170});
  const layout = await page.locator('.supplied-video').evaluate(video => ({ratio:video.getBoundingClientRect().width/video.getBoundingClientRect().height, overflow:document.documentElement.scrollWidth>innerWidth}));
  assert.ok(Math.abs(layout.ratio-810/1170)<.001);
  assert.equal(layout.overflow, false);
  await shot('aeris-preview');
  await page.getByRole('button', {name:'View the sticker artwork'}).click();
  await page.getByAltText('Aeris original sticker artwork').waitFor();
  await shot('aeris-original-artwork');
  await page.getByRole('button', {name:'Return to animation'}).click();
  await page.evaluate(() => {
    window.fixtureVideos = [];
    const create = document.createElement.bind(document);
    document.createElement = function(name, options) {
      const element = create(name, options);
      if (name === 'video') window.fixtureVideos.push(element);
      return element;
    };
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas'); canvas.width = 960; canvas.height = 720;
      const context = canvas.getContext('2d');
      const images = await Promise.all(['aeris','garden-fizcool','red-no-rush','cet'].map(async id => {
        const image = new Image(); image.src = `/stickers/${id}/target.jpg`; await image.decode(); return image;
      }));
      window.syntheticTarget = 0;
      const timer = setInterval(() => {
        context.fillStyle = '#aaa69f'; context.fillRect(0,0,960,720);
        if (window.syntheticTarget >= 0) {
          const image = images[window.syntheticTarget];
          const height = 460; const width = height * image.naturalWidth / image.naturalHeight;
          context.drawImage(image, (960-width)/2, 110, width, height);
        }
      }, 50);
      const stream = canvas.captureStream(20);
      const track = stream.getVideoTracks()[0]; const stop = track.stop.bind(track);
      track.stop = () => {clearInterval(timer); stop();};
      return stream;
    };
  });
  await page.getByRole('button', {name:'Back to scanner'}).click();
  await page.getByText('Aeris is in motion', {exact:false}).waitFor({state:'attached',timeout:60000});
  await page.waitForFunction(() => window.fixtureVideos.some(video => video.src.includes('/aeris/animation.mp4') && video.currentTime>2.5 && !video.paused));
  await shot('aeris-tracked-animation');
  await page.getByRole('button', {name:'Replay animation'}).click();
  await page.waitForFunction(() => window.fixtureVideos.find(video => video.src.includes('/aeris/animation.mp4')).currentTime < .5);
  await page.evaluate(() => window.syntheticTarget = -1);
  await page.locator('[data-scan-state="lost"]').waitFor({timeout:30000});
  assert.equal(await page.evaluate(() => window.fixtureVideos.find(video => video.src.includes('/aeris/animation.mp4')).paused), true);
  for (const [index,name] of [[1,'Fizcool Garden'],[2,'Red No Rush'],[3,'CET'],[0,'Aeris']]) {
    await page.evaluate(index => window.syntheticTarget=index, index);
    await page.getByText(`${name} is in motion`, {exact:false}).waitFor({state:'attached',timeout:45000});
  }
  await page.evaluate(() => window.fixtureArVideo=window.fixtureVideos.find(video=>video.src.includes('/aeris/animation.mp4')));
  await page.getByRole('button', {name:'Preview stickers'}).click();
  await page.waitForFunction(() => window.fixtureArVideo.getAttribute('src')===null && window.fixtureArVideo.paused);
  assert.deepEqual(errors, []);
  const result = {androidWebView:true,syntheticCamera:true,preview,allFourTargets:true,aerisAutoplay:true,replay:true,pauseOnLoss:true,decoderCleanup:true,pageErrors:errors,physicalDevice:false};
  await writeFile('work/qa/android/aeris-results.json', JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
  await page.reload();
  await page.getByRole('button', {name:'Back to scanner'}).click();
  await page.locator('[data-scan-state="scanning"]').waitFor({timeout:60000});
} finally {await browser.close();}
