# Mechora Engineering Notes

Productionizing the watch marketplace requires a coordinated backend + frontend workflow. This document replaces the CRA boilerplate and captures how to operate the two services inside this repo.

## Repository Structure

| Path | Description |
| --- | --- |
| `watchs_co_be/` | Express + Postgres API, db-migrate migrations, Jest integration/unit tests. |
| `watchs_co_fe/` | Vite + React frontend with Redux Toolkit, Vitest unit tests. |

## Environment

Create a `.env` (or `.env.local`) per service with the following keys:

| Variable | Description |
| --- | --- |
| `PORT` | API HTTP port (default `8000`). |
| `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, `DB_PASSWORD` | Postgres connection settings used by the API and migrations. |
| `JWT_SECRET` | Symmetric signing key for access tokens (HttpOnly cookie payload). |
| `JWT_REFRESH_SECRET` | Symmetric signing key for refresh tokens. |
| `JWT_EXPIRES_IN` | Access token lifetime (e.g. `15m`). |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime (e.g. `7d`). |
| `GUEST_TOKEN_SECRET` | Signing secret for guest cart cookies. |
| `COOKIE_SECRET` | Secret used by `cookie-parser` to sign cookies. |
| `COOKIE_DOMAIN` | Optional cookie domain override (leave unset for localhost). |
| `COOKIE_SECURE` | Force secure cookies (`true` in production). |
| `COOKIE_SAMESITE` | `lax` (default), `strict`, or `none`. |
| `CLIENT_ORIGIN` | Comma separated list of allowed front-end origins (defaults to `http://localhost:5173,http://localhost:3000`). |
| `EMAIL_DELIVERY` | Email delivery mode: `log` (default), `file`, or `smtp`. |
| `EMAIL_OUTBOX_PATH` | Output folder for `file` delivery (defaults to `watchs_co_be/outbox`). |
| `EMAIL_FROM` | Friendly from address for outbound mail. |
| `APP_BASE_URL` | Base URL used to build verification/reset links. |
| `EMAIL_VERIFY_PATH` | Path appended to `APP_BASE_URL` for email verification links. |
| `PASSWORD_RESET_PATH` | Path appended to `APP_BASE_URL` for password reset links. |
| `SMTP_HOST`, `SMTP_PORT`, `SMTP_SECURE`, `SMTP_USER`, `SMTP_PASS` | SMTP settings when `EMAIL_DELIVERY=smtp`. |
| `STRIPE_SECRET_KEY` | Stripe API secret key for payment intents. |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret. |
| `STRIPE_CURRENCY` | Currency for Stripe payment intents (default `usd`). |
| `STRIPE_API_VERSION` | Stripe API version override (default `2023-10-16`). |

> **Tip:** The Jest setup file seeds all required secrets for the test environment, but local development still needs real values.

## Backend (watchs_co_be)

```bash
cd watchs_co_be
npm install
npm run migrate   # Runs db-migrate up
npm run maintenance  # backfills watch slugs & other background jobs
npm run dev         # Starts the API via nodemon with live reload
```

Useful scripts:

- `npm run migrate` / `npm run rollback` – apply or revert db-migrate migrations.
- `npm run maintenance` – runs background tasks (slug backfills, future import jobs) without blocking API boot.
- `npm test` – executes Jest suites (unit + integration, including new auth + cart contracts).

Security hardening shipped in this iteration:

- Enforced secrets via `config/secrets.js` (process aborts if required env vars are missing).
- Auth now issues HttpOnly cookies, rotates refresh tokens per request, hashes long-lived tokens, and exposes MFA lifecycle endpoints.
- Every write route now passes Zod request validation and, where applicable, RBAC (`requireAdmin`).
- Helmet, rate limiting, structured logging (morgan + custom logger), and signed guest tokens protect API edges.

## Frontend (watchs_co_fe)

```bash
cd watchs_co_fe
npm install
npm run dev      # Vite dev server on :5173
npm run build    # Production bundle in dist/
npm run preview  # Serve production build locally
npm run test     # Vitest unit tests for slices/components
```

Changes of note:

- Axios client (`src/utils/api.js`) now sends HttpOnly cookies by default—no tokens live in `localStorage`.
- Redux auth/cart/wishlist slices were updated to rely on server-issued cookies and include unit coverage.
- Cart bootstrapper refreshes whenever the authenticated user changes so carts migrate correctly after login.

## Full-stack Dev Runner

The repo root now ships a tiny orchestration `package.json` so you can boot both services with one command:

```bash
npm install           # from repo root to install concurrently
npm run dev           # starts backend (:8000) and Vite (:5173) together
# or npm run start    # alias for the same concurrent runner
```

Under the hood these scripts call `npm run dev --prefix watchs_co_be` and `npm run dev --prefix watchs_co_fe`, so you can continue to use the individual service commands if you prefer.

## Runbooks

| Task | Steps |
| --- | --- |
| **Provision database** | Create Postgres database, set env vars, run `npm run migrate`. |
| **Backfill / maintenance** | `npm run maintenance` (can be placed on a cron/Job runner). |
| **Rotate secrets** | Update secrets in deployment environment, restart API (missing secrets prevent boot). |
| **Guest cart reset** | Clear `mechora_guest_token` cookie client-side or call `/api/cart/merge` after login (API now clears cookies automatically). |
| **CI test suite** | Backend: `cd watchs_co_be && npm test`. Frontend: `cd watchs_co_fe && npm run test -- --run` (or integrate into your CI workflow). |

## Testing Overview

- **Backend**: Jest integration tests cover authentication (cookies, refresh rotation, MFA gating) and cart guest-token contracts. Run `npm test` inside `watchs_co_be`.
- **Frontend**: Vitest exercises slice reducers; extend with component tests as UI stabilises. Run `npm run test` inside `watchs_co_fe`.

## Deployment Checklist

1. Populate env vars listed above in your secrets manager.
2. Run migrations (`npm run migrate`).
3. Run `npm run maintenance` if importing watches or backfilling slugs.
4. Deploy backend + frontend; ensure `CLIENT_ORIGIN` matches deployed hosts so cookies flow correctly.
5. Wire your CI/CD pipeline to execute backend Jest + frontend Vitest suites before deployments.
