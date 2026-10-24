import { browserOptions, appUrl } from './browser-tools.mjs';
import { writeFile } from 'node:fs/promises';
import { chromium } from 'playwright';
const browser = await chromium.launch(browserOptions());
try {
  const page = await browser.newPage({viewport:{width:393,height:852}});
  const errors = [];
  page.on('pageerror', e => errors.push(e.message));
  await page.addInitScript(() => {
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas'); canvas.width=960;canvas.height=720;
      const context = canvas.getContext('2d');
      const image = new Image(); image.src='/stickers/cet/target.jpg'; await image.decode();
      window.showSyntheticSticker = true;
      const timer = setInterval(() => {
        context.fillStyle='#aaa69f';context.fillRect(0,0,960,720);
        if (window.showSyntheticSticker) context.drawImage(image,260,140,440,440);
      },50);
      const stream = canvas.captureStream(20);
      const track = stream.getVideoTracks()[0];
      const original = track.stop.bind(track);
      track.stop = () => { window.syntheticStopped = true; clearInterval(timer); original(); };
      return stream;
    };
  });
  await page.goto((appUrl) + '/');
  await page.getByText('CET is in motion',{exact:false}).waitFor({state:'attached',timeout:60000});
  await page.getByRole('button',{name:'Replay animation'}).click();
  await page.screenshot({path:'work/qa/synthetic-tracking.png'});
  await page.evaluate(() => window.showSyntheticSticker=false);
  await page.locator('[data-scan-state="lost"]').waitFor({state:'attached',timeout:30000});
  await page.evaluate(() => window.showSyntheticSticker=true);
  await page.getByText('CET is in motion',{exact:false}).waitFor({state:'attached',timeout:30000});
  await page.getByRole('button',{name:'Preview',exact:false}).click();
  await page.waitForFunction(() => window.syntheticStopped);
  if(errors.length) throw Error(errors.join('\n'));
  const result = {fixture:'Synthetic canvas camera; not a real iPhone test',detection:true,loss:true,reacquisition:true,replay:true,cameraCleanup:true,pageErrors:errors};
  await writeFile('work/qa/tracking-results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
