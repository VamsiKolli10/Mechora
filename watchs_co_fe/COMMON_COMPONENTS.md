# Common Frontend Components

This document lists the shared UI/UX building blocks that appear across the Mechora frontend. Each entry includes its source path, responsibilities, and integration notes so new features can reuse existing patterns instead of re‑inventing them.

## Layout & Navigation

| Component | Path | Purpose | Key Props / Notes |
| --- | --- | --- | --- |
| `ThemeToggle` | `src/components/ThemeToggle.jsx` | Switches between light/dark palettes using `ColorModeContext`. | Accepts optional `size` prop for icon button sizing. Should be wrapped in `CustomThemeProvider`. |
| `FloatingThemeToggle` | `src/components/FloatingThemeToggle.jsx` | Mobile-friendly FAB that exposes the same theme toggle action and appears on scroll. | Automatically hides on desktop (`display: none` ≥ `md`). Inject into pages that benefit from persistent FAB controls. |
| `PrivateRoute` | `src/components/PrivateRoute.jsx` | Guards nested routes and redirects unauthenticated users to `/login`. | Wrap route elements in `createRoutesFromElements` (as done in `routes.jsx`). |
| `CartInitializer` | `src/components/CartInitializer.jsx` | Bootstraps guest cart tokens + loads cart state on app mount. | Place once near the root (e.g., in `App.jsx`) so cart state stays hydrated globally. |
| `AnimatedBackground` | `src/components/AnimatedBackground.jsx` (+ `.css`) | Optional decorative background canvas for hero sections. | Accepts `className` for placement; can be toggled per page for performance. |

## Commerce & Account Surface

| Component | Path | Purpose | Key Props / Notes |
| --- | --- | --- | --- |
| `MiniCart` | `src/components/MiniCart.jsx` | Header icon + drawer preview for cart contents, integrates with `cartSlice`. | Dispatches `fetchCart`, `removeFromCart`. Provide navigation via `useNavigate`. Emits `guest_token` in response payload automatically. |
| `CartInitializer` | `src/components/CartInitializer.jsx` | Ensures guest cart token persistence and loads cart from server on app load. | Include once near root to avoid duplicate fetches. |
| `ThemeToggle` | (see above) | Frequently placed inside headers, drawers. | Works with `CustomThemeProvider`. |

## Content + Marketing Blocks (`src/components/common`)

| Component | Purpose | Key Props |
| --- | --- | --- |
| `SectionHeading` | Standardized heading stack with eyebrow, title, subtitle, and optional CTA slot. | `eyebrow`, `title`, `subtitle`, `action` (ReactNode). Handles responsive spacing. |
| `FeatureCard` | Highlight card used for featured watches/collections: image, stats, CTA button. | `image`, `tag`, `title`, `subtitle`, `price`, `specs[]`, `actionLabel`, `onAction`. Automatically applies hover elevations. |
| `StatTile` | KPI tile with metric, delta, helper copy (see file for props). | `label`, `value`, `trend`, `helper`, `icon`. Works in responsive grid. |

## Utility Helpers

| Module | Path | Purpose | Usage |
| --- | --- | --- | --- |
| `watchRoutes` | `src/utils/watchRoutes.js` | Centralizes watch detail routing (`buildWatchDetailPath`, `parseWatchSlugParam`) so links gracefully fallback to `/shop/id-:id`. | Import in any place generating detail links or parsing URL params. |
| `api` | `src/utils/api.js` | Axios instance preconfigured with base URL, token injection, guest token header. | Use instead of raw Axios for consistent auth handling. |
| `useAuth` | `src/hooks/useAuth.js` | Provides auth state, `logout`, and loading flags across layouts. | Consumed by `MainLayout`, account pages, and guard components. |
| `useDebounce` | `src/hooks/useDebounce.js` | Debounces rapidly changing values (search boxes, filter inputs). | `const debounced = useDebounce(value, delay)` |

## How to Reuse

1. **Prefer composition over duplication** – e.g., assemble new landing rows using `SectionHeading + FeatureCard` combos instead of bespoke markup.
2. **Keep variant-specific styling via props** – extend components via props (e.g., pass different `action` node to `SectionHeading`).
3. **Document new shared widgets here** – whenever you add a component used on multiple pages, update this file with its purpose and API.
4. **Respect existing state slices** – `MiniCart`, `CartInitializer`, and `watchRoutes` expect the current Redux structure; reuse them instead of reimplementing fetching logic.

This list will grow as we extract more shared UI. Ping the frontend guild before introducing a new “global” component so we can standardize patterns early.
