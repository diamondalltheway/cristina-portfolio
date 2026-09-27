import { describe, expect, it, vi } from 'vitest';
import { handleContact } from './contact';
import { POST } from '../../routes/api/contact/+server';

vi.mock('$env/dynamic/private', () => ({
  env: { SLACK_WEBHOOK_URL: 'https://hooks.slack.com/services/TEST/TEST/test' },
}));
const webhookUrl = 'https://hooks.slack.com/services/TEST/TEST/test';
const origin = 'https://portfolio.example';
const valid = {
  email: 'client@example.com',
  subject: 'Project inquiry',
  message: 'Hello Cristina.',
};
function request(body: unknown = valid, headers: Record<string, string> = {}) {
  return new Request(origin + '/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Origin: origin, ...headers },
    body: JSON.stringify(body),
  });
}
const delivery = () => vi.fn<typeof fetch>().mockImplementation(async () => new Response('ok'));

describe('SvelteKit contact endpoint', () => {
  it('uses the private environment and returns success only after Slack accepts', async () => {
    const fetchImpl = delivery();
    const response = await POST({
      request: request(),
      url: new URL(origin + '/api/contact'),
      fetch: fetchImpl,
    } as unknown as Parameters<typeof POST>[0]);
    expect(response.status).toBe(201);
    expect(await response.json()).toEqual({ success: true });
    expect(fetchImpl).toHaveBeenCalledOnce();
    expect(fetchImpl.mock.calls[0][0]).toBe(webhookUrl);
    expect(fetchImpl.mock.calls[0][1]?.redirect).toBe('error');
  });

  it('rejects incomplete, invalid, oversized, or cross-origin requests without contacting Slack', async () => {
    const fetchImpl = delivery();
    for (const body of [
      null,
      {},
      { ...valid, email: 'invalid' },
      ...['email', 'subject', 'message'].map((field) => ({ ...valid, [field]: '  ' })),
      { ...valid, subject: 'x'.repeat(501) },
      { ...valid, message: 'x'.repeat(10001) },
    ]) {
      expect((await handleContact(request(body), { origin, webhookUrl, fetchImpl })).status).toBe(
        400,
      );
    }
    expect(
      (
        await handleContact(request({ ...valid, message: 'x'.repeat(17000) }), {
          origin,
          webhookUrl,
          fetchImpl,
        })
      ).status,
    ).toBe(413);
    expect(
      (
        await handleContact(request(valid, { Origin: 'https://elsewhere.example' }), {
          origin,
          webhookUrl,
          fetchImpl,
        })
      ).status,
    ).toBe(403);
    expect(
      (
        await handleContact(request(valid, { 'Content-Type': 'text/plain' }), {
          origin,
          webhookUrl,
          fetchImpl,
        })
      ).status,
    ).toBe(415);
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it('returns unavailable for missing or invalid configuration without exposing it', async () => {
    const fetchImpl = delivery();
    for (const url of [
      '',
      'https://example.com/secret',
      'http://hooks.slack.com/services/A/B/secret',
    ]) {
      const response = await handleContact(request(), { origin, webhookUrl: url, fetchImpl });
      expect(response.status).toBe(503);
      expect(await response.text()).not.toContain('secret');
    }
    expect(fetchImpl).not.toHaveBeenCalled();
  });

  it.each(['http', 'body', 'network', 'timeout'])(
    'handles a Slack %s failure and successful retry',
    async (failure) => {
      const log = vi.spyOn(console, 'error').mockImplementation(() => {});
      const fetchImpl = delivery();
      fetchImpl.mockImplementationOnce(async (_url, options) => {
        if (failure === 'http') return new Response('invalid_token', { status: 403 });
        if (failure === 'body') return new Response('invalid_payload');
        if (failure === 'network') throw new Error(webhookUrl);
        return new Promise<Response>((_resolve, reject) => {
          const signal = options!.signal!;
          signal.addEventListener('abort', () => reject(signal.reason), { once: true });
        });
      });
      try {
        const response = await handleContact(request(), {
          origin,
          webhookUrl,
          fetchImpl,
          timeoutMs: 20,
        });
        expect(response.status).toBe(502);
        expect(await response.text()).not.toContain(webhookUrl);
        expect(JSON.stringify(log.mock.calls)).not.toContain(webhookUrl);
        expect((await handleContact(request(), { origin, webhookUrl, fetchImpl })).status).toBe(
          201,
        );
      } finally {
        log.mockRestore();
      }
    },
  );

  it('keeps full messages and styled literal fields without unwanted footer sections', async () => {
    for (const message of ['a'.repeat(10000), '<!channel> *Hello*\n\n' + '🚀'.repeat(1800)]) {
      const fetchImpl = delivery();
      const subject = '<!channel> *New project*';
      const response = await handleContact(request({ ...valid, subject, message }), {
        origin,
        webhookUrl,
        fetchImpl,
      });
      expect(response.status).toBe(201);
      const payload = JSON.parse(String(fetchImpl.mock.calls[0][1]?.body));
      const messageBlocks = payload.blocks.filter((block: { block_id?: string }) =>
        block.block_id?.startsWith('message_'),
      );
      expect(
        messageBlocks.map((block: { text: { text: string } }) => block.text.text).join(''),
      ).toBe(message);
      expect(
        messageBlocks.every(
          (block: { text: { text: string; type: string } }) =>
            block.text.type === 'plain_text' && Array.from(block.text.text).length <= 3000,
        ),
      ).toBe(true);
      const details = payload.blocks.find(
        (block: { type: string }) => block.type === 'rich_text',
      ).elements;
      expect(details[0].elements[0].style.bold).toBe(true);
      expect(details[1].elements[1].text).toBe(subject);
      expect(payload.unfurl_links).toBe(false);
      for (const unwanted of ['mailto:', 'Received', 'Reference:'])
        expect(JSON.stringify(payload)).not.toContain(unwanted);
    }
  });
});
