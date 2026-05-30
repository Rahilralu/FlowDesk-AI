# FlowDesk AI

FlowDesk AI is an internal operations tool for capturing customer requests from multiple channels, classifying them with AI, and tracking them through a live admin workflow.

## What is implemented

- Multi-channel ingestion from:
  - Telegram webhook
  - WhatsApp webhook
  - web/API request creation
- Request storage in PostgreSQL via Prisma
- Background classification queue powered by BullMQ and Redis
- AI classification worker with provider integration
- JWT auth with access + refresh token flow
- Refresh cookie handling with secure cross-origin support
- Protected admin routes with role-based access control
- Real-time updates via Socket.IO
- Audit log endpoint and event streaming
- Frontend dashboard with login, request detail, and audit log pages

## Backend endpoints

### Auth
- `POST /api/auth/login` — login and set refresh cookie
- `POST /api/auth/refresh` — refresh access token using HTTP-only cookie
- `POST /api/auth/logout` — revoke refresh cookie and logout

### Requests
- `POST /api/requests` — create a new customer request
- `GET /api/requests` — list all requests (protected, role-based)
- `GET /api/requests/:id` — get a single request by ID (protected)
- `PATCH /api/requests/:id/status` — update request status (protected)
- `POST /api/requests/:id/notes` — add an internal note (protected)
- `GET /api/requests/events` — get audit events for requests (protected)

### Webhooks
- `POST /webhooks/telegram` — Telegram webhook receiver
- `POST /webhooks/whatsapp` — WhatsApp webhook receiver

## Frontend

The frontend includes:
- login page
- admin dashboard with live request updates
- request detail page
- audit log page with real-time event streaming
- Axios refresh interceptor for automatic access token renewal

## Architecture overview

- `backend/index.js` — Express server with API routing, webhook mounting, and Socket.IO initialization
- `backend/src/config/` — database and Redis connection helpers
- `backend/src/controllers/` — auth, request, and webhook handlers
- `backend/src/middleware/` — authentication, CSRF, rate limiting, and role checks
- `backend/src/services/` — auth token logic, webhook ingestion, and AI classification
- `backend/src/workers/` — background classification worker
- `frontend/src/` — React app with protected routes and socket integration

## Environment variables

Required variables in `backend/.env`:
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

Optional or provider-specific variables:
```env
GOOGLE_API_KEY=your_google_api_key
```

## Setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Install frontend dependencies:
   ```bash
   cd ../frontend
   npm install
   ```

3. Create or update `backend/.env` as described above.

4. Run Prisma migrations:
   ```bash
   cd backend
   npx prisma generate
   npx prisma migrate dev --name init
   ```

5. Start backend server:
   ```bash
   npm run dev
   ```

6. Start frontend dev server:
   ```bash
   cd frontend
   npm run dev
   ```

## Notes

- The backend now supports refresh token renewal without forcing login on page refresh.
- Telegram and WhatsApp webhook routes are active and consume incoming messages into the request queue.
- The audit log page is implemented and receives real-time socket updates.
- The AI classification worker requires a valid provider API key if using real AI integration.
