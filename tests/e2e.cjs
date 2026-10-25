// Browser smoke test of the preview studio. Requires `npm run studio` to be running.
// Usage: node tests/e2e.cjs [http://127.0.0.1:5173]
const {chromium} = require('playwright');
const path = require('node:path');
const URL_ = process.argv[2] || 'http://127.0.0.1:5173';
const results = [];
const check = (name, ok, extra = '') => {
  results.push(ok);
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${name}${extra ? ` — ${extra}` : ''}`);
};
const clockSecs = async (page) => {
  const t = await page.locator('.clock b').innerText();
  const [m, s] = t.split(':').map(parseFloat);
  return m * 60 + s;
};

(async () => {
  const browser = await chromium.launch({args: ['--autoplay-policy=no-user-gesture-required']});
  const page = await browser.newPage({viewport: {width: 1600, height: 950}});
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  page.on('console', (m) => m.type() === 'error' && errors.push(m.text()));
  await page.goto(URL_);
  await page.locator('.stage svg').first().waitFor({timeout: 20000});
  await page.waitForTimeout(1500);
  await page.screenshot({path: 'out/e2e-1-load.png'});
  check('studio loads with preview', await page.locator('.stage').isVisible());
  check('timeline shows 10 scenes', (await page.locator('.timeline .seg').count()) === 10);
  check('total duration displayed', /\/ 01:3\d/.test(await page.locator('.clock').innerText()), await page.locator('.clock').innerText());

  // Play / pause
  const t0 = await clockSecs(page);
  await page.getByRole('button', {name: 'Play', exact: true}).click();
  await page.waitForTimeout(2500);
  const t1 = await clockSecs(page);
  check('play advances the clock', t1 > t0 + 1, `${t0} -> ${t1}`);
  await page.getByRole('button', {name: 'Pause', exact: true}).click();
  await page.waitForTimeout(300);
  const t2 = await clockSecs(page);
  await page.waitForTimeout(800);
  check('pause stops the clock', Math.abs((await clockSecs(page)) - t2) < 0.15);

  // Scrub by clicking the timeline
  const box = await page.locator('.timeline').boundingBox();
  await page.mouse.click(box.x + box.width * 0.5, box.y + 20);
  await page.waitForTimeout(500);
  const mid = await clockSecs(page);
  check('timeline click scrubs to ~50%', mid > 40 && mid < 50, `${mid}s`);
  check('scene 5/6 highlighted at midpoint', /seg on/.test(await page.locator('.timeline .seg.on .n').evaluate((e) => e.parentElement.className)));
  await page.screenshot({path: 'out/e2e-2-scrub.png'});

  // Scene selection + replay
  await page.locator('.sceneBtn', {hasText: 'The Body Joins In'}).click();
  await page.waitForTimeout(400);
  const s6 = await clockSecs(page);
  check('selecting a scene seeks to its start', Math.abs(s6 - 42.5) < 0.6, `${s6}s`);
  await page.getByRole('button', {name: /Replay scene 6/}).click();
  await page.waitForTimeout(1500);
  check('replay scene plays from the scene start', (await clockSecs(page)) > s6 + 0.8);
  await page.getByRole('button', {name: 'Pause', exact: true}).click();

  // Editable duration
  const metaBefore = await page.locator('.meta').innerText();
  const dur = page.getByLabel('Duration (s)');
  await dur.fill('12');
  await page.waitForTimeout(500);
  const metaAfter = await page.locator('.meta').innerText();
  check('editing a scene duration changes the total', metaBefore !== metaAfter, `${metaBefore} => ${metaAfter}`);

  // Editable narration -> subtitle cues
  const ta = page.getByLabel('Narration text');
  await ta.fill('A brand new line. *Edited* narration works.');
  await page.waitForTimeout(300);
  const cueText = await page.locator('.cues').innerText();
  check('narration edit updates subtitle preview', /brand new line/i.test(cueText) && /Edited/.test(cueText));
  await page.locator('.cues button').first().click();
  await page.waitForTimeout(600);
  await page.screenshot({path: 'out/e2e-3-edit.png'});
  const stageText = await page.locator('.stage').innerText();
  check('subtitle appears in the preview', /brand new line|new line/i.test(stageText), JSON.stringify(stageText.slice(0, 60)));

  // Toggles
  await page.getByRole('button', {name: 'Audio & effects'}).click();
  await page.getByText('Subtitles', {exact: true}).click();
  await page.waitForTimeout(500);
  check('subtitle toggle hides subtitles', !/new line/i.test(await page.locator('.stage').innerText()));
  await page.getByText('Subtitles', {exact: true}).click();
  const grainBefore = await page.locator('.stage canvas').count();
  await page.getByText('Film grain', {exact: true}).click();
  await page.waitForTimeout(400);
  check('grain toggle removes the grain canvas', grainBefore === 1 && (await page.locator('.stage canvas').count()) === 0, `${grainBefore} -> ${await page.locator('.stage canvas').count()}`);
  await page.getByText('Film grain', {exact: true}).click();
  await page.getByText(/Visual effects/).click();
  await page.waitForTimeout(300);
  check('effects toggle hides line-boil filter', (await page.locator('.stage filter#boil').count()) === 0);
  await page.getByText(/Visual effects/).click();
  await page.getByText('Background music', {exact: true}).click();
  await page.getByText('Background music', {exact: true}).click();

  // Narration import + fit to audio
  await page.getByLabel('Import narration').setInputFiles(path.resolve('public/audio/ambient.wav'));
  await page.waitForSelector('.notice.ok', {timeout: 10000});
  check('narration import accepted', /Narration loaded \(40\.0 s\)/.test(await page.locator('.notice').innerText()), await page.locator('.notice').innerText());
  await page.getByRole('button', {name: 'Fit scene durations to audio'}).click();
  await page.waitForTimeout(800);
  const total = await page.locator('.meta').innerText();
  check('fit-to-audio retimes the film to ~40 s', /00:(39|40)|00:4[01]/.test(total), total);
  await page.getByRole('button', {name: 'Remove narration'}).click();

  // Corrupt audio is rejected gracefully
  await page.getByLabel('Import narration').setInputFiles({name: 'bad.wav', mimeType: 'audio/wav', buffer: Buffer.from('not audio')});
  await page.waitForSelector('.notice.error', {timeout: 10000});
  check('invalid audio shows an error, no crash', /could not be decoded|Could not read/i.test(await page.locator('.notice').innerText()));

  // Render panel
  await page.getByRole('button', {name: 'Render', exact: true}).click();
  check('render panel shows the CLI workflow', (await page.locator('.code').innerText()).includes('npm run render:props'));
  await page.waitForTimeout(1800);
  check('render button enabled when API is available', await page.getByRole('button', {name: 'Render MP4 now'}).isEnabled());

  check('no console/page errors', errors.length === 0, errors.slice(0, 3).join(' | '));
  await browser.close();
  const failed = results.filter((r) => !r).length;
  console.log(`\n${results.length - failed}/${results.length} checks passed`);
  process.exit(failed ? 1 : 0);
})().catch((e) => {
  console.error('E2E crashed:', e);
  process.exit(2);
});
