# FlowDesk AI

FlowDesk AI is a customer request management and AI classification platform. It unifies inbound requests from web and messaging channels, stores them in PostgreSQL, processes them through an AI worker, and displays them in a secure admin dashboard with live updates.

> Live demo: https://flowdesk-ai-4h1.pages.dev

## Key features

- Authentication with JWT access and refresh token flow
- Protected admin dashboard with role-based access controls
- Request ingestion via API, Telegram, and WhatsApp webhooks
- AI-powered request classification worker
- Redis-backed queue processing using BullMQ
- PostgreSQL data storage via Prisma ORM
- Real-time updates with Socket.IO
- Audit log and request history tracking

## Project structure

```
backend/
  index.js                 # Express server entry point
  src/
    config/               # DB, Redis, socket setup
    controllers/          # API and webhook handlers
    middleware/           # auth, role checks, rate limiting
    services/             # business logic and AI integrations
    workers/              # classification job worker
    routes/               # routing definitions
    webhooks/             # webhook receiver logic
  prisma/                  # schema and migrations

frontend/
  src/                     # React application source
    api/                   # Axios setup and token refresh handling
    hooks/                 # custom hooks like useSocket
    pages/                 # dashboard, login, request details, audit log
```

## API overview

### Authentication
- `POST /api/auth/login` — authenticate user and receive access token
- `POST /api/auth/refresh` — refresh access token using HTTP-only cookie
- `POST /api/auth/logout` — revoke session and logout user

### Requests
- `POST /api/requests` — create a new customer request
- `GET /api/requests` — list requests (protected)
- `GET /api/requests/:id` — fetch a request by ID (protected)
- `PATCH /api/requests/:id/status` — update request status (protected)
- `POST /api/requests/:id/notes` — add an internal note (protected)
- `GET /api/requests/events` — fetch request audit events (protected)

### Webhooks
- `POST /webhooks/telegram` — ingest incoming Telegram messages
- `POST /webhooks/whatsapp` — ingest incoming WhatsApp messages

## Getting started

### Prerequisites

- Node.js 20+ or later
- PostgreSQL
- Redis
- npm

### Install dependencies

```bash
cd backend
npm install
cd ../frontend
npm install
```

### Configure environment

Copy `backend/.env.example` or create `backend/.env` with values similar to:

```env
PORT=8000
DATABASE_URL=postgresql://postgres:password@localhost:5432/flow_desk_ai
REDIS_URL=redis://localhost:6379
ACCESS_TOKEN_SECRET=your_access_secret
REFRESH_TOKEN_SECRET=your_refresh_secret
TELEGRAM_WEBHOOK_SECRET=your_telegram_secret
BACKEND_URL=http://localhost:8000
FRONTEND_URL=http://localhost:5173
```

Add provider credentials if your deployment requires them:

```env
GEMINI_API_KEY=your_gemini_api_key
```

### Database setup

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

### Run locally

```bash
cd backend
npm run dev
```

Open a new terminal:

```bash
cd frontend
npm run dev
```

### Worker process

The classification worker runs separately:

```bash
cd backend
npm run worker
```

## Available scripts

### Backend
- `npm run dev` — start the backend server with nodemon
- `npm start` — run the backend server in production mode
- `npm run worker` — start the AI classification worker

### Frontend
- `npm run dev` — start the React app
- `npm run build` — build production assets
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Deployment

- Ensure `BACKEND_URL` is configured for the deployed frontend
- Use secure values for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- Run Redis and PostgreSQL in the target environment
- Deploy backend, then frontend, and run the worker process
- Configure webhook endpoints to use the deployed backend URL and secret token

## Notes

- The frontend is built with React, Vite, Tailwind CSS, and Socket.IO client
- The backend is built with Express, Prisma, BullMQ, Redis, and Socket.IO
- Request events are logged and surfaced in the audit log
- Refresh token handling is implemented via HTTP-only secure cookies

## Live demo

Visit the deployed frontend at:

https://flowdesk-ai-4h1.pages.dev
