import { dev } from '$app/environment';
import { beforeSend } from '$lib/analytics-opt-out';
import { injectAnalytics } from '@vercel/analytics/sveltekit';

injectAnalytics({ mode: dev ? 'development' : 'production', beforeSend });

export const prerender = true;
export const trailingSlash = 'always';
