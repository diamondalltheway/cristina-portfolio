# Cristina Lalinde portfolio

A SvelteKit 2 and Svelte 5 application written in TypeScript. The portfolio page is prerendered; its contact form submits to a SvelteKit server route that sends formatted Slack notifications.

## Development

Use Node.js 24 (`nvm use`), then:

```sh
npm ci
npm run dev
```

Vite prints the local development URL. Copy `.env.example` to `.env` and set `SLACK_WEBHOOK_URL` to enable contact submissions. SvelteKit reads it through `$env/dynamic/private`; it is never exposed to the browser.

## Structure

- `src/routes/+page.svelte`: portfolio content.
- `src/routes/+layout.svelte` and `+layout.ts`: global styles and prerender settings.
- `src/routes/api/contact/+server.ts`: typed contact POST handler.
- `src/lib/components/`: navigation, project gallery, and contact form components.
- `src/lib/data/projects.ts`: portfolio project data.
- `src/lib/server/contact.ts`: server-only validation and Slack delivery.
- `src/app.css`: shared typography and responsive styles.
- `static/`: the images, fonts, and favicon used by the app.
- `tests/`: Playwright browser tests; server tests live alongside the server module.

The repository has one application and one routing system: SvelteKit. Local development, preview, and deployment all use the same routes.

## Build and deploy

```sh
npm run build
npm run preview
```

The official `@sveltejs/adapter-vercel` builds the Vercel deployment. The portfolio page is prerendered as static HTML with browser hydration for interactions. `/api/contact` opts out of prerendering and runs as a SvelteKit server endpoint on Node.js 24. The adapter generates routing and function output automatically.

Vercel uses the SvelteKit framework preset. Set `SLACK_WEBHOOK_URL` in the project's Production environment (and Preview if desired), then deploy. A missing webhook leaves the portfolio accessible and causes contact submissions to return a temporary-unavailability message.

## Contact notifications

The form requires an email address, subject, and message. Slack receives a heading, bold sender and subject labels, and the full message split into readable sections when necessary. Visitor text remains literal, without interpreting mentions or formatting. Notifications omit received timestamps, reference IDs, and reply sections.

The handler validates origin, content type, body size, and field lengths, and gives Slack 10 seconds to respond. The form shows success only after Slack accepts the message. Failed submissions preserve the visitor's input for retry. There are no local filesystem backups or database writes; Slack is the delivery destination. A retry after a network timeout may create a duplicate if Slack accepted the first request.

## Validation

```sh
npm run check
npm run lint
npm test
npm run build
npm run test:e2e
```

`check` runs strict TypeScript and Svelte diagnostics. Vitest covers request validation, Slack delivery, timeouts, notification formatting, and the route's private environment configuration. Playwright runs against SvelteKit's production preview and checks prerendered content without JavaScript, five viewport sizes, navigation, gallery keyboard behavior, required form fields, failure/retry behavior, and the actual API route. The browser tests use local Google Chrome and mock successful contact delivery to avoid sending test notifications.
