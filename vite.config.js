import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig, loadEnv } from 'vite';
import { createContactHandler } from './lib/contact.js';
import path from 'node:path';

function contactEndpoint(mode) {
  const install = server => {
    const env = loadEnv(mode, process.cwd(), '');
    const contact = createContactHandler({
      slackWebhookUrl: process.env.SLACK_WEBHOOK_URL ?? env.SLACK_WEBHOOK_URL,
      dataDirectory: path.resolve('data'),
    });
    server.middlewares.use((req, res, next) => {
      if (new URL(req.url, 'http://localhost').pathname === '/api/contact') return contact(req, res);
      next();
    });
  };
  return { name: 'local-contact-endpoint', configureServer: install, configurePreviewServer: install };
}

export default defineConfig(({ mode }) => ({
  plugins: [contactEndpoint(mode), sveltekit()],
  server: { host: '127.0.0.1', port: 3000 },
}));
