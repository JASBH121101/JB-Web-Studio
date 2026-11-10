const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');
const read = (file) => fs.readFileSync(path.join(root, file), 'utf8');

const html = read('index.html');
const css = read('styles.css');
const js = read('script.js');

test('all primary navigation links have visible names and valid section targets', () => {
  const nav = html.match(/<nav\b[^>]*class="nav"[^>]*>([\s\S]*?)<\/nav>/);
  assert.ok(nav, 'primary navigation landmark must exist');

  const anchors = [...nav[1].matchAll(/<a\b([^>]*)>([\s\S]*?)<\/a>/g)];
  assert.equal(anchors.length, 4, 'expected three section links and one contact link');

  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  for (const [, attributes, content] of anchors) {
    const href = attributes.match(/\bhref="#([^"]+)"/);
    const accessibleText = content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
    assert.ok(accessibleText.length > 0, 'each navigation link must have visible text');
    assert.ok(href && ids.has(href[1]), 'navigation target must exist: ' + (href?.[1] || 'missing href'));
  }
});

test('desktop and mobile navigation links provide at least a 44px target height', () => {
  assert.match(css, /\.nav\s*>\s*a\s*\{[^}]*min-height\s*:\s*44px/s);
});

test('mobile navigation button is explicitly associated with its navigation landmark', () => {
  assert.match(html, /<button[^>]*type="button"[^>]*aria-controls="primary-navigation"[^>]*aria-expanded="false"/);
  assert.match(html, /<nav[^>]*id="primary-navigation"/);
  assert.match(js, /setAttribute\('aria-expanded',String\(open\)\)/);
  assert.match(js, /setAttribute\('aria-expanded','false'\)/);
});

test('all in-page links point to existing elements', () => {
  const ids = new Set([...html.matchAll(/\bid="([^"]+)"/g)].map((match) => match[1]));
  const fragments = [...html.matchAll(/\bhref="#([^"]+)"/g)].map((match) => match[1]).filter(Boolean);
  assert.ok(fragments.length >= 7, 'expected working in-page navigation links');
  for (const id of fragments) assert.ok(ids.has(id), 'missing in-page target: #' + id);
});

test('English and Spanish translation dictionaries contain identical keys', () => {
  const en = JSON.parse(read('locales/en/translation.json'));
  const es = JSON.parse(read('locales/es/translation.json'));
  assert.deepEqual(Object.keys(es).sort(), Object.keys(en).sort());
  for (const [key, value] of Object.entries(en)) {
    assert.equal(typeof value, 'string', 'English translation must be text: ' + key);
    assert.ok(value.trim(), 'English translation cannot be empty: ' + key);
  }
  for (const [key, value] of Object.entries(es)) {
    assert.equal(typeof value, 'string', 'Spanish translation must be text: ' + key);
    assert.ok(value.trim(), 'Spanish translation cannot be empty: ' + key);
  }
});

test('localized markup is rendered through the allowlisted translation renderer', () => {
  assert.match(js, /const safeTranslationTags=new Set\(\['BR','EM','I','SPAN'\]\)/);
  assert.match(js, /function setSafeTranslation\(target,value\)/);
  assert.match(js, /target\.replaceChildren\(fragment\)/);
  assert.doesNotMatch(js, /\.innerHTML\b|insertAdjacentHTML/);
});

test('contact action uses the configured email address', () => {
  assert.match(html, /href="mailto:jaredblancoh19@gmail\.com\?subject=Project%20inquiry"/);
});

test('language control is a direct two-language switch, not a dropdown', () => {
  assert.match(html, /<button[^>]*id="language-toggle"[^>]*aria-label="Switch language to Spanish"/);
  assert.doesNotMatch(html, /<select[^>]*id="language-select"/);
  assert.match(js, /toggle\.addEventListener\('click'/);
  assert.match(js, /const next=window\.i18next\.language\.startsWith\('es'\)\?'en':'es'/);
  assert.match(css, /\.language-toggle[^}]*min-height:\s*44px/s);
});


test('SEO metadata and structured data are present', () => {
  assert.match(html, /<title>JB Web Studio \| Web Design &amp; Development Portfolio<\/title>/);
  assert.match(html, /<meta name="robots" content="index,follow">/);
  assert.match(html, /<link rel="canonical" href="https:\/\/jb-web-studio-ccj\.pages\.dev\/">/);
  assert.match(html, /property="og:title"/);
  assert.match(html, /name="twitter:card"/);
  assert.match(html, /application\/ld\+json/);
  assert.match(read('robots.txt'), /Sitemap: https:\/\/jb-web-studio-ccj\.pages\.dev\/sitemap\.xml/);
  assert.match(read('sitemap.xml'), /<loc>https:\/\/jb-web-studio-ccj\.pages\.dev\/<\/loc>/);
});

test('portfolio distinguishes its live project from concept studies', () => {
  assert.match(html, /class="project-card project-live"/);
  assert.match(html, /href="https:\/\/jb-collections\.pages\.dev\//);
  assert.match(html, /class="project-tag">LIVE PROJECT<\/span>/);
  assert.match(html, /JB Collections is a live project/);
  assert.match(html, /class="project-card project-featured"/);
  assert.match(html, /class="project-card project-store"/);
  assert.match(html, /class="project-card project-dashboard"/);
});
