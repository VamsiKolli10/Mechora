# Mechora Frontend (Vite + React)

## Quick Start

```bash
npm install
npm run dev        # http://localhost:5173
```

The app expects the API (`watchs_co_be`) to run on `http://localhost:8000`. Adjust `VITE_API_BASE_URL` in `.env` if the backend lives elsewhere.

## Scripts

| Command | Description |
| --- | --- |
| `npm run dev` | Start Vite dev server. |
| `npm run build` | Build production bundle into `dist/`. |
| `npm run preview` | Serve the production bundle locally. |
| `npm run test` | Run Vitest unit tests (Redux slices, etc.). |

## Environment Variables

Create `watchs_co_fe/.env`:

```
VITE_API_BASE_URL=http://localhost:8000
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

## Auth, Cookies & Guest Tokens

- The browser now stores authentication in HttpOnly cookies. We *never* touch `localStorage` for tokens.
- Guest carts use signed cookies. The axios client (`src/utils/api.js`) automatically includes cookies for every request.

## Testing

```
npm run test -- --run
```

Vitest is configured with jsdom + Testing Library matchers via `src/setupTests.js`. New reducers/components should ship with matching specs under `src/**/__tests__`.
