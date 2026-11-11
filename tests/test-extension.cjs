const { chromium } = require('playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const os = require('node:os');

(async () => {
  const extension = path.resolve(__dirname, '..');
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'reddit-nag-test-'));
  let context;
  try {
  context = await chromium.launchPersistentContext(profile, {
    channel: 'chromium',
    ...(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {}),
    headless: true,
    ignoreDefaultArgs: ['--disable-extensions'],
    args: [`--disable-extensions-except=${extension}`, `--load-extension=${extension}`]
  });
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await context.route('https://www.reddit.com/**', route => route.fulfill({
    contentType: 'text/html', body: '<!doctype html><html><head><style>body{margin:0}main{height:4000px}.scroll-is-blocked{overflow:hidden}dialog{padding:30px}</style></head><body><main id="feed"><article id="post"><h2>Get the best of Reddit in the app</h2><a>Get the Reddit App</a></article></main></body></html>'
  }));
  await page.goto('https://www.reddit.com/');
  const results = [];
  async function check(name, fn) { await fn(); results.push(name); console.log('PASS', name); }
  const prompt = '<h2>Get the best of Reddit in the app</h2><button>Get the Reddit App</button>';
  await check('Actual MV3 extension injects and removes a native modal and backdrop', async () => {
    await page.evaluate(html => { const d = document.createElement('dialog'); d.id = 'nag'; d.innerHTML = html; document.body.append(d); d.showModal(); document.body.classList.add('scroll-is-blocked'); document.body.style.overflow = 'hidden'; }, prompt);
    await page.waitForFunction(() => !document.querySelector('#nag'));
    assert.equal(await page.evaluate(() => document.querySelectorAll(':modal').length), 0);
  });
  await check('Scrolling resumes and the feed remains usable', async () => {
    assert.equal(await page.evaluate(() => document.body.classList.contains('scroll-is-blocked')), false);
    await page.mouse.wheel(0, 500);
    await page.waitForFunction(() => scrollY > 0);
    assert.equal(await page.locator('#feed').count(), 1);
  });
  await check('A user post quoting the promotion remains intact', async () => {
    assert.equal(await page.locator('#post').count(), 1);
    assert.equal(await page.locator('#post a').count(), 1);
  });
  await check('Reinserted bottom-sheet prompt is removed', async () => {
    await page.evaluate(html => { const s = document.createElement('section'); s.className = 'rpl-bottom-sheet'; s.id = 'nag2'; s.innerHTML = html; document.body.append(s); }, prompt);
    await page.waitForFunction(() => !document.querySelector('#nag2'));
  });
  await check('A fixed overlay with changed class names is removed', async () => {
    await page.evaluate(html => { const s = document.createElement('div'); s.id = 'fixed-nag'; s.style.cssText = 'position:fixed;inset:0'; s.innerHTML = html; document.body.append(s); }, prompt);
    await page.waitForFunction(() => !document.querySelector('#fixed-nag'));
  });
  await check('Prompt inside an open shadow root is removed', async () => {
    await page.evaluate(html => { const h = document.createElement('test-prompt'); h.id = 'shadow-host'; document.body.append(h); const root = h.attachShadow({mode:'open'}); root.innerHTML = `<div class="rpl-bottom-sheet" id="shadow-nag">${html}</div>`; }, prompt);
    await page.waitForFunction(() => !document.querySelector('#shadow-host').shadowRoot.querySelector('#shadow-nag'));
  });
  await check('Late-attached open shadow root is discovered', async () => {
    await page.evaluate(() => { const h = document.createElement('late-prompt'); h.id = 'late-host'; document.body.append(h); });
    await page.waitForTimeout(150);
    await page.evaluate(html => { document.querySelector('#late-host').attachShadow({mode:'open'}).innerHTML = `<div role="dialog" id="late-nag">${html}</div>`; }, prompt);
    await page.waitForFunction(() => !document.querySelector('#late-host').shadowRoot.querySelector('#late-nag'));
  });
  await check('App action in the prompt host’s own shadow root is detected', async () => {
    await page.evaluate(html => {
      const h = document.createElement('shreddit-app-prompt');
      h.id = 'own-shadow-nag';
      h.attachShadow({mode: 'open'}).innerHTML = html;
      document.body.append(h);
    }, prompt);
    await page.waitForFunction(() => !document.querySelector('#own-shadow-nag'));
  });
  await check('A nested bottom sheet closes its outer native dialog', async () => {
    await page.evaluate(html => { const d = document.createElement('dialog'); d.id = 'outer-nag'; d.innerHTML = `<div class="rpl-bottom-sheet">${html}</div>`; document.body.append(d); d.showModal(); }, prompt);
    await page.waitForFunction(() => !document.querySelector('#outer-nag'));
    assert.equal(await page.evaluate(() => document.querySelectorAll(':modal').length), 0);
  });
  await check('Ordinary report dialog is preserved, with its scroll lock', async () => {
    await page.evaluate(() => { const d = document.createElement('dialog'); d.id = 'report'; d.innerHTML = '<h2>Report this post</h2><button>Submit report</button>'; document.body.append(d); d.showModal(); document.body.classList.add('scroll-is-blocked'); });
    await page.waitForTimeout(900);
    assert.equal(await page.locator('#report').isVisible(), true);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden');
    await page.evaluate(() => { document.querySelector('#report').close(); document.querySelector('#report').remove(); document.body.classList.remove('scroll-is-blocked'); });
  });
  await check('Prompt populated after insertion is detected', async () => {
    await page.evaluate(() => { const d = document.createElement('div'); d.id = 'delayed'; d.setAttribute('role','dialog'); d.innerHTML = '<h2></h2><button></button>'; document.body.append(d); });
    await page.waitForTimeout(100);
    await page.evaluate(() => { document.querySelector('#delayed h2').textContent = 'Get the app to keep using Reddit'; document.querySelector('#delayed button').textContent = 'Get the app'; });
    await page.waitForFunction(() => !document.querySelector('#delayed'));
  });
  await check('Unrelated modal survives simultaneous app prompt removal', async () => {
    await page.evaluate(html => { const r = document.createElement('div'); r.id = 'login'; r.setAttribute('role','dialog'); r.innerHTML = '<h2>Log in</h2><button>Continue</button>'; document.body.append(r); document.body.classList.add('scroll-is-blocked'); const n = document.createElement('div'); n.id = 'simultaneous'; n.className = 'rpl-bottom-sheet'; n.innerHTML = html; document.body.append(n); }, prompt);
    await page.waitForFunction(() => !document.querySelector('#simultaneous'));
    assert.equal(await page.locator('#login').isVisible(), true);
    assert.equal(await page.evaluate(() => getComputedStyle(document.body).overflow), 'hidden');
  });
  await check('No JavaScript runtime errors', async () => assert.deepEqual(errors, []));
  console.log(`${results.length} browser fixture checks passed. Live Reddit experiments are not reproduced by these fixtures.`);
  } finally {
    if (context) await context.close();
    fs.rmSync(profile, { recursive: true, force: true });
  }
})().catch(error => { console.error(error); process.exit(1); });
