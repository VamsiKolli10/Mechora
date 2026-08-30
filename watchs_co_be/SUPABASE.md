# Supabase PostgreSQL setup

The application continues to use Express for authentication and business logic. Supabase is used as managed PostgreSQL only.

## Connection settings

In Supabase, open **Project Settings → Database → Connect** and select a pooler connection. Use the session pooler for a long-running backend or the transaction pooler for serverless deployments.

Set these backend environment variables without committing their values:

```dotenv
DATABASE_URL=postgresql://...
DB_SSL=true
DB_POOL_MAX=10
DB_IDLE_TIMEOUT_MS=30000
DB_CONNECTION_TIMEOUT_MS=10000
```

`DATABASE_URL` takes precedence over `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USER`, and `DB_PASSWORD`. The individual variables remain supported for local development and for migration commands.

## Run migrations

The Supabase bootstrap migration is tracked separately from the legacy local migration chain. Set the individual `DB_*` values shown by Supabase, then run:

```bash
npm run migrate:supabase
```

Preview pending migrations with:

```bash
npm run migrate:supabase:check
```

Seed the curated catalog after the bootstrap migration:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f seeds/catalog.sql
```

## Verify

Start the API and request its health endpoint:

```bash
npm run dev
curl http://localhost:8000/health
```

Then run the integration suite against a separate Supabase test project or branch. Do not point destructive tests at the production database.
