# JAANA

Single-page React + TypeScript site for the SJBHS OBA / JAANA giving and alumni outreach flow, backed by a small Express API for inquiry submission.

This repo is no longer a generic starter. It now contains a working branded site with the current priority pages already implemented:

- `Home`
- `Causes`
- `Donate`
- `North America Connect 2026`

## What this project includes

### Front end

- A polished single-page React app built with Vite
- Hash-based tab navigation instead of a full router
- A `Causes` page focused on priority support areas
- A `Donate` page focused on upcoming online giving and contact flow
- Cause detail modals with:
  - funding summary
  - impact/support content
  - direct donation actions
- A `North America Connect 2026` page with sponsor-oriented content and supporting assets
- A live inquiry form embedded in the `Donate` page
- A lightweight hidden `/admin` editor for site content with a normal login form

### Back end

- Express API used during local development and production server runs
- Vercel serverless functions in `api/` for deployment
- Local JSON persistence for inquiry submissions
- Local JSON persistence for editable site content
- Validation for inquiry form payloads

## What was done in this repo

The current implementation is focused on the donor and alumni experience rather than a broad marketing site.

Implemented work:

- Reworked the site around the current priority areas instead of building every page equally
- Split the giving experience into separate `Causes` and `Donate` pages
- Added structured cause data and interactive cause detail modals
- Added a donation action menu with direct redirect links for payment methods
- Added `North America Connect 2026` event and sponsor content
- Added a live contact/inquiry form for cause support, donations, sponsorships, and alumni questions
- Added API routes for:
  - health checks
  - inquiry submission
  - inquiry stats
- Added Connect content read/write routes for the public page and hidden admin editor
- Added local JSON storage for inquiries
- Added local JSON storage for the Connect page editor
- Added Vercel-compatible API functions and build config

## Tech stack

- React 18
- TypeScript
- Vite
- Express
- Node.js
- Vercel functions for deployment

## How the app is organized

### Main UI files

- `src/App.tsx`
  Main application UI, page/tab content, cause data, donation menu logic, and inquiry form flow.
- `src/styles.css`
  All site styling, including page layouts, buttons, modals, and donation menu presentation.
- `src/main.tsx`
  Front-end entry point.

### Backend files

- `server/index.ts`
  Express server used for local development and compiled production server runs.
- `server/lib/inquiryStore.ts`
  Reads and writes inquiry submissions to JSON storage.
- `server/lib/inquiryValidation.ts`
  Validates the inquiry payload before writing it.
- `server/lib/adminAuth.ts`
  Session-cookie helpers and admin login checks.

### Deployment API files

- `api/health.ts`
- `api/site-content.ts`
- `api/inquiries/index.ts`
- `api/admin/session.ts`
- `api/admin/login.ts`
- `api/admin/logout.ts`
- `api/admin/inquiries.ts`
- `api/admin/inquiries/[id].ts`

These mirror the main API behavior for Vercel deployment.

### Static content

- `public/assets/`
  Images, logos, house shields, event visuals, and other site assets.
- `public/docs/`
  Supporting PDFs and sponsor documents used by the project.

## Project structure

```text
.
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   ├── styles.css
│   └── vite-env.d.ts
├── server/
│   ├── index.ts
│   └── lib/
│       ├── adminAuth.ts
│       ├── inquiryStore.ts
│       └── inquiryValidation.ts
├── api/
│   ├── health.ts
│   ├── site-content.ts
│   ├── admin/
│   │   ├── _auth.ts
│   │   ├── _shared.ts
│   │   ├── inquiries.ts
│   │   ├── login.ts
│   │   ├── logout.ts
│   │   └── session.ts
│   └── inquiries/
│       └── index.ts
├── public/
│   ├── assets/
│   └── docs/
├── .env.example
├── README.md
├── package.json
├── vite.config.ts
├── vercel.json
├── tsconfig.json
├── tsconfig.server.json
└── tsconfig.vercel.json
```

## Environment variables

Copy `.env.example` to `.env` before local development.

```bash
cp .env.example .env
```

Current variables:

```env
HOST=127.0.0.1
PORT=3001
CORS_ORIGIN=http://127.0.0.1:5173
INQUIRY_STORAGE_PATH=./server/data/inquiries.json
ADMIN_EMAIL=jaanamedia@gmail.com
ADMIN_PASSWORD=CommonPassJAANA1858$
ADMIN_SESSION_SECRET=change-this-to-a-long-random-string
INQUIRY_EMAIL_FROM=JAANA Website <no-reply@jaana.app>
INQUIRY_EMAIL_TO_GENERAL=jaanagroup@gmail.com
INQUIRY_EMAIL_TO_FINANCE=jaanafinance@gmail.com
INQUIRY_EMAIL_CC=
REQUIRE_INQUIRY_EMAIL=true
RESEND_API_KEY=
VITE_API_PROXY_TARGET=http://127.0.0.1:3001
VITE_HOST=127.0.0.1
VITE_PORT=5173
```

What they control:

- `HOST`
  Host for the Express server.
- `PORT`
  Port for the Express server.
- `CORS_ORIGIN`
  Allowed browser origin for API requests.
- `INQUIRY_STORAGE_PATH`
  JSON file path used to store inquiry submissions locally.
- `ADMIN_EMAIL`
  Locked admin email used to sign in to the hidden editor.
- `ADMIN_PASSWORD`
  Locked admin password used to sign in to the hidden editor.
- `ADMIN_SESSION_SECRET`
  Secret used to sign the admin session cookie.
- `INQUIRY_EMAIL_FROM`
  Verified sender address or identity used by inquiry notification emails.
