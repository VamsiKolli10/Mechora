# Production backend checklist

The API can run on any Node.js 22+ host that supports a long-lived Express process. Keep the API and Vite frontend as separate deployables.

The current MVP creates pending order requests for manual follow-up. Stripe payment collection is intentionally deferred; leave Stripe secrets unset until that feature is enabled and validated.

## Required runtime configuration

Set these values in the host's secret manager (never commit them):

```dotenv
NODE_ENV=production
DATABASE_URL=postgresql://...
DB_SSL=true
CLIENT_ORIGIN=https://shop.example.com
COOKIE_SECURE=true
TRUST_PROXY=1
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-publishable-key
```

Use random values of at least 32 characters for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GUEST_TOKEN_SECRET`, and `COOKIE_SECRET`. Use separate values for staging and production.

## Migration workflow

Both local PostgreSQL and Supabase use `migrations_supabase/`. For Supabase:

```bash
npm run migrate:supabase
```

The bootstrap detects an already initialized database and records itself without recreating tables. Future schema changes should be new migrations under `migrations_supabase/`. The legacy `migrations/` directory is historical.

Apply the session-version migration before starting the updated API. Password changes, password resets, MFA changes, and logout revoke existing application sessions. The migration defaults existing sessions to version zero, so deploying the column alone does not log everyone out. Rollback of the session-version and checkout retry migrations is intentionally disabled; use a corrective forward migration.

## Operational requirements

- Keep Stripe variables unset while Stripe is deferred.
- Keep RLS enabled on every public table. Application data remains API-only;
  do not add browser-role policies without reviewing ownership boundaries.
- Configure TLS at the host or reverse proxy and forward the original protocol so secure cookies work.
- Use a shared rate-limit store before running more than one API instance.
- Send Winston JSON logs to the host's log collector and alert on 5xx rates.
- Keep Supabase backups enabled and use a separate test project for destructive integration tests.
