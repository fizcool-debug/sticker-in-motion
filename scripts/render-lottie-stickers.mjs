import {createRequire} from 'node:module';
import {browserOptions} from './browser-tools.mjs';
import {chromium} from 'playwright';
import {mkdir, readFile, writeFile} from 'node:fs/promises';
import path from 'node:path';
const require = createRequire(import.meta.url);
const definitions = JSON.parse(await readFile('assets/source/lottie-batch.json', 'utf8')).ready;
const browser = await chromium.launch(browserOptions());
try {
  for (const definition of definitions) {
    const data = JSON.parse(await readFile(`assets/source/${definition.id}/animation.json`, 'utf8'));
    const directory = `work/lottie-stickers/${definition.id}`;
    await mkdir(directory, {recursive:true});
    const page = await browser.newPage({viewport:{width:data.w,height:data.h},deviceScaleFactor:1});
    const errors = []; page.on('pageerror', error => errors.push(error.message));
    await page.setContent(`<html><head><style>html,body{margin:0;background:transparent}#art{width:${data.w}px;height:${data.h}px}</style></head><body><div id="art"></div></body></html>`);
    await page.addScriptTag({path:require.resolve('lottie-web/build/player/lottie.min.js')});
    await page.evaluate(data => new Promise((resolve, reject) => {
      window.animation = lottie.loadAnimation({container:document.getElementById('art'),renderer:'svg',loop:false,autoplay:false,animationData:data});
      window.animation.setSubframe(false);
      window.animation.addEventListener('DOMLoaded', () => resolve(true));
      window.animation.addEventListener('data_failed', () => reject(Error('Lottie source failed')));
    }), data);
    for (let frame = 0; frame < data.op-data.ip; frame++) {
      await page.evaluate(frame => window.animation.goToAndStop(frame,true), frame);
      await page.screenshot({path:path.join(directory,`frame-${String(frame).padStart(3,'0')}.png`),omitBackground:true});
    }
    if (errors.length) throw Error(errors.join('\n'));
    await writeFile(path.join(directory,'metadata.json'), JSON.stringify({width:data.w,height:data.h,frames:data.op-data.ip,fps:data.fr}));
    console.log(`${definition.id}: ${data.op-data.ip} original-size transparent frames`);
    await page.close();
  }
} finally {await browser.close();}
