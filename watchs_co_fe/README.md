# Mechora Frontend

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

The app expects the API (`watchs_co_be`) to run on `http://localhost:8000`. Copy `.env.example` to `.env.local` and adjust `VITE_API_BASE_URL` if the backend lives elsewhere.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server. |
| `npm run build` | Build production bundle into `dist/`. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run test -- --run` | Run Vitest tests once in CI-style mode. |

## Environment Variables

Create `watchs_co_fe/.env.local`:

```
VITE_API_BASE_URL=http://localhost:8000
# Stripe is deferred for the current MVP and can remain empty.
VITE_STRIPE_PUBLISHABLE_KEY=
```

## Auth, Cookies & Guest Tokens

- The browser stores authentication in HttpOnly cookies. We never store tokens in `localStorage`.
- Guest carts use signed cookies. The axios client (`src/utils/api.js`) automatically includes cookies for every request.
- The deployed API must allow the frontend origin through `CLIENT_ORIGIN`.
- Checkout currently submits an order request; it does not collect payment.

## Testing

```
npm run test -- --run
```

Vitest is configured with jsdom + Testing Library matchers via `src/setupTests.js`. New reducers/components should ship with matching specs under `src/**/__tests__`.
