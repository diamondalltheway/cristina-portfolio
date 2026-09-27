import { mkdir, appendFile } from 'node:fs/promises';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

function validateSlackWebhook(value) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (url.protocol === 'https:' && ['hooks.slack.com', 'hooks.slack-gov.com'].includes(url.hostname)
      && !url.username && !url.password && !url.port && !url.search && !url.hash
      && /^\/services\/[^/]+\/[^/]+\/[^/]+$/.test(url.pathname)) return url.href;
  } catch { /* Report configuration errors without exposing the secret URL. */ }
  throw new Error('SLACK_WEBHOOK_URL must be a Slack Incoming Webhook HTTPS URL.');
}

function slackPayload(submission) {
  const section = text => ({ type: 'section', text: { type: 'plain_text', text, emoji: false } });
  // Slack limits section text to 3,000 characters. Preserve long messages in separate blocks.
  const chunks = submission.message.match(/[\s\S]{1,2500}/gu);
  return {
    text: 'New contact message — Cristina Lalinde portfolio',
    unfurl_links: false,
    unfurl_media: false,
    blocks: [
      { type: 'header', text: { type: 'plain_text', text: 'New portfolio inquiry' } },
      section(`Email: ${submission.email}\nSubject: ${submission.subject}`),
      section('Message'),
      ...chunks.map(section),
      { type: 'context', elements: [{ type: 'plain_text', text: `Received: ${submission.createdAt} · Reference: ${submission.id}` }] },
    ],
  };
}

export function createContactHandler({
  dataDirectory = null,
  slackWebhookUrl = process.env.SLACK_WEBHOOK_URL,
  slackFetch = globalThis.fetch,
  slackTimeoutMs = 10000,
} = {}) {
  const webhook = validateSlackWebhook(slackWebhookUrl?.trim());
  return async (req, res) => {
    const json = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(body));
    };
    try {
      if (req.method !== 'POST') return json(405, { error: 'Method not allowed.' });
      if (req.headers.origin) {
        let origin;
        try { origin = new URL(req.headers.origin); } catch { return json(403, { error: 'Invalid request origin.' }); }
        if (origin.host !== req.headers.host) return json(403, { error: 'Invalid request origin.' });
      }
      if (!req.headers['content-type']?.includes('application/json')) return json(415, { error: 'Expected JSON.' });
      let fields;
      // Vercel may provide a parsed body; the local Node server provides a byte stream.
      if (req.body !== undefined) {
        const body = Buffer.isBuffer(req.body) ? req.body.toString('utf8') : req.body;
        if (Buffer.byteLength(typeof body === 'string' ? body : JSON.stringify(body)) > 16000) return json(413, { error: 'Your message is too long.' });
        try { fields = typeof body === 'string' ? JSON.parse(body) : body; }
        catch { return json(400, { error: 'Invalid form data.' }); }
      } else {
        const chunks = [];
        let size = 0;
        for await (const chunk of req) {
          const bytes = Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk);
          size += bytes.length;
          if (size > 16000) return json(413, { error: 'Your message is too long.' });
          chunks.push(bytes);
        }
        try { fields = JSON.parse(Buffer.concat(chunks).toString('utf8')); }
        catch { return json(400, { error: 'Invalid form data.' }); }
      }
      if (!fields || typeof fields !== 'object') return json(400, { error: 'Invalid form data.' });
      if (![fields.email, fields.subject, fields.message].every(v => typeof v === 'string')) return json(400, { error: 'Invalid form data.' });
      const [email, subject, message] = [fields.email, fields.subject, fields.message].map(v => v.trim());
      if (![email, subject, message].every(Boolean)) return json(400, { error: 'Please complete all required fields.' });
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json(400, { error: 'Please enter a valid email address.' });
      if (email.length > 254 || subject.length > 500 || message.length > 10000) return json(400, { error: 'Your message is too long.' });
      if (!webhook) return json(503, { error: 'The contact form is temporarily unavailable. Please try again later.' });
      const submission = { id: randomUUID(), createdAt: new Date().toISOString(), email, subject, message };
      // Vercel's application filesystem is read-only; Slack is the production destination.
      if (dataDirectory) {
        await mkdir(dataDirectory, { recursive: true, mode: 0o700 });
        await appendFile(path.join(dataDirectory, 'messages.jsonl'), JSON.stringify(submission) + '\n', { mode: 0o600 });
      }
      try {
        const response = await slackFetch(webhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(slackPayload(submission)),
          signal: AbortSignal.timeout(slackTimeoutMs),
          redirect: 'error',
        });
        if (!response.ok || (await response.text()).trim() !== 'ok') throw new Error('Slack did not accept the message.');
      } catch {
        // Never log fetch errors: they can include the secret webhook URL.
        console.error(`Slack delivery failed for contact ${submission.id}${dataDirectory ? '; private backup retained' : ''}.`);
        return json(502, { error: 'Unable to deliver your message right now. Please try again.' });
      }
      return json(201, { success: true });
    } catch {
      console.error('Contact request failed.');
      if (!res.headersSent) json(500, { error: 'Unable to process your request. Please try again.' });
      else res.end();
    }
  };
}
