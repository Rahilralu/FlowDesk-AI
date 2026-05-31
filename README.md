# FlowDesk AI

FlowDesk AI is a customer request management platform built for internal operations. It collects requests from multiple channels, stores them in PostgreSQL, classifies them using AI, and presents them in a protected admin dashboard with real-time updates.

## Repository structure

- `backend/` — Express API server, authentication, request handling, webhook receivers, and worker logic
- `frontend/` — React + Vite admin dashboard, login, request detail, and audit log UI
- `backend/prisma/` — Prisma schema and migration history
- `backend/src/` — backend application code
- `frontend/src/` — frontend application code

## Features

- User authentication with JWT access token + refresh token flow
- Protected admin routes with role-based access control
- Customer request ingestion via API and webhook endpoints
- AI-powered request classification worker using external provider integration
- Redis-backed queue processing with BullMQ
- PostgreSQL storage via Prisma ORM
- Real-time live updates using Socket.IO
- Audit log for request event tracking and history
- Admin dashboard with filters, request list, request details, and audit log

## Backend API

### Authentication
- `POST /api/auth/login` — login and start a session
- `POST /api/auth/refresh` — refresh access token using HTTP-only cookie
- `POST /api/auth/logout` — revoke refresh session

### Requests
- `POST /api/requests` — create a new customer request
- `GET /api/requests` — list requests (protected)
- `GET /api/requests/:id` — retrieve a request by ID (protected)
- `PATCH /api/requests/:id/status` — update request status (protected)
- `POST /api/requests/:id/notes` — add an internal note to a request (protected)
- `GET /api/requests/events` — fetch request audit events (protected)

### Webhooks
- `POST /webhooks/telegram` — receive and ingest Telegram messages
- `POST /webhooks/whatsapp` — receive and ingest WhatsApp messages

## Setup

### Prerequisites

- Node.js 20+ or later
- PostgreSQL
- Redis
- npm

### Backend install

```bash
cd backend
npm install
```

### Frontend install

```bash
cd frontend
npm install
```

### Environment variables

Create `backend/.env` with the following values:

```env
DATABASE_URL=postgresql://user:password@localhost:5432/cognifyr
REDIS_URL=redis://localhost:6379
ACCESS_TOKEN_SECRET=your_access_token_secret
REFRESH_TOKEN_SECRET=your_refresh_token_secret
TELEGRAM_WEBHOOK_SECRET=your_telegram_secret_token
BACKEND_URL=http://localhost:8000
NODE_ENV=development
PORT=8000
```

Add provider-specific values if needed:

```env
GOOGLE_API_KEY=your_google_api_key
TWILIO_ACCOUNT_SID=your_twilio_sid
TWILIO_AUTH_TOKEN=your_twilio_token
```

### Database setup

```bash
cd backend
npx prisma generate
npx prisma migrate dev --name init
```

## Run locally

### Backend

```bash
cd backend
npm run dev
```

### Frontend

```bash
cd frontend
npm run dev
```

### Worker

```bash
cd backend
npm run worker
```

## Useful scripts

### Backend
- `npm run dev` — start backend with nodemon
- `npm start` — start backend normally
- `npm run worker` — run the classification worker

### Frontend
- `npm run dev` — start Vite dev server
- `npm run build` — build production-ready frontend assets
- `npm run preview` — preview the production build
- `npm run lint` — run ESLint

## Project notes

- The frontend uses `react-router-dom` and `socket.io-client` for navigation and real-time updates.
- The backend uses `express`, `bullmq`, `redis`, and `socket.io` to process requests and emit live events.
- Prisma handles PostgreSQL data access and schema migrations.

## Deployment notes

- Ensure `BACKEND_URL` points to the live backend for the frontend configuration
- Use secure secrets for `ACCESS_TOKEN_SECRET` and `REFRESH_TOKEN_SECRET`
- Run Redis and PostgreSQL before starting the backend
- Start the worker process alongside the backend for AI classification jobs

## Troubleshooting

- If login or token refresh fails, check the backend `.env` secrets and CORS configuration
- If webhooks are not working, verify the webhook secret and the incoming request body format
- If real-time updates are missing, ensure Socket.IO is connected and the server is running
