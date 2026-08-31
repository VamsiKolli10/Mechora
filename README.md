# Mechora

Mechora is a personal watch storefront MVP. Customers can browse a curated catalog, search for products, create an account, manage a guest or authenticated cart, submit an order request, and review their orders.

The project is focused on a reliable customer experience. Payment processing and an administration dashboard are planned follow-up features; the current MVP does not claim that an order request has been paid.

## Product scope

Included in the MVP:

- Responsive React storefront with home, catalog, search, product detail, cart, checkout, and account pages.
- Guest carts that can be migrated to an authenticated account after login.
- Cookie-based authentication with email verification, refresh-token rotation, logout, and password reset flows.
- Order-request creation and authenticated order history.
- Express API backed by PostgreSQL/Supabase.
- Catalog, brand, collection, asset, wishlist, and recently-viewed API capabilities.
- Request validation, security headers, rate limiting, structured logging, health checks, migrations, and seed data.

Deferred from the MVP:

- Live Stripe payment collection and payment confirmation.
- Seller accounts, fulfillment operations, refunds, and an admin catalog UI.
- Multi-instance rate-limit storage and advanced operational dashboards.

## Repository layout

| Path | Purpose |
| --- | --- |
| `watchs_co_be/` | Express API, PostgreSQL access, migrations, seeds, and tests |
| `watchs_co_fe/` | Vite + React storefront, Redux state, and frontend tests |
| `API_DOCUMENTATION.md` | API routes, authentication behavior, and request examples |
| `watchs_co_be/migrations_supabase/` | Supabase-compatible migrations |
| `watchs_co_be/seeds/catalog.sql` | Curated catalog seed data |
| `CONTRIBUTING.md` | Local development and change workflow |
| `SECURITY.md` | Secrets and production security practices |

## Prerequisites

- Node.js 20 LTS or newer
- npm 10 or newer
- PostgreSQL 15 or newer, or a Supabase project
- Git

## Local setup

### Install dependencies

```bash
git clone https://github.com/VamsiKolli10/Mechora.git
cd Mechora
cd watchs_co_be && npm install
cd ../watchs_co_fe && npm install
```

### Configure the backend

```bash
cd watchs_co_be
cp .env.example .env
```

Set the database values and replace every `change-me` secret with a long, random value. For local PostgreSQL, use the individual `DB_*` variables. For Supabase, prefer `DATABASE_URL` and set `DB_SSL=true`.

The backend requires `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GUEST_TOKEN_SECRET`, and `COOKIE_SECRET` before it will start. Development email delivery defaults to log output; configure SMTP only when real email delivery is needed.

### Create the database

For local PostgreSQL:

```bash
cd watchs_co_be
npm run migrate
npm run maintenance
```

For Supabase, follow [`watchs_co_be/SUPABASE.md`](watchs_co_be/SUPABASE.md):

```bash
npm run migrate:supabase
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seeds/catalog.sql
```

Use a separate database or Supabase project for integration tests. Never point destructive tests at production.

### Configure the frontend

```bash
cd watchs_co_fe
cp .env.example .env.local
```

At minimum, set `VITE_API_BASE_URL` to the backend URL. Supabase and Stripe frontend variables are only needed by the features that use them; Stripe is deferred for the current MVP.

### Start both services

Use two terminals:

```bash
# Terminal 1
cd watchs_co_be
npm run dev
```

```bash
# Terminal 2
cd watchs_co_fe
npm run dev
```

The API is available at `http://localhost:8000` and the storefront at `http://localhost:5173`.

```bash
curl http://localhost:8000/health
```

## Development commands

Backend commands, from `watchs_co_be/`:

```bash
npm start
npm run dev
npm test
npm run test:unit
npm run test:integration
npm run migrate:supabase:check
npm run maintenance
```

Frontend commands, from `watchs_co_fe/`:

```bash
npm run dev
npm run build
npm run preview
npm run test -- --run
```

Integration tests require a reachable test database and modify test data.

## MVP order flow

1. A visitor browses the catalog and adds products to a guest cart.
2. The visitor signs in or registers; the guest cart is merged into the account cart.
3. Checkout validates contact, shipping, and cart data.
4. The API creates an order request with a pending/manual-review status.
5. The customer sees confirmation and can view the order in their account.

The current flow does not collect payment or mark orders as paid. Do not enable live payment credentials until Stripe and webhook handling have been tested separately.

## API

The API is organized by resource under `/api`, including authentication, products, watches, search, carts, wishlists, orders, accounts, brands, collections, assets, and recently viewed items. See [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).

Authentication uses secure, HttpOnly cookies. Frontend requests must send credentials, and deployed frontend origins must be listed in the backend `CLIENT_ORIGIN` configuration.

## Deployment

The intended deployment shape is:

- Frontend: Vercel-style static hosting for the Vite build.
- Backend: Render-style long-running Node service running `npm start` from `watchs_co_be/`.
- Database: Supabase PostgreSQL.

Release checklist:

1. Configure production secrets in the host secret manager; never commit `.env` files.
2. Set `NODE_ENV=production`, `DATABASE_URL`, `DB_SSL=true`, `CLIENT_ORIGIN`, `COOKIE_SECURE=true`, and `TRUST_PROXY=1`.
3. Run the Supabase migration stream and seed the catalog.
4. Build the frontend with `npm run build` and deploy `dist/`.
5. Start the API with `npm start` and verify `/health`.
6. Test registration, login, cart migration, order request creation, and order history in staging.
7. Confirm logs, backups, CORS, HTTPS, cookies, and rollback instructions.

See [`watchs_co_be/PRODUCTION.md`](watchs_co_be/PRODUCTION.md) and [`watchs_co_be/SUPABASE.md`](watchs_co_be/SUPABASE.md) for service-specific runbooks.

## Project status

This is a personal MVP, not a production marketplace platform. The next priorities are staging validation against a disposable database, reliable email delivery, browser smoke tests, and a deliberate decision about payment integration.

## License

See [`LICENSE`](LICENSE).
