# isp.billing.be

NestJS backend service for ISP billing.

## Requirements

- Node.js 20+
- PostgreSQL

## Setup

1. Install dependencies:
   `npm install`
2. Configure environment:
   create `.env` with at least `DATABASE_URL` and optional `PORT`.
3. Generate Prisma client:
   `npm run prisma:generate`
4. Apply migrations (when available):
   `npm run prisma:migrate:dev`

## Run

- Development: `npm run start:dev`
- Production build: `npm run build`
- Production start: `npm run start:prod`

## Quality Checks

- Lint: `npm run lint`
- Format: `npm run format`
- Unit tests: `npm run test`
- E2E tests: `npm run test:e2e`

## Health Endpoint

- `GET /api/health`

## Auth Endpoint

- `POST /api/auth/login`
  - Request body:
    - `email` (string, valid email)
    - `password` (string, min 8 chars)
  - Response includes `accessToken`, `tokenType`, `expiresIn`, and authenticated `user`.
- `POST /api/auth/register`
  - Request body:
    - `name` (string, min 2 chars)
    - `email` (string, valid email, unique)
    - `password` (string, min 8 chars)
  - Creates user account if the email does not already exist, then returns auth session payload.

### Optional Auth Environment Variables

- `JWT_SECRET` (default: `dev-only-jwt-secret`)
- `JWT_EXPIRES_IN_SECONDS` (default: `3600`)
- `AUTH_DEMO_EMAIL` (default: `admin@ispbilling.com`)
- `AUTH_DEMO_PASSWORD` (default: `admin12345`)
- `AUTH_DEMO_NAME` (default: `Billing Admin`)
- `AUTH_DEMO_USER_ID` (default: `demo-user-id`)
