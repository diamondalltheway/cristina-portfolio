import { json } from '@sveltejs/kit';

type Submission = { email: string; subject: string; message: string };
type ContactOptions = {
  origin: string;
  webhookUrl?: string;
  fetchImpl?: typeof globalThis.fetch;
  timeoutMs?: number;
};

function validateSlackWebhook(value: string | undefined) {
  if (!value) return '';
  try {
    const url = new URL(value);
    if (
      url.protocol === 'https:' &&
      ['hooks.slack.com', 'hooks.slack-gov.com'].includes(url.hostname) &&
      !url.username &&
      !url.password &&
      !url.port &&
      !url.search &&
      !url.hash &&
      /^\/services\/[^/]+\/[^/]+\/[^/]+$/.test(url.pathname)
    )
      return url.href;
  } catch {
    /* Report configuration errors without exposing the secret URL. */
  }
  throw new Error('SLACK_WEBHOOK_URL must be a Slack Incoming Webhook HTTPS URL.');
}

function slackPayload(submission: Submission) {
  const section = (text: string) => ({
    type: 'section',
    text: { type: 'plain_text', text, emoji: false },
  });
  const detail = (label: string, text: string) => ({
    type: 'rich_text_section',
    elements: [
      { type: 'text', text: `${label}\n`, style: { bold: true } },
      { type: 'text', text },
    ],
  });
  // Slack limits section text to 3,000 characters. Preserve long messages in separate blocks.
  const chunks = submission.message.match(/[\s\S]{1,2500}/gu) ?? [];
  return {
    text: 'New contact message — Cristina Lalinde portfolio',
    unfurl_links: false,
    unfurl_media: false,
    blocks: [
      {
        type: 'header',
        text: { type: 'plain_text', text: '✉️ New portfolio inquiry', emoji: true },
      },
      {
        type: 'context',
        elements: [{ type: 'plain_text', text: 'CRISTINA LALINDE · WEBSITE CONTACT' }],
      },
      { type: 'divider' },
      {
        type: 'rich_text',
        elements: [detail('From', submission.email), detail('Subject', submission.subject)],
      },
      { type: 'section', text: { type: 'mrkdwn', text: '*Message*' } },
      ...chunks.map((text, index) => ({ ...section(text), block_id: `message_${index}` })),
    ],
  };
}

export async function handleContact(
  request: Request,
  { origin, webhookUrl, fetchImpl = globalThis.fetch, timeoutMs = 10000 }: ContactOptions,
) {
  const reply = (status: number, body: { error: string } | { success: true }) =>
    json(body, { status, headers: { 'Cache-Control': 'no-store' } });
  const requestOrigin = request.headers.get('origin');
  if (requestOrigin && requestOrigin !== origin)
    return reply(403, { error: 'Invalid request origin.' });
  if (request.headers.get('content-type')?.split(';')[0].trim() !== 'application/json')
    return reply(415, { error: 'Expected JSON.' });

  let fields: unknown;
  try {
    if (!request.body) return reply(400, { error: 'Invalid form data.' });
    const reader = request.body.getReader();
    const chunks: Uint8Array[] = [];
    let size = 0;
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        size += value.byteLength;
        if (size > 16000) {
          await reader.cancel();
          return reply(413, { error: 'Your message is too long.' });
        }
        chunks.push(value);
      }
    } finally {
      reader.releaseLock();
    }
    fields = JSON.parse(Buffer.concat(chunks).toString('utf8'));
  } catch {
    return reply(400, { error: 'Invalid form data.' });
  }

  if (
    !fields ||
    typeof fields !== 'object' ||
    !('email' in fields) ||
    typeof fields.email !== 'string' ||
    !('subject' in fields) ||
    typeof fields.subject !== 'string' ||
    !('message' in fields) ||
    typeof fields.message !== 'string'
  ) {
    return reply(400, { error: 'Invalid form data.' });
  }
  const [email, subject, message] = [fields.email, fields.subject, fields.message].map((value) =>
    value.trim(),
  );
  if (![email, subject, message].every(Boolean))
    return reply(400, { error: 'Please complete all required fields.' });
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return reply(400, { error: 'Please enter a valid email address.' });
  if (email.length > 254 || subject.length > 500 || message.length > 10000)
    return reply(400, { error: 'Your message is too long.' });

  let webhook;
  try {
    webhook = validateSlackWebhook(webhookUrl?.trim());
  } catch {
    return reply(503, {
      error: 'The contact form is temporarily unavailable. Please try again later.',
    });
  }
  if (!webhook)
    return reply(503, {
      error: 'The contact form is temporarily unavailable. Please try again later.',
    });

  try {
    const response = await fetchImpl(webhook, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(slackPayload({ email, subject, message })),
      signal: AbortSignal.timeout(timeoutMs),
      redirect: 'error',
    });
    if (!response.ok || (await response.text()).trim() !== 'ok')
      throw new Error('Slack did not accept the message.');
  } catch {
    console.error('Slack contact delivery failed.');
    return reply(502, { error: 'Unable to deliver your message right now. Please try again.' });
  }
  return reply(201, { success: true });
}
