const test = require('node:test');
const assert = require('node:assert/strict');
const { chromium } = require('playwright');

const targetUrl = process.env.TARGET_URL || 'https://jb-web-studio-ccj.pages.dev';

test('mobile menu, language switching, and desktop navigation targets work', async () => {
  const browser = await chromium.launch({ headless: true });
  const pageErrors = [];

  try {
    const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
    page.on('pageerror', (error) => pageErrors.push(error.message));

    await page.goto(targetUrl, { waitUntil: 'domcontentloaded' });
    await page.waitForFunction(() => Boolean(window.i18next && window.i18next.isInitialized));

    const menuButton = page.getByRole('button', { name: 'Open navigation' });
    assert.equal(await menuButton.getAttribute('aria-controls'), 'primary-navigation');
    assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');

    await menuButton.click();
    assert.equal(await menuButton.getAttribute('aria-expanded'), 'true');
    assert.equal(await page.locator('#primary-navigation').isVisible(), true);

    await page.locator('#primary-navigation').getByRole('link', { name: 'Work' }).click();
    await page.waitForURL(/#work$/);
    assert.equal(await menuButton.getAttribute('aria-expanded'), 'false');
    assert.equal(await page.locator('#primary-navigation').isVisible(), false);

    const languageToggle = page.locator('#language-toggle');
    assert.equal(await languageToggle.innerText(), 'EN');
    assert.equal(await languageToggle.getAttribute('aria-label'), 'Switch language to Spanish');
    await languageToggle.click();
    await page.waitForFunction(() => document.documentElement.lang === 'es');
    assert.equal(await languageToggle.innerText(), 'ES');
    assert.equal(await languageToggle.getAttribute('aria-label'), 'Cambiar idioma a inglés');
    assert.match(await page.locator('.hero h1').innerText(), /Las ideas merecen/);

    await languageToggle.click();
    await page.waitForFunction(() => document.documentElement.lang === 'en');
    assert.equal(await languageToggle.innerText(), 'EN');
    assert.match(await page.locator('.hero h1').innerText(), /Ideas deserve/);

    await page.setViewportSize({ width: 1365, height: 900 });
    const navLinks = page.locator('.nav > a');
    assert.equal(await navLinks.count(), 4);

    for (let index = 0; index < await navLinks.count(); index += 1) {
      const box = await navLinks.nth(index).boundingBox();
      assert.ok(box && box.height >= 44, 'navigation link ' + index + ' must be at least 44px high');
    }

    assert.deepEqual(pageErrors, [], 'browser must not emit uncaught JavaScript errors');
  } finally {
    await browser.close();
  }
});
