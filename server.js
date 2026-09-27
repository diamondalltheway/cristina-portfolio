import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { createContactHandler } from './lib/contact.js';
import { loadEnvFile } from 'node:process';

const root = path.resolve(fileURLToPath(new URL('./public/', import.meta.url)));
const mime = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.png': 'image/png', '.gif': 'image/gif', '.svg': 'image/svg+xml', '.ico': 'image/x-icon', '.woff': 'font/woff', '.woff2': 'font/woff2' };

export function createApp({
  dataDirectory = process.env.VERCEL === '1' ? null : path.join(fileURLToPath(new URL('.', import.meta.url)), 'data'),
  slackWebhookUrl = process.env.SLACK_WEBHOOK_URL,
  slackFetch = globalThis.fetch,
  slackTimeoutMs = 10000,
} = {}) {
  const contact = createContactHandler({ dataDirectory, slackWebhookUrl, slackFetch, slackTimeoutMs });
  return createServer(async (req, res) => {
    const json = (status, body) => {
      res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify(body));
    };
    try {
      const url = new URL(req.url, 'http://localhost');
      if (url.pathname === '/api/contact') return await contact(req, res);
      if (!['GET', 'HEAD'].includes(req.method)) return json(405, { error: 'Method not allowed.' });
      let pathname;
      try { pathname = decodeURIComponent(url.pathname); } catch { return json(400, { error: 'Invalid path.' }); }
      const file = path.resolve(root, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(root + path.sep) && file !== path.join(root, 'index.html')) return json(403, { error: 'Forbidden.' });
      const info = await stat(file);
      if (!info.isFile()) return json(404, { error: 'Not found.' });
      res.writeHead(200, {
        'Content-Type': mime[path.extname(file)] || 'application/octet-stream',
        'Content-Length': info.size,
        'Cache-Control': pathname.startsWith('/assets/') ? 'public, max-age=86400' : 'no-cache',
        'X-Content-Type-Options': 'nosniff',
      });
      res.end(req.method === 'HEAD' ? undefined : await readFile(file));
    } catch (error) {
      if (error.code === 'ENOENT' || error.code === 'ENOTDIR') return json(404, { error: 'Not found.' });
      console.error('Request failed:', error.message);
      if (!res.headersSent) json(500, { error: 'Unable to process your request. Please try again.' });
      else res.end();
    }
  });
}

const isLocalEntry = process.env.VERCEL !== '1' && process.argv[1]
  && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (isLocalEntry) {
  try { loadEnvFile(fileURLToPath(new URL('.env', import.meta.url))); }
  catch (error) { if (error.code !== 'ENOENT') throw error; }
}

if (isLocalEntry) {
  const app = createApp();
  const port = Number(process.env.PORT || 3000);
  const host = process.env.HOST || '127.0.0.1';
  if (!process.env.SLACK_WEBHOOK_URL?.trim()) console.warn('SLACK_WEBHOOK_URL is not set. Contact submissions are unavailable until it is configured.');
  app.listen(port, host, () => console.log(`Cristina Lalinde portfolio is running at http://${host}:${port}`));
  app.on('error', error => { console.error(error.message); process.exitCode = 1; });
}
