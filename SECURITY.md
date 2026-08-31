# Security Policy

## Supported deployment

The supported deployment model is an HTTPS frontend, an HTTPS Express API, and PostgreSQL/Supabase accessed only by the backend. The browser should not connect directly to application tables.

## Secret handling

- Never commit `.env`, `.env.local`, database URLs, JWT secrets, SMTP passwords, Stripe secret keys, webhook secrets, private keys, or production data.
- Use separate secrets for local, staging, and production.
- Use randomly generated values of at least 32 characters for `JWT_SECRET`, `JWT_REFRESH_SECRET`, `GUEST_TOKEN_SECRET`, and `COOKIE_SECRET`.
- Store deployment values in the hosting provider's secret manager.
- Rotate secrets after suspected exposure and restart the API.

## Application requirements

- Keep authentication cookies Secure, HttpOnly, and appropriately SameSite-configured in production.
- Restrict `CLIENT_ORIGIN` to deployed frontend origins.
- Keep Supabase row-level security enabled and expose data through API authorization rules.
- Use a separate database for destructive integration tests.
- Keep Stripe variables unset until payment handling is intentionally enabled and verified.
- Review rate-limit storage before running multiple API instances; the current default is suitable for a single instance only.

## Reporting a vulnerability

Do not open a public issue containing credentials, personal data, exploitable details, or a working attack. Contact the repository owner privately with:

- A concise description and affected route/file.
- Reproduction steps or a minimal proof of concept.
- Potential impact.
- Any suggested mitigation.

Rotate any exposed credential immediately, even while the report is being investigated.
