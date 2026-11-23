import {chromium} from 'playwright';
import {adbPath} from './browser-tools.mjs';
import {execFileSync} from 'node:child_process';
import {mkdir,writeFile} from 'node:fs/promises';
import assert from 'node:assert/strict';
const serial = process.env.ANDROID_TEST_DEVICE || 'emulator-5554';
const adb = adbPath();
await mkdir('work/qa/android', {recursive:true});
const shot = async name => writeFile(`work/qa/android/${name}.png`,execFileSync(adb,['-s',serial,'exec-out','screencap','-p'],{maxBuffer:16*1024*1024}));
const browser = await chromium.connectOverCDP(process.env.ANDROID_CDP_URL || 'http://127.0.0.1:9222');
try {
  const page = browser.contexts()[0].pages()[0];
  const errors = []; page.on('pageerror', error => errors.push(error.message));
  await page.goto('https://localhost/#preview');
  const selector = page.getByLabel('Preview sticker', {exact:true});
  await selector.waitFor();
  assert.equal(await selector.locator('option').count(),6);
  const previewResults = [];
  for (const id of ['something-went-wrong','drone-delivery']) {
    await selector.selectOption(id);
    const player = page.locator(`[data-atlas-preview="${id}"]`);
    await player.getByRole('button',{name:'Play video'}).click();
    await player.getByRole('button',{name:'Pause video'}).waitFor();
    const first = await player.locator('img').evaluate(image => image.src+image.style.left+image.style.top);
    await page.waitForFunction(({id,first}) => {
      const image = document.querySelector(`[data-atlas-preview="${id}"] img`);
      return image && image.src+image.style.left+image.style.top !== first;
    }, {id,first});
    await player.getByRole('button',{name:'Pause video'}).click();
    assert.equal(await page.evaluate(() => document.documentElement.scrollWidth>innerWidth),false);
    await shot(`${id}-preview`);
    previewResults.push({id,playingFrames:true,noOverflow:true});
  }
  await page.evaluate(() => {
    const getContext = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function(type, options) {
      return getContext.call(this,type,type.startsWith('webgl')?{...options,preserveDrawingBuffer:true}:options);
    };
    navigator.mediaDevices.getUserMedia = async () => {
      const canvas = document.createElement('canvas'); canvas.width=960; canvas.height=720;
      const context = canvas.getContext('2d');
      const images = await Promise.all(['something-went-wrong','drone-delivery','aeris','garden-fizcool','red-no-rush','cet'].map(async id => {
        const image = new Image(); image.src=`/stickers/${id}/target.jpg`; await image.decode(); return image;
      }));
      window.syntheticTarget=0;
      const timer=setInterval(() => {
        context.fillStyle='#70a481'; context.fillRect(0,0,960,720);
        if(window.syntheticTarget>=0){const image=images[window.syntheticTarget];const height=window.syntheticTarget<2?600:460;const width=height*image.naturalWidth/image.naturalHeight;context.drawImage(image,(960-width)/2,(720-height)/2,width,height);}
      },50);
      const stream=canvas.captureStream(20);const track=stream.getVideoTracks()[0];const stop=track.stop.bind(track);track.stop=()=>{clearInterval(timer);stop();};return stream;
    };
  });
  await page.getByRole('button',{name:'Back to scanner'}).click();
  const alphaResults=[];
  for (const [index,id,name] of [[0,'something-went-wrong','Something Went Wrong (UFO)'],[1,'drone-delivery','Drone Delivery']]) {
    await page.evaluate(index=>window.syntheticTarget=index,index);
    await page.getByText(`${name} is in motion`,{exact:false}).waitFor({state:'attached',timeout:60000});
    await page.waitForTimeout(650);
    const alpha = await page.locator('.camera-surface canvas').evaluate(canvas => {
      const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');
      const width=gl.drawingBufferWidth,height=gl.drawingBufferHeight,pixels=new Uint8Array(width*height*4);
      gl.readPixels(0,0,width,height,gl.RGBA,gl.UNSIGNED_BYTE,pixels);
      let count=0,white=0,minX=width,minY=height,maxX=-1,maxY=-1;
      for(let y=0;y<height;y+=3)for(let x=0;x<width;x+=3){const i=(y*width+x)*4;if(pixels[i+3]>32){count++;minX=Math.min(minX,x);maxX=Math.max(maxX,x);minY=Math.min(minY,y);maxY=Math.max(maxY,y);if(pixels[i]>230&&pixels[i+1]>230&&pixels[i+2]>230&&pixels[i+3]>230)white++;}}
      return {preserved:gl.getContextAttributes().preserveDrawingBuffer,drawnSamples:count,whiteSamples:white,occupiedFraction:count/(((maxX-minX)/3+1)*((maxY-minY)/3+1))};
    });
    assert.equal(alpha.preserved,true);
    assert.ok(alpha.drawnSamples>500,'Tracked artwork must be rendered');
    assert.ok(alpha.occupiedFraction<.9,'The artwork must not render as an opaque rectangular background');
    assert.ok(alpha.whiteSamples>4,'White artwork details must remain visible');
    await shot(`${id}-transparent-ar`);
    await page.getByRole('button',{name:'Replay animation'}).click();
    alphaResults.push({id,...alpha,replay:true});
    await page.evaluate(()=>window.syntheticTarget=-1);
    await page.locator('[data-scan-state="lost"]').waitFor({timeout:30000});
    const visibility = await page.locator('.camera-surface canvas').evaluate(canvas => {
      const gl=canvas.getContext('webgl2')||canvas.getContext('webgl');const pixels=new Uint8Array(gl.drawingBufferWidth*gl.drawingBufferHeight*4);gl.readPixels(0,0,gl.drawingBufferWidth,gl.drawingBufferHeight,gl.RGBA,gl.UNSIGNED_BYTE,pixels);let visible=0;for(let i=3;i<pixels.length;i+=4)if(pixels[i]>32)visible++;return visible;
    });
    assert.equal(visibility,0,'Animation must disappear when tracking is lost');
  }
  for(const [index,name] of [[2,'Aeris'],[3,'Fizcool Garden'],[4,'Red No Rush'],[5,'CET'],[0,'Something Went Wrong (UFO)']]){
    await page.evaluate(index=>window.syntheticTarget=index,index);
    await page.getByText(`${name} is in motion`,{exact:false}).waitFor({state:'attached',timeout:60000});
  }
  await page.getByRole('button',{name:'Preview stickers'}).click();
  assert.equal(await page.locator('.camera-surface canvas,.camera-surface video').count(),0);
  assert.deepEqual(errors,[]);
  const result={androidWebView:true,syntheticCamera:true,previews:previewResults,alphaResults,allSixTargets:true,lossAndReacquisition:true,cameraCleanup:true,pageErrors:errors,physicalDevice:false};
  await writeFile('work/qa/android/lottie-batch-results.json',JSON.stringify(result,null,2));
  console.log(JSON.stringify(result));
  await page.goto('https://localhost/#scan');
  await page.reload();
}finally{await browser.close();}
