import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { mkdir, writeFile } from 'node:fs/promises';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Users/Bhawesh/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const browser = await chromium.launch({ executablePath:'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless:true });
const results = [];
const origin = process.env.CET_TEST_ORIGIN || 'http://localhost:5173';
try {
  await mkdir('work/qa',{recursive:true});
  for (const [name, viewport] of [['mobile',{width:393,height:852}],['desktop',{width:1440,height:900}]]) {
    const context = await browser.newContext({ viewport });
    await context.addInitScript(() => {
      navigator.mediaDevices.getUserMedia = async () => { throw new DOMException('Camera denied for test','NotAllowedError'); };
    });
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror',e => errors.push(e.message));
    await page.goto(origin + '/');
    await page.getByRole('button',{name:'Try camera again'}).waitFor({timeout:30000});
    assert.equal(await page.title(), 'Sticker in Motion');
    assert.ok(!(await page.locator('body').innerText()).includes('CET'), 'Scanner must not use the test sticker as its identity');
    await page.screenshot({path:`work/qa/${name}-camera.png`});
    await page.getByRole('button',{name:'Scanning tips'}).click();
    await page.getByText('Use the original print',{exact:false}).waitFor();
    await page.getByRole('button',{name:'Close tips'}).click();
    await page.getByRole('button',{name:'Preview',exact:false}).click();
    await page.getByLabel('Preview sticker').selectOption('cet');
    await page.getByRole('button',{name:'Play video'}).waitFor({timeout:30000});
    await page.getByText('4 × 4 in',{exact:true}).waitFor();
    await page.getByRole('button',{name:'Play video'}).click();
    await page.getByRole('button',{name:'Pause video'}).waitFor();
    await page.waitForFunction(() => {
      const layer = document.querySelector('img[src$="rainbow.png"]')?.parentElement;
      return layer?.style.clipPath.match(/([\d.]+)%/)?.[1] === '0';
    });
    await page.screenshot({path:`work/qa/${name}-preview.png`});
    await page.getByRole('button',{name:'Pause video'}).click();
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth);
    if (errors.length || overflow) throw Error(`${name}: ${JSON.stringify({errors,overflow})}`);
    await page.getByRole('button',{name:'Back to scanner'}).click();
    await page.getByRole('button',{name:'Try camera again'}).waitFor();
    results.push({name,permissionRecovery:true,previewPlayback:true,noOverflow:true,noPageErrors:true});
    await context.close();
  }
  console.log(JSON.stringify(results));
  await writeFile('work/qa/browser-results.json',JSON.stringify(results,null,2));
} finally { await browser.close(); }
