import { env } from '$env/dynamic/private';
import { handleContact } from '$lib/server/contact';
import type { RequestHandler } from './$types';

export const prerender = false;
export const trailingSlash = 'never';
export const config = { maxDuration: 30 };

export const POST: RequestHandler = ({ request, url, fetch }) => {
  return handleContact(request, {
    origin: url.origin,
    webhookUrl: env.SLACK_WEBHOOK_URL,
    fetchImpl: fetch,
  });
};
