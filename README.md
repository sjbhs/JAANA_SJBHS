<p align="center">
  <img src="public/assets/jaana-wordmark.png" alt="JAANA — The Josephite Alumni Association of North America" width="420" />
</p>

# JAANA

Full-stack web platform for the Josephite Alumni Association of North America. It brings alumni outreach, school causes, donations, event registration, photo galleries, inquiries, and reunion merchandise into one responsive application.

[![React](https://img.shields.io/badge/React-18.3-61DAFB?logo=react&logoColor=white)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-4.5-646CFF?logo=vite&logoColor=white)](https://vite.dev/)
[![Express](https://img.shields.io/badge/Express-4.21-000000?logo=express&logoColor=white)](https://expressjs.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Configured-000000?logo=vercel&logoColor=white)](https://vercel.com/)

---

## Table of contents

- [Overview](#overview)
- [Key features](#key-features)
- [How the application works](#how-the-application-works)
- [Technology stack](#technology-stack)
- [Quick start](#quick-start)
- [Environment configuration](#environment-configuration)
- [Available commands](#available-commands)
- [Application routes](#application-routes)
- [API reference](#api-reference)
- [Project structure](#project-structure)
- [Data and persistence](#data-and-persistence)
- [Deployment](#deployment)
- [Security and accessibility](#security-and-accessibility)
- [Testing and verification](#testing-and-verification)
- [Troubleshooting](#troubleshooting)
- [Current limitations](#current-limitations)

---

## Overview

JAANA is the public website and operations portal for the Josephite Alumni Association of North America. The public experience supports alumni communication, giving, event promotion, sponsor recognition, and merchandise reservations. A protected dashboard gives administrators a single place to maintain content and handle incoming activity.

This repository contains four connected experiences:

1. **Public alumni website** — home, causes, giving, contact, and North America Connect content.
2. **Josephite Store** — an inventory-aware catalog and event-pickup reservation flow.
3. **Administration dashboard** — content, media, inquiry, inventory, and order management.
4. **Shared API layer** — Express for local/self-hosted use and a Vercel handler for serverless deployment.

### Engineering highlights

- The Express server and Vercel function reuse the same validation, authentication, notification, rate-limiting, and persistence modules.
- Editable content is normalized against typed defaults before it reaches the UI, which protects the site from incomplete saved data.
- Merchandise bundles consume their underlying component inventory rather than maintaining unrelated stock counts.
- Reservation totals are calculated on the server; the browser does not supply authoritative prices.
- Inquiry and merchandise email failures are surfaced to the UI when delivery is required.
- The interface includes keyboard navigation, skip links, accessible tabs, labeled forms, and dismissible dialogs.

---

## Key features

### Public website

- Responsive navigation for desktop and mobile layouts
- Home, Causes, Donate, Contact, and North America Connect 2026 sections
- Structured cause cards with detailed funding and impact dialogs
- Embedded Zeffy donation, sponsorship, and registration flows
- Event schedules, pricing, travel guidance, hotel details, and local recommendations
- Sponsor tiers, sponsor recognition, and supporting downloadable documents
- Categorized event albums with full-screen image viewing and zoom controls
- Contact and finance inquiry forms with server-side validation

### Josephite Store

- Individual products and multi-item bundles
- Size, color, and quantity selection
- Availability calculated against component-level inventory
- Cart totals calculated from the canonical server-side catalog
- Event-pickup reservations with no online payment collection
- Customer confirmation and internal notification emails
- Generated PDF receipt attachments
- Reservation IDs for customer support and pickup reconciliation

### Administration dashboard

- Email/password sign-in backed by a signed HTTP-only session cookie
- Structured page-copy and cause editing
- Donation-route and inquiry-topic management
- Album, gallery, and media management
- Inquiry filtering by date, category, and status
- Inquiry completion tracking and deletion
- CSV and Excel-compatible inquiry exports
- Inventory quantity and product-image management
- Merchandise image management
- Reservation review, cancellation, and CSV/XLSX exports

### API behavior

- Payload validation and normalization before persistence
- IP-based throttling for login, inquiry, and reservation endpoints
- Shared SMTP transport for all website-generated email
- Local JSON persistence for development
- Supabase/Postgres-backed merchandise inventory and reservations for Vercel
- No-cache headers on administrative and inventory responses

---

## How the application works

```text
Browser
  ├── Public React application
  ├── Josephite Store
  └── Protected admin dashboard
            │
            │ /api
            ▼
       Runtime adapter
       ┌────┴───────────────┐
       │                    │
Express server       Vercel handler
       │                    │
       └─────────┬──────────┘
                 ▼
        Shared server modules
  ├── authentication and rate limiting
  ├── inquiry validation and notification
  ├── content normalization and persistence
  ├── inventory and reservation services
  └── SMTP delivery and PDF generation
                 │
                 ▼
   Local JSON, SMTP, and Supabase/Postgres
```

### Public content flow

The client starts with typed default content from `src/site/content.ts`. It then requests `/api/site-content`, normalizes the response in `src/site/siteContent.ts`, and replaces the defaults when valid saved content is available. If the API is unavailable, the public site can still render from its built-in content.

### Inquiry flow

1. A visitor submits the Contact or Donate inquiry form.
2. The API normalizes and validates the payload.
3. The submission is saved to the configured inquiry store.
4. The server selects the general or finance recipient group.
5. Nodemailer sends the internal notification and visitor confirmation.
6. The admin dashboard can filter, export, complete, or delete the inquiry.

### Merchandise reservation flow

1. The store loads current inventory, prices, and image overrides from the API.
2. The cart prevents a product or bundle from consuming more stock than is available.
3. The API validates the customer, SKUs, options, and quantities.
4. Prices and totals are recalculated from server-owned catalog data.
5. The reservation updates local JSON or the Supabase inventory functions.
6. The server generates a PDF receipt and sends customer/admin emails.
7. Updated inventory is returned to the browser immediately.

### Admin authentication flow

The configured administrator signs in at `/admin`. Successful authentication creates a signed session cookie with `HttpOnly`, `SameSite=Strict`, and production-only `Secure` attributes. Protected API routes validate that cookie before reading or changing administrative data.

---

## Technology stack

### Frontend

| Tool | Role |
| --- | --- |
| React 18 | Component-based public site, store, and admin interface |
| TypeScript | Shared content, API, inventory, and component types |
| Vite | Development server, API proxy, and production client build |
| CSS | Responsive layouts, visual system, dialogs, forms, and print behavior |

### Backend

| Tool | Role |
| --- | --- |
| Node.js | Server runtime and build tooling |
| Express | Local development API and compiled production server |
| Vercel Functions | Serverless API adapter for deployed environments |
| Nodemailer | Inquiry confirmations and merchandise receipt delivery |
| Node `crypto` | HMAC signing and timing-safe credential comparison |

### Data and integrations

| Tool | Role |
| --- | --- |
| Local JSON | Zero-setup development persistence |
| Supabase/Postgres | Durable merchandise inventory and reservation storage |
| Zeffy | Embedded donations, sponsorships, and event registration |
| SMTP provider | Transactional inquiry and merchandise email |
| Vercel | Static client hosting, API routing, and serverless execution |

---

## Quick start

### Prerequisites

- Node.js 18 or newer
- npm
- Git

Supabase and SMTP are optional for basic local development. They are needed to exercise durable merchandise storage and email delivery.

### 1. Clone the repository

```bash
git clone https://github.com/sjbhs/JAANA_SJBHS.git
cd JAANA_SJBHS
```

### 2. Install dependencies

Use the committed lockfile for a reproducible install:

```bash
npm ci
```

Use `npm install` instead when intentionally changing dependencies.

### 3. Add local configuration when needed

The public site and file-backed development services have working defaults. Create a root `.env` file to enable the admin dashboard or email delivery.

Minimal admin configuration:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-long-unique-password
ADMIN_SESSION_SECRET=replace-with-at-least-32-random-characters
```

Do not commit `.env` or real credentials.

### 4. Start the application

```bash
npm run dev
```

This launches the client and API together:

| Service | URL |
| --- | --- |
| Public website | `http://127.0.0.1:5173` |
| Admin dashboard | `http://127.0.0.1:5173/admin` |
| Josephite Store | `http://127.0.0.1:5173/josephite-store` |
| API health check | `http://127.0.0.1:3001/api/health` |

Vite proxies browser requests from `/api` to the Express server at port `3001`.

### 5. Confirm the services are running

```bash
curl http://127.0.0.1:3001/api/health
curl http://127.0.0.1:3001/api/merchandise/health
```

Expected local responses include:

```json
{ "status": "ok" }
```

```json
{ "ok": true, "storage": "local-json" }
```

### Run a production-style build locally

```bash
npm run build
npm run start
```

The compiled Express process serves both the API and `dist/client` at `http://127.0.0.1:3001`.

---

## Environment configuration

All server secrets belong in the root `.env` file or the deployment provider's environment settings.

### Runtime and local development

| Variable | Default | Purpose |
| --- | --- | --- |
| `HOST` | `127.0.0.1` | Express bind address |
| `PORT` | `3001` | Express port |
| `CORS_ORIGIN` | Local Vite origins | Comma-separated browser origins allowed by Express |
| `VITE_API_PROXY_TARGET` | `http://localhost:${PORT}` | Vite `/api` proxy target |
| `VITE_HOST` | `127.0.0.1` | Vite bind address |
| `VITE_PORT` | `5173` | Vite port |

### Admin authentication

| Variable | Required for admin | Purpose |
| --- | --- | --- |
| `ADMIN_EMAIL` | Yes | The single allowed administrator email |
| `ADMIN_PASSWORD` | Yes | Administrator password; use a unique production value |
| `ADMIN_SESSION_SECRET` | Yes | HMAC secret used to sign session cookies; use at least 32 characters |

### SMTP and inquiry routing

| Variable | Purpose |
| --- | --- |
| `SMTP_HOST` | SMTP server hostname |
| `SMTP_PORT` | SMTP port; commonly `587` for STARTTLS or `465` for implicit TLS |
| `SMTP_SECURE` | `true` for implicit TLS, otherwise `false` |
| `SMTP_USER` | SMTP username |
| `SMTP_PASS` | SMTP password or provider app password |
| `SMTP_FROM` | Sender mailbox used by website-generated email |
| `INQUIRY_EMAIL_TO_GENERAL` | Comma-separated recipients for general inquiries |
| `INQUIRY_EMAIL_TO_FINANCE` | Comma-separated recipients for finance inquiries |
| `INQUIRY_EMAIL_CC` | Optional comma-separated copied recipients |
| `REQUIRE_INQUIRY_EMAIL` | Fail an inquiry request when notification delivery is unavailable |
| `MERCHANDISE_RECEIPT_EMAIL_TO` | Internal recipients for reservation receipt copies |
| `REQUIRE_MERCHANDISE_RECEIPT_EMAIL` | Prevent reservations when receipt delivery is not configured |

Example SMTP configuration:

```env
SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=website@example.com
SMTP_PASS=replace-with-provider-credential
SMTP_FROM=JAANA <website@example.com>

INQUIRY_EMAIL_TO_GENERAL=general@example.com
INQUIRY_EMAIL_TO_FINANCE=finance@example.com
INQUIRY_EMAIL_CC=
REQUIRE_INQUIRY_EMAIL=true

MERCHANDISE_RECEIPT_EMAIL_TO=store@example.com
REQUIRE_MERCHANDISE_RECEIPT_EMAIL=true
```

### Persistence

| Variable | Purpose |
| --- | --- |
| `INQUIRY_STORAGE_PATH` | Override the local inquiry JSON file |
| `SITE_CONTENT_STORAGE_PATH` | Override the editable site-content JSON file |
| `MERCHANDISE_STORAGE_PATH` | Override the local reservation JSON file |
| `MERCHANDISE_SUPABASE_URL` | Supabase project URL for merchandise storage |
| `MERCHANDISE_SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase service role credential |
| `MERCHANDISE_SUPABASE_TIMEOUT_MS` | Supabase request timeout, clamped between 1 and 30 seconds |

The generic `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` names are also accepted as fallbacks. Never expose a service role key through a `VITE_` variable.

---

## Available commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Run Vite and Express concurrently |
| `npm run dev:client` | Run only the Vite client |
| `npm run dev:server` | Run only Express with `nodemon` reloads |
| `npm run build` | Type-check and build the client and Express server |
| `npm run build:client` | Type-check and build the browser application |
| `npm run build:server` | Compile the Express server to `dist/server` |
| `npm run check:vercel` | Type-check the Vercel handler and shared modules |
| `npm run build:vercel` | Run the Vercel check and build `dist/client` |
| `npm run preview` | Preview the built client without an API server |
| `npm run start` | Run the compiled Express server |

`npm run preview` is intended for visual review only. Forms, content loading, inventory, and admin features still require an API process.

---

## Application routes

| Route | Purpose |
| --- | --- |
| `/` | Public application; section navigation is stored in the URL hash |
| `/#home` | Home section |
| `/#causes` | School causes |
| `/#donate` | Donation options |
| `/#contact` | Public inquiry form |
| `/#connect` | North America Connect 2026 information |
| `/josephite-store` | Merchandise catalog and reservation checkout |
| `/admin` | Protected administration dashboard |

Vercel rewrites `/admin` and `/josephite-store` to the SPA entry point so direct navigation and refreshes work correctly.

---

## API reference

### Public endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/health` | Basic API health check |
| `GET` | `/api/site-content` | Read normalized public site content |
| `POST` | `/api/inquiries` | Validate, save, and notify on a public inquiry |
| `GET` | `/api/merchandise/health` | Check the active merchandise storage provider |
| `GET` | `/api/merchandise/inventory` | Read current product, bundle, price, and availability data |
| `GET` | `/api/merchandise/images` | Read merchandise image overrides |
| `POST` | `/api/merchandise/orders` | Create an event-pickup reservation and send its receipt |

### Authenticated endpoints

| Method | Endpoint | Purpose |
| --- | --- | --- |
| `GET` | `/api/admin/session` | Check the current admin session |
| `POST` | `/api/admin/login` | Verify credentials and create a session cookie |
| `POST` | `/api/admin/logout` | Clear the session cookie |
| `PUT` | `/api/site-content` | Validate and save editable public content |
| `GET` | `/api/admin/inquiries` | Read filtered or recent inquiries |
| `PATCH` | `/api/admin/inquiries/:id` | Update inquiry completion status |
| `DELETE` | `/api/admin/inquiries/:id` | Delete an inquiry |
| `GET` | `/api/admin/merchandise/inventory` | Read inventory for administration |
| `PATCH` | `/api/admin/merchandise/inventory` | Update total inventory quantity |
| `GET` | `/api/admin/merchandise/orders` | Read reservation orders |
| `PATCH` | `/api/admin/merchandise/orders` | Cancel an order or selected quantity |
| `GET` | `/api/admin/merchandise/images` | Read merchandise image configuration |
| `POST` | `/api/admin/merchandise/images` | Upload or replace a product image |
| `DELETE` | `/api/admin/merchandise/images/:sku` | Remove a product image override |

### Example inquiry request

```bash
curl -X POST http://127.0.0.1:3001/api/inquiries \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Doe",
    "email": "jane@example.com",
    "organization": "Class of 2008",
    "interest": "Support a cause",
    "recipientGroup": "general",
    "notes": "I would like more information about the scholarship program."
  }'
```

Required inquiry fields are `name`, `email`, and `interest`. `recipientGroup` accepts `general` or `finance` and defaults to `general`.

---

## Project structure

```text
JAANA_SJBHS/
├── api/
│   ├── index.ts                      # Vercel route dispatcher
│   └── admin/                        # Shared serverless auth helpers
├── database/
│   ├── README.md                     # Inquiry database notes
│   └── inquiries.sql                 # PostgreSQL inquiry schema and export view
├── public/
│   ├── assets/
│   │   ├── albums/                   # Event gallery images
│   │   ├── merchandise/              # Product photography
│   │   ├── sponsors/                 # Sponsor marks
│   │   └── optimized/                # Web-optimized imagery
│   └── docs/                         # Event and sponsorship PDFs
├── server/
│   ├── data/                         # Local JSON stores
│   ├── lib/
│   │   ├── adminAuth.ts              # Signed admin sessions
│   │   ├── inquiryNotifications.ts   # Inquiry email templates and delivery
│   │   ├── inquiryStore.ts           # Inquiry persistence and filtering
│   │   ├── inquiryValidation.ts      # Public inquiry validation
│   │   ├── merchandiseImageStore.ts  # Product image overrides
│   │   ├── merchandiseReceiptNotifications.ts
│   │   ├── merchandiseReservationStore.ts
│   │   ├── rateLimit.ts              # In-memory IP rate limiter
│   │   ├── siteContentStore.ts       # Editable content persistence
│   │   └── smtpTransport.ts          # Shared SMTP configuration
│   ├── sql/
│   │   └── merchandise_reservations_supabase.sql
│   └── index.ts                      # Express application
├── src/
│   ├── site/
│   │   ├── components/               # Public pages, dialogs, store, and admin UI
│   │   ├── accessibility.tsx         # Keyboard tab-navigation helper
│   │   ├── content.ts                # Default site and event content
│   │   ├── inquiryConstraints.ts     # Shared browser/server field constraints
│   │   ├── merchandiseImages.ts      # Default product imagery
│   │   ├── merchandiseInventory.ts   # Products, bundles, prices, and stock
│   │   ├── merchandiseReport.ts      # CSV/XLSX merchandise reports
│   │   ├── optimizedImages.ts        # Optimized asset selection
│   │   ├── siteContent.ts            # Content defaults and normalization
│   │   └── types.ts                  # Shared client content types
│   ├── App.tsx                       # Application shell and navigation
│   ├── main.tsx                      # React entry point
│   └── styles.css                    # Application styling
├── index.html
├── package.json
├── tsconfig.json                     # Browser TypeScript target
├── tsconfig.server.json              # Express TypeScript target
├── tsconfig.vercel.json              # Vercel TypeScript target
├── vercel.json                       # Build, output, and rewrite configuration
└── vite.config.ts                    # Client development and proxy configuration
```

---

## Data and persistence

| Data | Local development | Vercel/serverless | Durable setup |
| --- | --- | --- | --- |
| Site content | `server/data/site-content.json` | Temporary filesystem | Move to a database or hosted document store |
| Inquiries | `server/data/inquiries.json` | Temporary filesystem | Wire the store to `database/inquiries.sql` |
| Merchandise reservations | `server/data/merchandise-reservations.json` | Supabase required | Apply the merchandise SQL schema |
| Merchandise image overrides | JSON plus `public/assets/merchandise/uploads` | Filesystem writes are not durable | Move uploads to object storage |

### Merchandise database setup

1. Create a Supabase project.
2. Open its SQL editor.
3. Run [`server/sql/merchandise_reservations_supabase.sql`](server/sql/merchandise_reservations_supabase.sql).
4. Set `MERCHANDISE_SUPABASE_URL` and `MERCHANDISE_SUPABASE_SERVICE_ROLE_KEY` on the server.
5. Confirm the connection with `GET /api/merchandise/health`.

The SQL schema includes products, bundle components, reservations, reservation items, inventory views, and database functions for reservation and cancellation behavior.

### Inquiry database starting point

[`database/inquiries.sql`](database/inquiries.sql) defines a PostgreSQL inquiry table, validation constraints, indexes, row-level security, and a flattened export view. The current application store is still file-backed; the SQL file is a migration starting point, not an active adapter.

---

## Deployment

### Vercel

The repository includes `vercel.json` with the client build, output directory, API rewrite, and SPA route rewrites.

1. Import `sjbhs/JAANA_SJBHS` into Vercel.
2. Keep the project root at the repository root.
3. Use `npm run build:vercel` as the build command.
4. Use `dist/client` as the output directory.
5. Add admin, SMTP, inquiry-routing, and Supabase variables in the project settings.
6. Run the merchandise Supabase SQL before enabling store reservations.
7. Deploy and check `/api/health` and `/api/merchandise/health`.

Vercel routes `/api/*` through `api/index.ts`. The same handler dispatches each HTTP method to shared service modules.

### Self-hosted Node process

```bash
npm ci
npm run build
NODE_ENV=production npm run start
```

Set `HOST=0.0.0.0` when the process must accept traffic from outside the machine or container. Place a TLS-enabled reverse proxy or platform load balancer in front of the Node process.

---

## Security and accessibility

### Security controls

- HMAC-SHA256 signed admin session tokens
- Timing-safe password and signature comparisons
- `HttpOnly` and `SameSite=Strict` session cookies
- `Secure` cookies in production and Vercel environments
- Server-side validation for inquiry and merchandise payloads
- Server-owned merchandise names and prices
- IP-based login, inquiry, reservation, and Express admin throttling
- No-store caching headers for administrative data
- Service role credentials kept in server-only environment variables

The rate limiter is process-local. It is suitable for basic abuse protection but is not a replacement for a shared rate-limit service in a horizontally scaled deployment.

### Accessibility behavior

- Skip links for public and admin layouts
- Semantic labels on forms and controls
- Roving keyboard focus for tab navigation
- Escape-key handling for menus and dialogs
- ARIA-selected states for page tabs
- Status and alert regions for asynchronous form feedback
- Responsive layouts across desktop and mobile breakpoints

---

## Testing and verification

### TypeScript and production builds

```bash
npm run build
npm run build:vercel
```

These commands verify the browser, Express, and Vercel TypeScript targets and produce the client/server builds.

### Recommended manual smoke test

- [ ] Load the public website and move through every navigation tab.
- [ ] Open and close cause, gallery, donation, and event dialogs with mouse and keyboard.
- [ ] Submit a general inquiry and verify its validation and success/error state.
- [ ] Sign in to `/admin` with configured local credentials.
- [ ] Edit site content, save it, and confirm the public view refreshes.
- [ ] Filter and export inquiries from the admin dashboard.
- [ ] Open the store, add individual and bundled products, and adjust quantities.
- [ ] Complete a reservation and confirm inventory decreases.
- [ ] Verify the customer PDF receipt and internal email when SMTP is enabled.
- [ ] Cancel a reservation and confirm component inventory is restored.
- [ ] Run both health endpoints in the target deployment.
- [ ] Review the public site at mobile and desktop widths.

There is no standalone automated test suite configured in `package.json` at present. The build checks above are the current automated release gate.

---

## Troubleshooting

### The website loads but forms say the backend is unavailable

- Start both services with `npm run dev`, not `npm run dev:client`.
- Confirm `curl http://127.0.0.1:3001/api/health` succeeds.
- Check that `VITE_API_PROXY_TARGET` points to the Express port.
- Restart Vite after changing environment variables.

### Admin sign-in reports that authentication is not configured

Set all three admin variables and restart the server:

```env
ADMIN_EMAIL=admin@example.com
ADMIN_PASSWORD=replace-with-a-long-unique-password
ADMIN_SESSION_SECRET=replace-with-at-least-32-random-characters
```

### Inquiry or receipt email cannot be sent

- Confirm `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS`, and `SMTP_FROM`.
- Use an app password if the email provider requires one.
- Match `SMTP_SECURE=true` with implicit TLS, normally port `465`.
- Use `SMTP_SECURE=false` for STARTTLS configurations, normally port `587`.
- Set the matching `REQUIRE_*_EMAIL` variable to `false` only for development where delivery is intentionally optional.

### Merchandise works locally but fails after deployment

Vercel intentionally refuses to treat temporary files as durable reservation storage. Apply the Supabase SQL, add both merchandise Supabase variables, redeploy, and check `/api/merchandise/health`.

### Saved content or inquiries disappear on Vercel

Those stores currently fall back to the temporary filesystem in serverless environments. Connect them to persistent storage before relying on them for production records.

### A port is already in use

Choose different ports in `.env` and keep the Vite proxy aligned:

```env
PORT=3002
VITE_PORT=5174
VITE_API_PROXY_TARGET=http://127.0.0.1:3002
CORS_ORIGIN=http://127.0.0.1:5174
```

---

## Current limitations

- Inquiry and editable site-content persistence are file-backed.
- Admin-uploaded merchandise images require object storage for durable serverless use.
- Rate-limit state is held in memory and is not shared between instances.
- Authentication supports one configured administrator rather than multiple roles.
- Automated unit and end-to-end test suites have not yet been added.

These boundaries are documented so the repository can be evaluated accurately and the next production-hardening work is clear.
