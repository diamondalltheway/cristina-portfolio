import { test } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm, mkdir, copyFile, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { createApp } from './server.js';

test('Vercel contact function runs independently of the static site and local server', async t => {
  const fixture = await mkdtemp(path.join(tmpdir(), 'portfolio-vercel-'));
  t.after(() => rm(fixture, { recursive: true, force: true }));
  await mkdir(path.join(fixture, 'api'));
  await mkdir(path.join(fixture, 'lib'));
  for (const file of ['api/contact.js', 'lib/contact.js']) {
    await copyFile(new URL(`./${file}`, import.meta.url), path.join(fixture, file));
  }
  await writeFile(path.join(fixture, 'package.json'), '{"type":"module"}');
  // The function has no public/ or server.js, and cannot create a local backup directory.
  await writeFile(path.join(fixture, 'data'), 'Storage is unavailable');
  await writeFile(path.join(fixture, '.env'), 'SLACK_WEBHOOK_URL=invalid\n');
  const { stdout } = await promisify(execFile)(process.execPath, ['--input-type=module', '-e', `
    import assert from 'node:assert/strict';
    import { createServer } from 'node:http';
    const request = globalThis.fetch;
    const deliveries = [];
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://hooks.slack.com/services/TEST/TEST/test');
      deliveries.push(JSON.parse(options.body));
      return new Response('ok');
    };
    const { default: handler } = await import('./api/contact.js');
    assert.equal(typeof handler, 'function');
    const app = createServer(async (req, res) => {
      // Emulate Vercel's pre-parsed body as well as Node's raw stream.
      if (req.url.includes('parsed')) {
        let body = '';
        for await (const chunk of req) body += chunk;
        req.body = JSON.parse(body);
      }
      await handler(req, res);
    });
    await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
    try {
      const base = 'http://127.0.0.1:' + app.address().port;
      assert.equal((await request(base + '/api/contact')).status, 405);
      for (const mode of ['raw', 'parsed']) {
        const response = await request(base + '/api/contact?mode=' + mode, {
          method: 'POST', headers: { 'Content-Type': 'application/json', Origin: base },
          body: JSON.stringify({ email: 'test@example.com', subject: 'Vercel test', message: 'No local disk writes.' }),
        });
        assert.equal(response.status, 201, await response.text());
      }
      assert.equal(deliveries.length, 2);
      assert.match(JSON.stringify(deliveries[0]), /No local disk writes/);
      console.log('Standalone contact function passed');
    } finally {
      await new Promise(resolve => app.close(resolve));
    }
  `], { cwd: fixture, env: { ...process.env, VERCEL: '1', SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/TEST/TEST/test' }, timeout: 15000 });
  assert.match(stdout, /Standalone contact function passed/);
  assert.equal(await readFile(path.join(fixture, 'data'), 'utf8'), 'Storage is unavailable');
});

test('Node server serves the portfolio and persists validated contact submissions privately', async t => {
  const dataDirectory = await mkdtemp(path.join(tmpdir(), 'portfolio-test-'));
  const deliveries = [];
  const app = createApp({ dataDirectory, slackWebhookUrl: 'https://hooks.slack.com/services/TEST/TEST/test', slackFetch: async (url, options) => {
    deliveries.push({ url, options, payload: JSON.parse(options.body) });
    return new Response('ok');
  } });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => app.close(resolve));
    await rm(dataDirectory, { recursive: true, force: true });
  });
  const base = `http://127.0.0.1:${app.address().port}`;
  const post = (body, headers = {}) => fetch(base + '/api/contact', { method: 'POST', headers: { 'Content-Type': 'application/json', ...headers }, body: JSON.stringify(body) });

  const home = await fetch(base);
  assert.equal(home.status, 200);
  assert.match(await home.text(), /CRISTINA LALINDE/);
  const asset = await fetch(base + '/assets/reference-13.gif');
  assert.equal(asset.status, 200);
  assert.equal(asset.headers.get('content-type'), 'image/gif');
  assert.equal((await fetch(base + '/server.js')).status, 404);
  assert.equal((await fetch(base + '/.env')).status, 404);
  assert.equal((await fetch(base + '/.env.example')).status, 404);
  assert.equal((await fetch(base + '/data/messages.jsonl')).status, 404);
  assert.equal((await fetch(base + '/%2e%2e%2fpackage.json')).status, 403);
  assert.equal((await fetch(base + '/api/contact')).status, 405);
  assert.equal((await post(null)).status, 400);
  assert.equal((await post({ email: '', subject: '', message: '' })).status, 400);
  assert.equal((await post({ email: 'invalid', subject: '', message: 'Hello' })).status, 400);
  for (const field of ['email', 'subject', 'message']) {
    assert.equal((await post({ email: 'test@example.com', subject: 'Hi', message: 'Hello', [field]: '  ' })).status, 400);
  }
  assert.equal((await post({ email: 'test@example.com', subject: 'Hi', message: 'Hello' }, { Origin: 'https://unrelated.example' })).status, 403);
  assert.equal(deliveries.length, 0);
  assert.equal((await post({ email: 'test@example.com', subject: 'Hi', message: 'Hello' })).status, 201);
  const saved = JSON.parse(await readFile(path.join(dataDirectory, 'messages.jsonl'), 'utf8'));
  assert.equal(saved.email, 'test@example.com');
  assert.equal(saved.message, 'Hello');
  assert.ok(saved.id);
  assert.ok(saved.createdAt);
  assert.equal(deliveries.length, 1);
  assert.equal(deliveries[0].options.method, 'POST');
  assert.equal(deliveries[0].options.redirect, 'error');
  assert.match(JSON.stringify(deliveries[0].payload), /test@example.com/);
  assert.ok(!JSON.stringify(deliveries[0].payload).includes(saved.id));
  assert.ok(!JSON.stringify(deliveries[0].payload).includes(saved.createdAt));
});

