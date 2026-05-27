# FlowDesk AI

A small internal operations tool for capturing customer requests from multiple channels, classifying them with AI or a mock AI module, assigning priority, routing them into a workflow, and tracking status through an admin dashboard.

## Project idea

FlowDesk AI is designed to help support, sales, or automation teams manage customer messages from:
- Website forms
- WhatsApp
- Email
- API/webhook simulations

Each request should be:
1. Saved immediately and marked as `NEW` or `QUEUED`
2. Processed by a background AI classification worker
3. Stored with a separate AI classification snapshot
4. Shown in a live admin dashboard with realtime status updates
5. Updated by an admin or agent with status changes and internal notes

## Core workflow

- **Ingestion**: customer message enters via API or webhook simulation
- **Queueing**: request is stored right away as new/queued
- **AI classification**: a replaceable skill layer labels request category, priority, summary, and routing
- **Tracking**: admin dashboard sees updates live
- **Operations**: admins can change status and add internal notes

## AI skills layer

The AI layer should be modular and replaceable. It can be implemented as a mock provider initially, with the ability to swap in a real provider later.

Suggested skills:
- `Classification Skill`: sales, support, urgent, spam, or other
- `Priority Skill`: low, medium, or high
- `Summary Skill`: short internal summary for admins
- `Routing Skill`: simple queue or workflow assignment

## Minimum data model

The Prisma schema currently defines the following core models:

- `User`
  - admin/agent accounts
  - password hash
  - role
  - created timestamp
- `CustomerRequest`
  - original message
  - source channel
  - customer info
  - status
  - category snapshot
  - priority snapshot
- `AiClassification`
  - request_id
  - provider
  - category
  - priority
  - summary
  - confidence
  - raw output
  - error state
- `RequestEvent`
  - request_id
  - event type
  - old/new values
  - actor
  - metadata
  - timestamp
- `InternalNote`
  - request_id
  - author
  - note body
  - created timestamp

## Current backend structure

`backend/`
- `index.js` - Express server entry point
- `package.json` - backend dependencies and scripts
- `prisma/schema.prisma` - data schema for PostgreSQL
- `src/config/psql.js` - Prisma client setup
- `src/config/redis.js` - Redis connection helper
- `src/middleware/auth.middleware.js` - JWT auth and refresh token middleware
- `src/routes/app.routes.js` - mounted API router (currently empty)
- `src/utils/tokens.js` - access and refresh token generation

`frontend/`
- currently empty

## What is implemented today

- Express server configured with CORS, security headers, JSON body parsing, and cookie parsing
- PostgreSQL schema defined via Prisma for all required models
- Redis connection setup for caching or background queue use
- JWT middleware for protected routes and refresh token validation
- A mounted `/api` router ready for endpoints

## What still needs to be built

- request ingestion API endpoints for new customer requests
- background worker or mock AI service for classification and priority assignment
- live update mechanism for admin dashboard (WebSockets, SSE, or polling)
- admin dashboard UI in `frontend/`
- request event logging and internal notes endpoints
- routing logic and queue assignment

## Setup

1. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```

2. Create a `.env` file in `backend/` with at minimum:
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/cognifyr
   REDIS_URL=redis://localhost:6379
   ACCESS_TOKEN_SECRET=your_access_secret
   REFRESH_TOKEN_SECRET=your_refresh_secret
   NODE_ENV=development
   ```

3. Run the backend server:
   ```bash
   npm run dev
   ```

4. Use Prisma to manage the database schema:
   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

## Notes

- The admin dashboard is not implemented yet; `frontend/` is a placeholder.
- Current API routing and request handling are scaffolded but need endpoint logic.
- The AI workflow is intentionally designed as a replaceable module so a mock version can be used during assessment.
