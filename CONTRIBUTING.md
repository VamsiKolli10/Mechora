# Contributing to Mechora

Mechora is maintained as a personal project, but the repository follows a small, repeatable contribution workflow.

## Before changing code

1. Read the relevant service documentation and [`API_DOCUMENTATION.md`](API_DOCUMENTATION.md).
2. Create a focused branch from `main`.
3. Copy the appropriate `.env.example` file locally. Never commit `.env`, credentials, database dumps, or generated output.
4. Check whether the change affects migrations, cookies/authentication, API contracts, or order status.

## Local verification

From `watchs_co_be/`:

```bash
npm run test:unit
npm run test:integration
```

Integration tests require a disposable local PostgreSQL database with migrations applied. The test guard rejects remote hosts; see [the setup guide](watchs_co_be/README_TESTING.md).

From `watchs_co_fe/`:

```bash
npm run test -- --run
npm run build
```

If an environment prevents integration tests from running, report the exact limitation instead of treating the suite as passed.

## Code and API conventions

- Keep controllers thin; put business rules in services and persistence in models/repositories.
- Validate request bodies, params, and query values at route boundaries.
- Preserve cookie-based auth; do not add tokens to `localStorage`.
- Never return secrets, password hashes, raw refresh tokens, or payment credentials.
- Add a migration under `watchs_co_be/migrations_supabase/` for every schema change. Do not edit an applied migration.
- Keep order status transitions explicit and distinguish an order request from a paid order.
- Add or update tests for changed behavior and update `API_DOCUMENTATION.md` for public route changes.

## Pull requests

Include:

- A short description of the user-visible or operational change.
- Affected services and migration/environment-variable changes.
- Tests/build commands run and their results.
- Screenshots or a recording for meaningful frontend changes.
- Rollback or compatibility notes for schema/API changes.

Keep commits focused and avoid mixing unrelated dependency upgrades or formatting changes with feature work.