- `INQUIRY_EMAIL_TO_GENERAL`
  Comma-separated recipients for general inquiry notification emails. Defaults to `jaanagroup@gmail.com`.
- `INQUIRY_EMAIL_TO_FINANCE`
  Comma-separated recipients for finance inquiry notification emails. Defaults to `jaanafinance@gmail.com`.
- `INQUIRY_EMAIL_CC`
  Optional comma-separated CC recipients for inquiry notification emails.
- Inquiry delivery behavior
  All public inquiry submissions route through the shared `/api/inquiries` backend, including the main Contact Us inquiry form and the Donate-page endowment and employer-matching request forms. General inquiries go to `jaanagroup@gmail.com` and finance inquiries go to `jaanafinance@gmail.com`. The submitter also receives an automatic confirmation email, and replies to that confirmation go back to the configured JAANA recipient inbox.
- `REQUIRE_INQUIRY_EMAIL`
  Set to `true` in deployment so inquiry submissions fail visibly if email delivery is not configured. Vercel deployments default to requiring email delivery unless this is explicitly set to `false`.
- `RESEND_API_KEY`
  API key used to send inquiry notification emails through Resend.
- `VITE_API_PROXY_TARGET`
  Backend target for Vite's `/api` proxy.
- `VITE_HOST`
  Host for the Vite development server.
- `VITE_PORT`
  Port for the Vite development server.

## How to run locally

### 1. Install dependencies

```bash
npm install
```

### 2. Create the local env file

```bash
cp .env.example .env
```

### 3. Start the app in development

```bash
npm run dev
```

This starts:

- Vite front end on `http://127.0.0.1:5173`
- Express API on `http://127.0.0.1:3001`

Vite proxies `/api` requests to the Express server during development.

### 4. Open the site

- Front end: `http://127.0.0.1:5173`
- API health check: `http://127.0.0.1:3001/api/health`
- Hidden admin editor: `http://127.0.0.1:5173/admin`

The public Connect page is read-only. Editing happens only through the hidden `/admin` route.
The admin page uses a signed session cookie, a fixed admin email/password, a site-content editor, and an inquiry inbox for donations/sponsorship requests.
The site-content editor storage is still file-backed, so on Vercel you should connect it to persistent storage if you want edits to survive deploys and serverless restarts.

## Available scripts

### Development

```bash
npm run dev
```

Runs the front end and back end together.

```bash
npm run dev:client
```

Runs the Vite front end only.

```bash
npm run dev:server
```

Runs the Express server only with `nodemon`.

### Build

```bash
npm run build
```

Builds both:

- client output to `dist/client`
- server output to `dist/server`

```bash
npm run build:client
```

Type-checks the front end and builds the Vite client.

```bash
npm run build:server
```

Builds the server TypeScript output.

### Production run

```bash
npm run start
```

Runs the compiled Express server from `dist/server/index.js`.

After a build, this server also serves the static client from `dist/client`.

### Preview

```bash
npm run preview
```

Previews the built Vite client only. This is useful for front-end review, but it does not replace the Express API.

### Vercel

```bash
npm run build:vercel
```

Runs the Vercel-specific type check and builds the client output used by Vercel.

## API endpoints

### `GET /api/health`

Returns:

```json
{ "status": "ok" }
```

### `POST /api/inquiries`

Accepts:

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "organization": "Batch 2008",
  "interest": "Support a cause",
  "notes": "Interested in scholarships"
}
```

Required fields:

- `name`
- `email`
- `interest`

When `RESEND_API_KEY` is configured, the API also emails inquiry details to `INQUIRY_EMAIL_TO` and optional
`INQUIRY_EMAIL_CC` recipients. Submissions are still written to JSON storage if email is not configured.

### `GET /api/admin/inquiries`

Returns the latest inquiry submissions for the `/admin` inbox view.

## Inquiry storage

Inquiry entries are stored in JSON.

Default local path:

```text
server/data/inquiries.json
```

Notes:

- The file/directory is created automatically if it does not already exist.
- On Vercel, storage falls back to `/tmp/jaana-sjbhs-inquiries.json`.
- Vercel `/tmp` storage is ephemeral, so submissions are not durable there.

If this project moves beyond prototype/light production use, replace JSON storage with a database or hosted store.

## Deployment

This repo is configured for Vercel with:

- `vercel.json`
- root `api/` functions
- `npm run build:vercel`

Deploy flow:

1. Import the repo into Vercel.
2. Use the existing project settings from `vercel.json`.
3. Add production environment variables for `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `RESEND_API_KEY`, `INQUIRY_EMAIL_FROM`, `INQUIRY_EMAIL_TO_GENERAL`, `INQUIRY_EMAIL_TO_FINANCE`, and `REQUIRE_INQUIRY_EMAIL=true`.
4. Deploy.

The inquiry form depends on Resend in deployment. If `RESEND_API_KEY` or a verified `INQUIRY_EMAIL_FROM` sender is missing, deployed submissions return an error instead of pretending the message reached JAANA.

## Notes for the next developer

- The site is intentionally a single-page app with section/tab switching, not a multi-route site.
- Most of the content structure currently lives directly in `src/App.tsx`.
- The visual behavior for the Causes and Donate flows, along with the cause modals, is driven from `src/App.tsx` plus `src/styles.css`.
- If you need to change cause content, donation links, sponsor content, or contact details, start in `src/App.tsx`.
- If you need to change layout, sizing, modal appearance, or button behavior, start in `src/styles.css`.

## Verified

Last verified during this update:

- `npm run build`
- `npm run build:server`
