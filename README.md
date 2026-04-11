# JAANA SJBHS

Full-stack starter for a redesigned JAANA marketing site.

The project uses:

- React + TypeScript + Vite for the front end
- Node.js + Express + TypeScript for the back end
- `concurrently` so the client and server run together with one command
- `dotenv` for local environment configuration

## What was done

This repo was scaffolded from an empty project into a working full-stack site inspired by the archived JAANA website, but with a cleaner and more premium UI direction.

Implemented work:

- Built a React TSX landing page with a more polished visual system and clearer section hierarchy
- Kept the emotional core of the original site while making the layout more user-friendly
- Added a live sponsor/contact inquiry form on the front end
- Added an Express API with `GET /api/health`
- Added an Express API with `GET /api/inquiries/stats`
- Added an Express API with `POST /api/inquiries`
- Added local JSON persistence for inquiry submissions
- Configured Vite to proxy `/api` requests to the Node server during development
- Set up `npm run dev` to start both the client and server at the same time
- Added production build scripts for both front end and back end

## Project structure

```text
.
├── src/
│   ├── App.tsx
│   ├── main.tsx
│   └── styles.css
├── server/
│   ├── index.ts
│   ├── lib/
│   │   └── inquiryStore.ts
│   └── data/
│       └── inquiries.json
├── .env.example
├── package.json
├── tsconfig.json
├── tsconfig.server.json
└── vite.config.ts
```

## Environment variables

Copy `.env.example` to `.env`.

Default values:

```env
HOST=127.0.0.1
PORT=3001
CORS_ORIGIN=http://127.0.0.1:5173
INQUIRY_STORAGE_PATH=./server/data/inquiries.json
VITE_API_PROXY_TARGET=http://127.0.0.1:3001
VITE_HOST=127.0.0.1
VITE_PORT=5173
```

What these do:

- `HOST`: host for the Express server
- `PORT`: port for the Express server
- `CORS_ORIGIN`: allowed browser origin for the API
- `INQUIRY_STORAGE_PATH`: local file used to store inquiry submissions
- `VITE_API_PROXY_TARGET`: backend target for Vite API proxying
- `VITE_HOST`: host for the Vite dev server
- `VITE_PORT`: port for the Vite dev server

## How to run locally

1. Install dependencies:

```bash
npm install
```

2. Copy the env file if you do not already have one:

```bash
cp .env.example .env
```

3. Start both the client and server:

```bash
npm run dev
```

4. Open the site:

- Front end: `http://127.0.0.1:5173`
- API: `http://127.0.0.1:3001`

## Available scripts

```bash
npm run dev
```

Starts Vite and the Node server together.

```bash
npm run build
```

Build output:
Client files go to `dist/client`.
Server files go to `dist/server`.

```bash
npm run preview
```

Previews the built front end.

```bash
npm run start
```

Runs the compiled production server from `dist/server/index.js`.

## Inquiry storage

Inquiry entries are stored locally in:

```text
server/data/inquiries.json
```

This is a simple placeholder persistence layer so the project is ready to swap over to a database later.

## Verified

The following was verified during setup:

- `npm install`
- `npm run build`
- `npm run dev`
- API health route responding correctly
- inquiry stats route responding correctly
- inquiry submission flow working end-to-end

## Notes for future backend work

This setup is intentionally simple so it can grow into a larger Node backend later.

Natural next steps:

- replace JSON storage with PostgreSQL, MongoDB, Supabase, or Prisma-backed persistence
- add email delivery or CRM sync for sponsor and alumni inquiries
- split the front end into reusable section components
- add routing if the site grows beyond a single landing page
- add validation libraries and request logging on the API
