import { chromium } from 'playwright';
import { readFile, mkdir, writeFile, mkdtemp, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createApp } from '../server.js';

const dataDirectory = await mkdtemp(path.join(tmpdir(), 'portfolio-browser-'));
const slackMessages = [];
let failSlack = true;
const server = createApp({ dataDirectory, slackWebhookUrl: 'https://hooks.slack.com/services/TEST/TEST/test', slackFetch: async (_url, options) => {
  if (failSlack) { failSlack = false; return new Response('unavailable', { status: 503 }); }
  slackMessages.push(JSON.parse(options.body));
  return new Response('ok');
} });
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const base = `http://127.0.0.1:${server.address().port}`;
const browser = await chromium.launch({ channel: 'chrome', headless: true });
try {
  await mkdir('test-results/redesign', { recursive: true });
  const page = await browser.newPage();
  page.setDefaultTimeout(10000);
  const errors = [], external = [], failures = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('request', req => { if (!req.url().startsWith(base) && !req.url().startsWith('data:')) external.push(req.url()); });
  page.on('response', res => { if (res.status() >= 400 && !res.url().endsWith('/api/contact')) failures.push(res.url()); });
  const report = [];
  for (const [name, width, height] of [['desktop',1440,1000],['mobile',390,844],['tablet',768,1024],['wide',1920,1080],['small-mobile',320,740]]) {
    await page.setViewportSize({ width, height });
    await page.goto(base, { waitUntil: 'networkidle' });
    await page.evaluate(async () => {
      await document.fonts.ready;
      for (let y = 0; y < document.body.scrollHeight; y += 700) { scrollTo({top:y,behavior:'instant'}); await new Promise(r => setTimeout(r,50)); }
      await Promise.all([...document.querySelectorAll('main img')].map(img=>img.decode()));
      scrollTo({top:0,behavior:'instant'});
    });
    await page.waitForTimeout(300);
    await page.screenshot({ path: `test-results/redesign/${name}.png`, fullPage: true });
    if (name === 'desktop') await page.screenshot({ path: 'test-results/redesign/hero.png' });
    const layout = await page.evaluate(() => ({
      width: innerWidth, scrollWidth: document.documentElement.scrollWidth,
      columns: getComputedStyle(document.querySelector('.work-grid')).gridTemplateColumns,
      ink: getComputedStyle(document.querySelector('.hero')).backgroundColor,
      pink: getComputedStyle(document.querySelector('h1')).color,
      headingFont: getComputedStyle(document.querySelector('h1')).fontFamily,
      bodyFont: getComputedStyle(document.body).fontFamily,
    }));
    if (layout.scrollWidth > width) console.log(await page.evaluate(()=>[...document.querySelectorAll('h1,h2,h3,.brand,.footer-brand,.starburst,.client-names,.pill,.project-caption')].map(e=>({class:e.className,text:e.textContent.slice(0,50),x:e.getBoundingClientRect().x,width:e.getBoundingClientRect().width,scroll:e.scrollWidth})).filter(e=>e.x+Math.max(e.width,e.scroll)>innerWidth)));
    assert.ok(layout.scrollWidth <= width, `${name}: no horizontal overflow (${layout.scrollWidth} > ${width})`);
    assert.equal(layout.ink, 'rgb(32, 6, 3)');
    assert.equal(layout.pink, 'rgb(254, 171, 218)');
    assert.ok(layout.headingFont.includes('Archivo Black'));
    assert.ok(layout.bodyFont.includes('Inter'));
    assert.equal(await page.locator('.project-card').count(), 8);
    assert.equal(await page.locator('main img').evaluateAll(imgs => imgs.filter(i => !i.complete || !i.naturalWidth).length), 0, `${name}: images loaded`);
    assert.deepEqual(await page.locator('a[href^="#"]').evaluateAll(links => links.filter(a => !document.getElementById(a.getAttribute('href').slice(1))).map(a => a.getAttribute('href'))), [], 'Every section link has a destination');
    report.push({ viewport: name, ...layout });
    if (width <= 700) {
      const menu = page.locator('.menu-toggle');
      await menu.click();
      assert.equal(await menu.getAttribute('aria-expanded'), 'true');
      await page.keyboard.press('Escape');
      assert.equal(await menu.getAttribute('aria-expanded'), 'false');
      await menu.click();
      await page.locator('#site-nav').getByRole('link', {name:'Work',exact:true}).click();
      assert.ok(page.url().endsWith('#work'));
      assert.equal(await menu.getAttribute('aria-expanded'),'false');
    } else {
      await page.locator('#site-nav').getByRole('link',{name:'Work',exact:true}).click();
      assert.ok(page.url().endsWith('#work'));
    }
    // Open a real project, navigate in both directions, and restore keyboard focus.
    const first = page.locator('.project-card').first();
    await first.click();
    assert.equal(await page.locator('#project-dialog').evaluate(e=>e.open),true);
    await page.locator('#project-detail-image').evaluate(img=>img.decode());
    assert.equal(await page.locator('#project-counter').textContent(),'1 / 8');
    await page.keyboard.press('ArrowRight');
    assert.equal(await page.locator('#project-counter').textContent(),'2 / 8');
    await page.getByRole('button',{name:'Previous project',exact:true}).click();
    assert.equal(await page.locator('#project-counter').textContent(),'1 / 8');
    await page.keyboard.press('Escape');
    assert.equal(await page.locator('#project-dialog').evaluate(e=>e.open),false);
    assert.equal(await first.evaluate(e=>document.activeElement===e),true);
  }
  await page.setViewportSize({width:1440,height:1000});
  await page.goto(base,{waitUntil:'networkidle'});
  const initial = await page.locator('.ticker-track').first().evaluate(e=>getComputedStyle(e).transform);
  await page.waitForTimeout(120);
  assert.notEqual(await page.locator('.ticker-track').first().evaluate(e=>getComputedStyle(e).transform),initial);
  await page.emulateMedia({reducedMotion:'reduce'});
  assert.equal(await page.locator('.ticker-track').first().evaluate(e=>getComputedStyle(e).animationName),'none');
  await page.locator('#contact').screenshot({path:'test-results/redesign/contact.png'});
  await page.locator('#contact-form button').click();
  assert.equal(await page.locator('#email').evaluate(e=>e.validity.valueMissing),true);
  await page.getByRole('textbox',{name:'YOUR EMAIL (required)',exact:true}).fill('test@example.com');
  await page.getByRole('textbox',{name:'SUBJECT (required)',exact:true}).fill('Browser verification');
  await page.getByRole('textbox',{name:'MESSAGE (required)',exact:true}).fill('A local test of the redesigned portfolio.');
  // A failed request must preserve the message and allow retrying.
  await page.locator('#contact-form button').click();
  await page.locator('#form-status.error').waitFor();
  assert.equal(await page.locator('#message').inputValue(),'A local test of the redesigned portfolio.');
  assert.equal(await page.locator('#contact-form button').isEnabled(),true);
  await page.locator('#contact-form button').click();
  await page.locator('#form-status.success').waitFor();
  assert.equal(await page.locator('#contact-form').isVisible(),false);
  const backups=(await readFile(path.join(dataDirectory,'messages.jsonl'),'utf8')).trim().split('\n').map(line=>JSON.parse(line));
  assert.equal(backups.length,2,'Failed and successful attempts have private backups');
  const saved=backups.at(-1);
  assert.equal(saved.email,'test@example.com');
  assert.equal(slackMessages.length,1,'One accepted Slack notification');
  assert.match(JSON.stringify(slackMessages[0]),/Browser verification/);
  assert.match(JSON.stringify(slackMessages[0]),/A local test of the redesigned portfolio/);
  assert.deepEqual(errors,[],'No JavaScript errors');
  assert.deepEqual(external,[],'No external requests');
  assert.deepEqual(failures,[],'No missing assets');
  await writeFile('test-results/redesign/results.json',JSON.stringify({passed:true,viewports:report,checks:['Reference palette and typography','8 original projects','All images loaded','Navigation destinations','Mobile menu and Escape','Project viewer and keyboard navigation','Focus restoration','Animated tickers','Reduced motion','Required form fields','Submission failure and retry','Persisted submission','No JavaScript errors','No external requests']},null,2));
  console.log('PASS: five screen sizes, reference palette/type, 8 projects, local assets, navigation, mobile menu, project viewer, keyboard/focus, animations, reduced motion, form validation/failure/retry/persistence, no browser errors or external requests.');
} finally {
  await browser.close();
  await new Promise(resolve=>server.close(resolve));
  await rm(dataDirectory,{recursive:true,force:true});
}
