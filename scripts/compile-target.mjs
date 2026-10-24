import { browserOptions, appUrl } from './browser-tools.mjs';
import { writeFile, mkdir } from 'node:fs/promises';
import { chromium } from 'playwright';
const browser = await chromium.launch(browserOptions());
try {
  const studio = await browser.newPage();
  await studio.goto('http://localhost:3000/CetRainbow');
  await studio.getByText('CetRainbow', {exact:true}).first().waitFor();
  await mkdir('work/qa', {recursive:true});
  await studio.screenshot({path:'work/qa/studio.png'});
  console.log('Remotion Studio composition verified');
  const page = await browser.newPage();
  page.on('pageerror', error => console.log('Compiler page error:', error.message));
  await page.goto(`${appUrl}/work/compiler.html`);
  await page.waitForFunction(() => window.result || window.failure, null, { timeout: 180000 });
  const result = await page.evaluate(() => ({buffer:window.result, features:window.features, failure:window.failure}));
  if (result.failure) throw Error(result.failure);
  await writeFile('public/stickers/cet/target.mind', Buffer.from(result.buffer));
  await writeFile('work/target-report.json', JSON.stringify(result.features, null, 2));
  console.log('Compiled target bytes:',result.buffer.length,'Features:',JSON.stringify(result.features));
} finally { await browser.close(); }
