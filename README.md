# CONTRASTE ATELIER — Platform V1

Custom Next.js website for Contraste Atelier (La Veleta, Tulum): editorial
brand site, native **workshop booking** (Supabase) and **headless commerce**
(dedicated Shopify store), preserving the original visual identity.

## Stack

- Next.js (App Router) + TypeScript, deployed on Vercel
- Supabase — source of truth for workshop sessions, capacity, reservations,
  realtime availability, presence and admin auth
- Shopify Storefront + Cart API — source of truth for products, variants,
  inventory, cart and **Shopify-hosted checkout**
- No customer accounts in V1. No card data ever touches this codebase.

## Routes

| Route | Purpose |
|---|---|
| `/` · `/es` | Editorial landing |
| `/workshops/wax-ring` | Wax Ring Workshop — details, live calendar, booking |
| `/shop`, `/shop/[handle]` | Catalog + product pages (feature-flagged) |
| `/gallery`, `/visit` | Material footage · address / Maps / WhatsApp |
| `/admin/workshops` | Private scheduling console (magic-link auth, noindex) |

## Local development

```bash
npm install
cp .env.example .env.local   # fill what you have; everything degrades safely
npm run dev
```

Quality gates: `npm run lint` · `npm run typecheck` · `npm test` · `npm run build`.

## Activating the booking system (Supabase)

1. Create a Supabase project.
2. Run migrations in order (SQL editor or `supabase db push`):
   - `supabase/migrations/0001_workshops.sql`
   - `supabase/migrations/0002_seed_september_2026.sql` (idempotent seed)
3. Enable **Email (magic link)** auth. Add admin emails to
   `ADMIN_EMAIL_ALLOWLIST` and set the site URL in Supabase Auth settings.
4. Set env vars (`.env.example`): `NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`, `SUPABASE_SERVICE_ROLE_KEY`.
5. Optional: `NEXT_PUBLIC_WORKSHOP_PRICE_MXN` (price is never guessed),
   transactional email + webhook vars.

Until configured, the workshop page shows a truthful WhatsApp fallback —
no fake availability, ever. Overbooking protection, idempotency and seat
math live in `create_booking()` (row-locked, custom SQLSTATEs) — the app
never computes seats client-side for authorization.

## Activating the shop (dedicated CONTRASTE Shopify store)

1. Create the **dedicated** CONTRASTE store (own catalog/inventory/checkout
   identity — never another brand's store) and configure payments, shipping,
   pickup, taxes, policies and checkout branding in Shopify Admin.
2. Enable Headless/Storefront API access; create tokens.
3. Set `SHOPIFY_STORE_DOMAIN`, `SHOPIFY_STOREFRONT_PRIVATE_TOKEN` (server
   only) and/or `SHOPIFY_STOREFRONT_PUBLIC_TOKEN`, keep
   `SHOPIFY_STOREFRONT_API_VERSION` pinned, then flip `SHOPIFY_ENABLED=true`.

With the flag off the site builds and runs with an approved “First
Collection — Soon” module; no fake products, no broken cart. Optional product
metafields (namespace `contraste`): `piece_type`, `material`, `finish`,
`dimensions`, `edition`, `production_mode` (`one_of_one|limited|in_stock|
made_to_order`), `care`, `story`.

## Analytics

`NEXT_PUBLIC_GTM_ID` / `NEXT_PUBLIC_GA4_ID` activate the loaders; the typed
event layer (`lib/analytics`) is a no-op without them and **never sends PII**.

## Architecture

```
app/[lang]/…        localized pages (EN at /, ES at /es — middleware rewrite)
app/api/…           bookings, sessions, admin, webhook endpoints
app/actions/cart.ts Shopify Cart API server actions (tokens stay server-side)
components/…        site / workshop / commerce / admin
lib/…               config+flags, i18n, workshops domain, supabase, commerce,
                    seo (meta + JSON-LD), analytics, notifications
supabase/migrations SQL schema, RLS (deny-all public), RPCs, seed
```
