# Mechora E‑Commerce Build Plan

This document maps out the major tasks required to transform the current prototype into a production-ready watch marketplace. Each section enumerates deliverables you can assign to engineering, product, design, or ops agents.

## 1. Baseline Audit
- Inventory current backend (`watchs_co_be`) and frontend (`watchs_co_fe`) features, catalog existing endpoints, and document technical debt.
- Capture environment parity gaps (env vars, secrets management, deployment story) and outline missing observability/testing coverage.

## 2. Catalog & Merchandising
1. **Data Model & Migrations**
   - Expand schema to include SKUs, slugs, MSRP/sale pricing, stock status, movement, condition, media refs, categories, collections, and audit columns.
   - Create supporting tables (`brands`, `collections`, `assets`, `inventory_adjustments`) plus db-migrate scripts and reproducible seeders/importers.
2. **Catalog APIs & Services**
   - Replace `/api/watches` with paginated, filterable endpoints (brand, price range, complication, size, materials, sort keys) and consistent DTO validation.
   - Add caching, error normalization, and serialization for frontend consumption.
3. **Search & Discovery**
   - Implement search service (Postgres FTS or Algolia) with autocomplete, trending queries, saved searches, and `/api/search/suggestions`.
   - Build frontend search components with debounce, keyboard navigation, and empty-state UX.
4. **Product Detail Experience**
   - Create `/watch/:slug` routes pulling specs, media galleries (360°, video), provenance, financing options, upsells, and recommended watches.
   - Surface trust badges, concierge CTA, and availability messaging.
5. **Collections & Editorial**
   - Support CMS-driven hero/section configs per collection/category page, including SEO meta tags and share-friendly URLs.
   - Add router data loaders or SSR/pre-render so content is crawlable.
6. **Media Pipeline**
   - Integrate an asset store (Cloudinary/S3) with responsive variants, signed URLs, transformations, and admin upload tooling.
   - Update frontend components to lazy-load and handle fallbacks.

## 3. Shopping & Checkout
1. **Cart, Wishlist, Recently Viewed**
   - Add Redux slices + backend endpoints; persist carts server-side with guest token fallback and hydrate on login.
   - Surface mini-cart UI, wishlists (auth-only), and recently viewed chips on PDP/listings.
2. **Checkout Flow**
   - Implement guarded multi-step wizard (cart review → address → delivery → payment → confirmation) with inline validation and optimistic updates.
   - Support guest checkout and address book integration for authenticated users.
3. **Payments & Escrow**
   - Integrate Stripe/Adyen for cards, wallets, ACH, and split payments (deposit vs. escrow release); handle 3DS, SCA, and refunds.
   - Build webhook consumers, payment intents storage, and reconciliation dashboards.
4. **Shipping, Tax, Compliance**
   - Connect to Shippo/EasyPost for rates + labels, capture HS codes and insurance declarations, and integrate TaxJar/Avalara for tax calculations.
   - Display delivery SLAs and customs paperwork checklist in checkout + PDP.
5. **Order Domain**
   - Model `orders`, `order_items`, `payments`, `shipments`, `order_status_events`; enforce transactional creation and idempotent retries.
   - Create order confirmation emails, PDF invoices, and event-driven notifications.

## 4. Customer Experience
1. **Authentication & Security**
   - Add password policies, rate limiting, refresh tokens, remember-me, password reset emails, MFA option, and social sign-in; secure APIs via RBAC middleware.
2. **Account Dashboard**
   - Build `/account` routes for profile, addresses, payment methods, verified identity docs, concierge requests, downloadable certificates, and order history pagination.
3. **Reviews & Social Proof**
   - Implement verified purchase reviews, star ratings, photo uploads, moderation workflow, and aggregate stats displayed on cards/PDPs.
4. **Concierge & Messaging**
   - Integrate chat/messaging (Twilio/Zendesk/etc.) for live concierge, appointment scheduling, and push/email notifications.
5. **Marketing & Notifications**
   - Configure transactional + lifecycle emails/SMS (onboarding, cart abandonment, drops, servicing reminders) and embed newsletter/referral tracking components.

## 5. Admin, Ops, and Quality
1. **Admin Portal**
   - Create role-gated dashboard to manage inventory, content blocks, pricing overrides, feature flags, and order operations (fraud checks, shipment status, refunds).
2. **Data Import & Sync**
   - Replace ad-hoc CSV loader with resumable ETL jobs, deduplication, scheduled supplier feed syncs, and monitoring/alerting for failures.
3. **Testing Strategy**
   - Add Vitest unit coverage, Jest/Supertest API tests, Cypress/Playwright end-to-end checkout/spec flows, and contract tests for external integrations.
4. **Observability & Security**
   - Implement structured logging, metrics, tracing, uptime alerts, vulnerability scanning, dependency auditing, OWASP hardening, and secrets rotation.
5. **Deployment & Performance**
   - Set up CI/CD (lint/test/build/deploy), containerize services, provision staging/prod infra, enable SSR or pre-rendering for SEO, add CDN/caching, split bundles, and run accessibility & performance audits (Lighthouse/axe).

## 6. Program Management
- Translate each subsection into Jira/Linear epics with dependencies, estimates, and acceptance criteria.
- Assign owners (backend, frontend, design, ops) and define weekly milestones plus demo checkpoints.
- Establish QA gates, release checklist, and rollback plan ahead of first production launch.
