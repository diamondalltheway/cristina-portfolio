# Cristina Lalinde portfolio

A static portfolio with a serverless Slack contact endpoint, featuring Cristina's original work and using [Janna Lynn Design](https://www.jannalynnhagan.com/) as the UI and UX reference.

The design uses oversized Archivo Black headlines, Inter body text, espresso and pink sections, orange scrolling banners, email phone mockups, outlined starbursts, and zigzag dividers. Cristina's content and eight original portfolio images remain the focus.

## Run

Requires Node.js 24.x (`nvm use` selects it via `.nvmrc`). No dependency installation or build step is needed to run the app.

```sh
npm start
```

Open **http://localhost:3000**. Use `npm run dev` for automatic server restarts. Set `PORT` or `HOST` to change the listening address, for example `PORT=4000 npm start`.

## Features

- Responsive services, work, about, and contact sections.
- Mobile navigation with keyboard support.
- Eight project previews with full-resolution images, previous/next controls, Escape to close, and focus restoration.
- Animated text banners with support for reduced motion.
- Contact validation, sending/error/success states, and retry without losing the entered message.
- Locally served images and fonts, with no third-party browser requests.
- Server-side Slack notifications for contact submissions.

## Contact form

Set the server environment variable `SLACK_WEBHOOK_URL` to the Incoming Webhook URL for your destination Slack channel. On your hosting provider, add it to the application's environment/secrets settings and restart or redeploy the Node server.

For local development, copy `.env.example` to `.env`, fill in `SLACK_WEBHOOK_URL`, and run `npm start` (or `npm run dev`). The server loads `.env` automatically; an existing environment variable takes precedence. Restart the server after changing the value. `.env` files are ignored by Git and never served to the browser.

To get a webhook, [create a Slack app](https://api.slack.com/apps), enable **Incoming Webhooks**, choose **Add New Webhook to Workspace**, and select the destination channel. Copy its webhook URL into your server environment. See [Slack's setup guide](https://docs.slack.dev/messaging/sending-messages-using-incoming-webhooks/).

Each valid submission posts the sender's email, subject, full message, timestamp, and reference ID to that channel. Visitor text is sent as plain text to avoid interpreting Slack mentions or formatting. The browser shows success only after Slack accepts the message. Missing configuration returns an unavailable error; Slack failures and timeouts return a retryable error without clearing the form. Delivery has a 10-second timeout.

When running locally or on a server with writable storage, submissions are backed up before delivery in `data/messages.jsonl`, one JSON object per line. The directory is excluded from Git and is never publicly served. Failed deliveries keep their backup; they are not retried automatically. On Vercel (`VERCEL=1`), file backups are disabled because the application filesystem is read-only; Slack is the production destination. A visitor retry can result in a duplicate Slack message if Slack accepted an earlier request whose response timed out. Email delivery is not connected.

## Vercel

`vercel.json` selects the **Other** framework preset, skips the build step, and publishes `public/` directly as static files. HTML, CSS, JavaScript, fonts, images, and the favicon are served without starting Node or invoking a function. There is no catch-all rewrite to a server.

Only `/api/contact` runs on Node, through `api/contact.js`. It shares validation and Slack delivery code with the local development server through `lib/contact.js`. The function accepts both Vercel's parsed JSON body and raw Node requests, requires no filesystem writes, and has a 30-second invocation limit. `server.js` is used only for local development and standalone Node hosting.

The `engines.node` setting in `package.json` pins deployments to Node.js `24.x`, as described in [Vercel's Node.js version documentation](https://vercel.com/docs/functions/runtimes/node-js/node-js-versions). No custom build command is needed.

Add `SLACK_WEBHOOK_URL` in the Vercel project's environment variables for Production (and Preview if needed), then deploy the updated code. The ignored local `.env` is not uploaded by Git. If the variable is missing, the site still loads, but the contact form returns a temporary-unavailability error. Production submissions require no filesystem writes.

## Other static hosts

The contents of `public/` can be hosted directly by any static web server without a build step. To retain the working contact form, that host must also route `/api/contact` to a compatible server endpoint; static files alone cannot keep a Slack webhook secret or deliver submissions securely. Vercel provisions the included endpoint automatically.

## Edit

- `public/index.html`: page content, layout, and project cards.
- `public/app.css`: responsive design and typography.
- `public/app.js`: mobile navigation, project viewer, and contact interactions.
- `public/assets/`: images and fonts.
- `api/contact.js`: Vercel's serverless contact endpoint.
- `lib/contact.js`: shared validation, Slack delivery, and optional private contact backups.
- `server.js`: local development and standalone Node HTTP server.
- `vercel.json`: static publishing and contact function configuration.
- `reference/janna/design-notes.md`: observations and design decisions from the reference study.

## Test

```sh
npm test
npm install
npm run test:browser
```

The browser check requires Google Chrome and tests 320, 390, 768, 1440, and 1920 pixel widths; image loading; navigation; mobile menu; project dialog; keyboard and focus behavior; reduced motion; form validation, failure/retry, and submission persistence; and browser errors or external requests. Screenshots and results are saved under `test-results/redesign/`.

The older source captures in `reference/` and the original capture/conversion scripts document the previous reproduction. `scripts/compare-contact.mjs` and `scripts/create-local-page.mjs` target that older design and should not be run to validate or regenerate the current redesign.
