# Cristina Lalinde portfolio

A prerendered SvelteKit portfolio featuring Cristina Lalinde's graphic and email design work, with a separate serverless Slack contact endpoint.

The design uses oversized Archivo Black headlines, Inter body text, espresso and pink sections, orange scrolling banners, email phone mockups, outlined starbursts, and zigzag dividers. Cristina's content and eight original portfolio images remain the focus.

## Run

Requires Node.js 24.x (`nvm use` selects it via `.nvmrc`).

```sh
npm ci
npm run dev
```

Open **http://localhost:3000**. Vite provides hot updates and a local `/api/contact` endpoint backed by the same Slack handler as production. Use `npm run dev -- --port 4000` to change the port.

Build and preview the static output:

```sh
npm run build
npm run preview
```

`@sveltejs/adapter-static` writes the complete prerendered site to `build/`, including all page content, bundled JavaScript/CSS, images, and fonts. `npm run preview` also provides the local contact endpoint. `npm start` serves an existing build with the standalone Node server on port 3000; set `PORT` or `HOST` for that server as needed.

## Features

- Responsive services, work, about, and contact sections.
- Svelte components for mobile navigation, project previews, and the contact form.
- Mobile navigation with keyboard support.
- Eight project previews with full-resolution images, previous/next controls, Escape to close, and focus restoration.
- Animated text banners with support for reduced motion.
- Contact validation, sending/error/success states, and retry without losing the entered message.
- Locally served images and fonts, with no third-party browser requests.
- Styled Slack notifications with sender/subject details and complete message text.

## Contact form

Set the server environment variable `SLACK_WEBHOOK_URL` to the Incoming Webhook URL for your destination Slack channel. On your hosting provider, add it to the application's environment/secrets settings and restart or redeploy the Node server.

For local development, copy `.env.example` to `.env`, fill in `SLACK_WEBHOOK_URL`, and run `npm run dev`. Vite's local API middleware loads the variable on the server; an existing environment variable takes precedence. Restart after changing the value. `.env` files are ignored by Git and never included in the static output or browser bundle.

To get a webhook, [create a Slack app](https://api.slack.com/apps), enable **Incoming Webhooks**, choose **Add New Webhook to Workspace**, and select the destination channel. Copy its webhook URL into your server environment. See [Slack's setup guide](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/).

Each valid submission posts a formatted notification with a heading, bold sender/subject labels, and separated message paragraphs. There is no timestamp, reference ID, or reply-by-email footer. Visitor text is preserved as literal text so it cannot trigger Slack mentions or inject formatting. Long messages are split into sections without truncation. The browser shows success only after Slack accepts the message. Missing configuration returns an unavailable error; Slack failures and timeouts return a retryable error without clearing the form. Delivery has a 10-second timeout.

When running locally or on a server with writable storage, submissions are backed up before delivery in `data/messages.jsonl`, one JSON object per line. The directory is excluded from Git and is never publicly served. Failed deliveries keep their backup; they are not retried automatically. On Vercel (`VERCEL=1`), file backups are disabled because the application filesystem is read-only; Slack is the production destination. A visitor retry can result in a duplicate Slack message if Slack accepted an earlier request whose response timed out. Email delivery is not connected.

## Vercel

`vercel.json` deliberately selects the **Other** framework preset, runs `npm run build`, and publishes `build/` as static files. This lets SvelteKit's static adapter coexist with the independent `api/contact.js` function. The root layout prerenders all pages; there is no SPA fallback or server-rendered page route. HTML, CSS, JavaScript, fonts, images, and the favicon are served without invoking a function.

Only `/api/contact` runs on Node, through `api/contact.js`. It shares validation and Slack delivery code with Vite's local middleware and the standalone server through `lib/contact.js`. The function accepts both Vercel's parsed JSON body and raw Node requests, requires no filesystem writes, and has a 30-second invocation limit. It is deliberately outside SvelteKit's prerendered routes.

The `engines.node` setting in `package.json` pins builds and the contact function to Node.js `24.x`, as described in [Vercel's Node.js version documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). The build command and output directory are checked into `vercel.json`.

Add `SLACK_WEBHOOK_URL` in the Vercel project's environment variables for Production (and Preview if needed), then deploy the updated code. The ignored local `.env` is not uploaded by Git. If the variable is missing, the site still loads, but the contact form returns a temporary-unavailability error. Production submissions require no filesystem writes.

## Other static hosts

Run `npm run build`, then publish the contents of `build/` on any static host. The rendered page content is available even with JavaScript disabled. Interactive controls hydrate in the browser. To retain the working contact form, the host must also route `/api/contact` to a compatible server endpoint; static files alone cannot keep a Slack webhook secret or deliver submissions securely. Vercel provisions the included endpoint automatically.

## Edit

- `src/routes/+page.svelte`: portfolio page content.
- `src/routes/+layout.svelte` and `+layout.js`: global styles and prerender settings.
- `src/lib/components/`: mobile navigation, project viewer, and contact form.
- `src/lib/data/projects.js`: eight project descriptions and image references.
- `src/app.css`: responsive design and typography.
- `static/assets/`: images and fonts copied into the static build.
- `svelte.config.js` and `vite.config.js`: static adapter and local API middleware.
- `api/contact.js`: Vercel's serverless contact endpoint.
- `lib/contact.js`: shared validation, Slack delivery, and optional private contact backups.
- `server.js`: standalone server for the built site, also used by integration tests.
- `vercel.json`: static publishing and contact function configuration.

## Test

```sh
npm run check
npm run build
npm test
npm run test:browser
```

Tests run against the generated `build/`, so rebuild after changing Svelte components. The browser check requires Google Chrome and tests content with JavaScript disabled; 320, 390, 768, 1440, and 1920 pixel widths; image loading; navigation; mobile menu; project dialog; keyboard and focus behavior; reduced motion; form validation, failure/retry, and submission persistence; and browser errors or external requests. Screenshots and results are saved under `test-results/redesign/`.

The older source captures in `reference/` and the original capture/conversion scripts document the previous reproduction. `scripts/compare-contact.mjs` and `scripts/create-local-page.mjs` target that older design and should not be run to validate or regenerate the current redesign.
