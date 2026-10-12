import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Bhawesh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true });
try {
  const studio = await browser.newPage();
  await studio.goto('http://localhost:3000/CetRainbow');
  await studio.getByText('CetRainbow', {exact:true}).first().waitFor();
  await mkdir('work/qa', {recursive:true});
  await studio.screenshot({path:'work/qa/studio.png'});
  console.log('Remotion Studio composition verified');
  const page = await browser.newPage();
  page.on('pageerror', error => console.log('Compiler page error:', error.message));
  await page.goto('http://localhost:5173/work/compiler.html');
  await page.waitForFunction(() => window.result || window.failure, { timeout: 180000 });
  const result = await page.evaluate(() => ({buffer:window.result, features:window.features, failure:window.failure}));
  if (result.failure) throw Error(result.failure);
  await writeFile('public/stickers/cet/target.mind', Buffer.from(result.buffer));
  await writeFile('work/target-report.json', JSON.stringify(result.features, null, 2));
  console.log('Compiled target bytes:',result.buffer.length,'Features:',JSON.stringify(result.features));
} finally { await browser.close(); }
