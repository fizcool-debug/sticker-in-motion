import { browserOptions, appUrl } from './browser-tools.mjs';
import {writeFile,mkdir} from 'node:fs/promises';
import { chromium } from 'playwright';
const browser=await chromium.launch(browserOptions());
try {
 await mkdir('work',{recursive:true});
 await writeFile('work/compiler.html', `<!doctype html><html><head><title>Sticker collection compiler</title></head><body><p id="status">Compiling original artwork…</p><script type="module">
 import { Compiler } from '/node_modules/mind-ar/dist/mindar-image.prod.js';
 try {
 const images=await Promise.all(['/stickers/red-no-rush/target.jpg','/stickers/cet/target.jpg','/stickers/garden-fizcool/target.jpg','/stickers/aeris/target.jpg'].map(async src=>{const im=new Image();im.src=src;await im.decode();return im;}));
 const compiler=new Compiler(); const data=await compiler.compileImageTargets(images,p=>document.querySelector('#status').textContent='Compiling '+p.toFixed(0)+'%');
 window.result=Array.from(compiler.exportData());
 window.features=data.map(d=>({matching:d.matchingData.map(k=>k.maximaPoints.length+k.minimaPoints.length),tracking:d.trackingData.map(k=>k.points.length)}));
 }catch(e){window.failure=String(e);}
 </script></body></html>`);
 const page=await browser.newPage();
 await page.goto(`${appUrl}/work/compiler.html`);
 await page.waitForFunction(()=>window.result||window.failure, null, { timeout: 240000 });
 const r=await page.evaluate(()=>({buffer:window.result,features:window.features,failure:window.failure}));
 if(r.failure)throw Error(r.failure);
 await writeFile('public/stickers/collection.mind',Buffer.from(r.buffer));
 await writeFile('work/collection-report.json',JSON.stringify(r.features,null,2));
 console.log(JSON.stringify({bytes:r.buffer.length,features:r.features}));
}finally{await browser.close();}