const valid = { email: 'test@example.com', subject: 'New project', message: 'Let’s talk.' };
const testWebhook = 'https://hooks.slack.com/services/TEST/TEST/test';

async function contactServer(t, options = {}) {
  const dataDirectory = await mkdtemp(path.join(tmpdir(), 'portfolio-slack-test-'));
  const app = createApp({ dataDirectory, slackWebhookUrl: testWebhook, ...options });
  await new Promise(resolve => app.listen(0, '127.0.0.1', resolve));
  t.after(async () => {
    await new Promise(resolve => app.close(resolve));
    await rm(dataDirectory, { recursive: true, force: true });
  });
  return {
    dataDirectory,
    post: (body = valid) => fetch(`http://127.0.0.1:${app.address().port}/api/contact`, {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body),
    }),
  };
}

test('missing Slack configuration does not report success or save an undeliverable message', async t => {
  const { post, dataDirectory } = await contactServer(t, { slackWebhookUrl: '', slackFetch: () => assert.fail('Must not send') });
  const response = await post();
  assert.equal(response.status, 503);
  assert.match((await response.json()).error, /temporarily unavailable/);
  await assert.rejects(readFile(path.join(dataDirectory, 'messages.jsonl')), { code: 'ENOENT' });
});

test('invalid Slack configuration is rejected without exposing its value', () => {
  for (const slackWebhookUrl of ['not-a-url', 'http://hooks.slack.com/services/A/B/secret', 'https://example.com/services/A/B/secret', testWebhook + '?secret=secret']) {
    assert.throws(() => createApp({ slackWebhookUrl }), error => {
      assert.equal(error.message, 'SLACK_WEBHOOK_URL must be a Slack Incoming Webhook HTTPS URL.');
      return true;
    });
  }
});

test('Slack failures retain the backup and allow a successful retry', async t => {
  for (const failure of ['http', 'body', 'network', 'timeout']) {
    await t.test(failure, async t => {
      let attempts = 0;
      const logs = [];
      t.mock.method(console, 'error', message => logs.push(message));
      const { post, dataDirectory } = await contactServer(t, {
        slackTimeoutMs: 20,
        slackFetch: async (_url, { signal }) => {
          if (++attempts > 1) return new Response('ok');
          if (failure === 'http') return new Response('invalid_token', { status: 403 });
          if (failure === 'body') return new Response('invalid_payload');
          if (failure === 'network') throw new Error(`Connection failed to ${testWebhook}`);
          await new Promise((resolve, reject) => signal.addEventListener('abort', () => reject(signal.reason), { once: true }));
        },
      });
      const response = await post();
      assert.equal(response.status, 502);
      const result = await response.json();
      assert.match(result.error, /try again/);
      assert.ok(!JSON.stringify(result).includes(testWebhook));
      assert.ok(!logs.join('').includes(testWebhook));
      const backup = JSON.parse(await readFile(path.join(dataDirectory, 'messages.jsonl'), 'utf8'));
      assert.equal(backup.message, valid.message);
      assert.equal((await post()).status, 201);
      assert.equal(attempts, 2);
    });
  }
});

test('full-length messages preserve plain text and Unicode across Slack blocks', async t => {
  const payloads = [];
  const { post } = await contactServer(t, { slackFetch: async (_url, options) => {
    payloads.push(JSON.parse(options.body));
    return new Response('ok');
  } });
  for (const message of ['a'.repeat(10000), '<!channel> & <@U123> *bold*\n' + '🚀'.repeat(1800)]) {
    const response = await post({ ...valid, email: ' test@example.com ', message });
    assert.equal(response.status, 201);
    const payload = payloads.at(-1);
    const blocks = payload.blocks.filter(block => block.block_id?.startsWith('message_'));
    assert.equal(blocks.map(block => block.text.text).join(''), message);
    assert.ok(blocks.every(block => block.text.type === 'plain_text' && Array.from(block.text.text).length <= 3000));
    assert.equal(payload.unfurl_links, false);
    assert.equal(payload.unfurl_media, false);
  }
  const count = payloads.length;
  assert.equal((await post({ ...valid, subject: 'x'.repeat(501) })).status, 400);
  assert.equal((await post({ ...valid, message: 'x'.repeat(10001) })).status, 400);
  assert.equal((await post({ ...valid, message: 'x'.repeat(17000) })).status, 413);
  assert.equal(payloads.length, count);
});

test('Slack notifications style labels and preserve visitor text without extra footer sections', async t => {
  let payload;
  const { post } = await contactServer(t, { slackFetch: async (_url, options) => {
    payload = JSON.parse(options.body);
    return new Response('ok');
  } });
  const email = 'client+project@example.com';
  const subject = '<!channel> *New project* & design';
  assert.equal((await post({ email, subject, message: 'First paragraph.\n\nSecond paragraph.' })).status, 201);
  assert.equal(payload.blocks[0].type, 'header');
  const details = payload.blocks.find(block => block.type === 'rich_text').elements;
  assert.equal(details[0].elements[0].style.bold, true);
  assert.equal(details[0].elements[1].text, email);
  assert.equal(details[1].elements[1].text, subject);
  assert.ok(!JSON.stringify(payload).includes('mailto:'));
  assert.ok(!JSON.stringify(payload).includes('Reply by email'));
  assert.ok(!JSON.stringify(payload).includes('Received'));
  assert.ok(!JSON.stringify(payload).includes('Reference:'));
  assert.ok(!payload.blocks.some(block => block.text?.type === 'mrkdwn' && block.text.text.includes(subject)));
});
