// Browser smoke test of the Stone Age film in the preview studio. Requires `npm run studio` to be running.
const {chromium} = require('playwright');
const URL_ = (process.argv[2] || 'http://127.0.0.1:5173') + '/?film=stone';
const results = [];
const check = (name, ok, extra = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};
const clockSecs = async (page) => {
  const [m, s] = (await page.locator('.clock b').innerText()).split(':').map(parseFloat);
  return m * 60 + s;
};
(async () => {
  const browser = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const page = await browser.newPage({viewport: {width: 1600, height: 950}});
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL_);
  await page.locator('.stage svg').first().waitFor({timeout: 30000});
  await page.waitForTimeout(2500);
  await page.screenshot({path: 'out/e2e-stone-1.png'});
  check('stone film selected via ?film=stone', (await page.locator('select[aria-label="Film"]').inputValue()) === 'stone');
  check('timeline shows 7 scenes', (await page.locator('.timeline .seg').count()) === 7);
  check('total duration is 03:40', /\/ 03:40/.test(await page.locator('.clock').innerText()), await page.locator('.clock').innerText());
  const t0 = await clockSecs(page);
  await page.getByRole('button', {name: 'Play', exact: true}).click();
  await page.waitForTimeout(2500);
  check('play advances', (await clockSecs(page)) > t0 + 1);
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  const box = await page.locator('.timeline').boundingBox();
  await page.mouse.click(box.x + box.width * 0.5, box.y + 20);
  await page.waitForTimeout(900);
  const mid = await clockSecs(page);
  check('timeline scrubs to ~1:50', mid > 100 && mid < 120, `${mid}s`);
  await page.screenshot({path: 'out/e2e-stone-2.png'});
  await page.locator('.sceneBtn', {hasText: 'Nightfall'}).click();
  await page.waitForTimeout(600);
  check('scene select seeks to nightfall (3:05)', Math.abs((await clockSecs(page)) - 185) < 1, `${await clockSecs(page)}`);
  await page.getByLabel('Narration text').fill('A new *line* about fire.');
  await page.waitForTimeout(300);
  check('narration edit updates cues', /new line about fire/i.test(await page.locator('.cues').innerText()));
  await page.getByRole('button', {name: 'Render', exact: true}).click();
  check('render panel shows the stone script', (await page.locator('.code').innerText()).includes('npm run render:stone:props'));
  await page.waitForTimeout(1800);
  check('render enabled', await page.getByRole('button', {name: 'Render MP4 now'}).isEnabled());
  await page.locator('select[aria-label="Film"]').selectOption('zihni');
  await page.waitForTimeout(2500);
  check('switching film loads the other project', (await page.locator('.timeline .seg').count()) === 10);
  check('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('E2E crashed:', e);
  process.exit(2);
});
