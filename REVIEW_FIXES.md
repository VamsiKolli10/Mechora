# Review fixes

The fixes address the preceding review across authentication, shopping flows, account data, and development tooling. Existing user edits remain in place.

| Area | Result | Verification |
| --- | --- | --- |
| Identity and session security | Verified provider linking invalidates untrusted local credentials; app MFA remains required; password and MFA changes revoke application sessions; refresh tokens rotate uniquely with replay checks. | Security integration regressions, including original-token recovery, concurrent consumption, provider MFA and session invalidation. |
| Private data and mutation boundaries | User payloads omit authentication fields; asset updates accept only validated columns; saved profile data replaces stale JWT fields. | Profile/admin response and asset injection regressions. |
| Cart and checkout | Guest merge consolidates duplicates atomically and preserves both bags on failure; cart mutations serialize; checkout releases its connection before hydration; current prices and quantity limits agree across UI and API. | Merge/stock/price integration tests, checkout suite with a one-connection pool, Redux ordering and Checkout UI tests. |
| Account and catalog UI | Login handles MFA; bootstrap completes for guests; caches follow the session owner; address payloads contain editable fields and support clearing optional data; catalog ignores stale responses and resets detail controls; hash links scroll after lazy loading. | Auth, cart, catalog, address, navigation and page tests. |
| History and search | Recently viewed records have one owner and sort by recency; orders return unit counts; search pagination counts all matches. | Data integration regressions. |
| Database and tooling | Local and hosted databases share the current migration stream; session revocation has a forward migration; CI provisions local PostgreSQL; pools close after fixture cleanup; imports await all rows and roll back invalid CSV; SMTP dependency is declared. | Fresh schema and existing-schema migration checks, full backend suite, CSV and mocked SMTP tests. |

Apply `watchs_co_be/migrations_supabase/20261027041323-add-session-revocation.js` before starting the updated API. Local setup uses `npm run migrate`; hosted setup uses `npm run migrate:supabase` with the documented database settings. Current session and checkout migrations require corrective forward migrations instead of rollback.

Automated tests use disposable local PostgreSQL and mocked provider/email services. Live Supabase confirmation/recovery and SMTP delivery require staging verification. The integration CI job remains gated by `RUN_INTEGRATION_TESTS=true`.
