# The Last Onion

Shared grocery shopping lists with smart categories, usual items, and real-time sync.

## Features

- Multiple grocery lists per household
- Check off items — checked items move to the bottom, newest on top
- One row per item (re-adding "carrots" reuses the same entry)
- Auto-categorization (Vegetables, Dairy, Baking, etc.) with editable categories
- Usual items from purchase history + manual pins, bulk-add to any list
- Household sharing + per-list invites
- Real-time updates via WebSocket when someone else edits a list

## Stack

| Layer | Tech |
|-------|------|
| Frontend | Vue 3, TypeScript, Pinia, Vue Router, Vite |
| Backend | Fastify, Prisma, PostgreSQL, Socket.io |
| Deploy | Scalingo (web + API apps, Postgres addon) |

## Local development

### Prerequisites

- Node.js 20+
- Docker (for local Postgres)

### 1. Start Postgres

```bash
docker compose up -d
```

### 2. API

```bash
cd server
cp .env.example .env
npm install
npx prisma migrate dev
npm run dev
```

API runs at `http://localhost:3001`.

### 3. Frontend

```bash
cp .env.example .env
npm install
npm run dev
```

App runs at `http://localhost:5173`.

## Tests

```bash
# Frontend unit tests
npm run test:unit

# Server unit tests
cd server && npm test

# E2E (API must be running)
npx cypress run --e2e --spec cypress/e2e/grocery.cy.ts
```

## Deploy on Scalingo

### API app (`the-last-onion-api`)

1. Create a Scalingo app and attach the **PostgreSQL** addon.
2. Set environment variables:
   - `JWT_SECRET` — random secret string
   - `CORS_ORIGIN` — your frontend URL (e.g. `https://the-last-onion-web.osc-fr1.scalingo.io`)
3. Deploy from the `server/` directory (or set `SCALINGO_APP` / use subdirectory buildpack).
4. Migrations run automatically via `Procfile` (`db:migrate:deploy` on release).

### Web app (`the-last-onion-web`)

1. Create a second Scalingo app for the static frontend.
2. Set `VITE_API_URL` to your API URL **at build time** (Scalingo build env var).
3. Deploy from project root — `Procfile` runs `npm run build && npm start` (serves `dist/` via `serve.js`).

## Project structure

```
├── src/                 # Vue frontend
├── server/
│   ├── prisma/          # Schema & migrations
│   └── src/
│       ├── routes/      # REST API
│       ├── services/    # Business logic
│       └── lib/         # Helpers (normalize, categories, access)
├── cypress/e2e/         # E2E tests
└── docker-compose.yml   # Local Postgres
```
