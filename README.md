# CARBIGNITE

Next.js 16 / React 19 storefront with a separate Fastify 5 API and Prisma 6 / PostgreSQL database. Use Node 22 and pnpm 12.6.0.

## Local development

```sh
pnpm install --frozen-lockfile
pnpm --filter @carbignite/web dev
```

Open http://localhost:3000. The homepage and catalog load product records from PostgreSQL through the Fastify API. Twelve clearly marked demo records reproduce the approved sample catalog; the bag stores database IDs locally. Account, checkout and admin remain deferred; no payment or order submission is connected.

For the database-backed carbon catalog at `/products`, configure `apps/web/.env.local` with `API_URL=http://localhost:4000`. Configure the API's `apps/api/.env` with your existing `DATABASE_URL`, then run `pnpm --filter @carbignite/api dev`. The owner approved discarding the old lighting catalog. After setting the intended DATABASE_URL, run `pnpm --filter @carbignite/api exec prisma migrate deploy` and `pnpm --filter @carbignite/api exec prisma generate`. The carbon migration deletes existing Product rows, replaces lighting categories with PADDLES/CONSOLE/TRIM and drops color/side. It was applied to the project-local database during this API branch session; other environments still need to apply it. The non-destructive seed:demo command populates the 12 approved demo records. Their illustrative prices/fitment remain labeled as demo data; unknown model years are left unset. Keep the existing database/user name if desired; its name does not determine the product schema. If the API is unavailable, the catalog shows a retry screen.

## Permanent structure

- `apps/web/app/layout.tsx`: shared fonts, styles and storefront shell.
- `apps/web/app/page.tsx`: approved homepage.
- `apps/web/app/products/`: existing API catalog and its error boundary.
- `apps/web/features/storefront/`: shared shell, theme/bag state, homepage sections, concepts and approved styles.
- `apps/web/features/products/`: existing API adapters, filters, pagination and catalog components.
- `apps/api/src/modules/products/`: controller, validation, service and Prisma repository.
- `docs/STRUCTURE_REVIEW.md`: detailed folder explanations, request flow and cleanup recommendations.

The temporary `(legacy)` route group and duplicate layout components were removed. The brand remains CARBIGNITE; `storefront` names the feature's responsibility. Header, footer, theme and concept bag are shared across routes. The bag validates database product IDs and their available pattern/finish options against the current API catalog.

Tailwind handles suitable layout and interaction states. Approved reference styles use `@layer components`, below utilities; CSS retains keyframes, reveal rules, exact hover exceptions and glass fallbacks.

## Checks

```sh
pnpm test
pnpm --filter @carbignite/web lint
pnpm --filter @carbignite/web build
pnpm --filter @carbignite/api exec prisma generate
pnpm --filter @carbignite/api build
```

The backend has no checked-in authentication/authorization implementation. Product writes must be protected before an admin or commerce release. This is a reviewable storefront foundation, not a production commerce launch.

The downloaded patch and reference handoff directory are ignored transfer artifacts. Do not add them to commits. See `docs/CARBIGNITE_VALIDATION.md` for verification limits and `docs/CARBIGNITE_MIGRATION.md` for migration history.
## Local API setup verified

The project PostgreSQL container runs on localhost:5433 (configurable with POSTGRES_PORT); another container already uses 5432 and was left untouched. Both migrations are applied, and the catalog contains 12 demo records after test cleanup. Ignored local environment files configure the API and web app. Start the database with docker compose up -d db, then run pnpm dev. See docs/API_MIGRATION.md for the current verification record.

## Database-backed demo catalog

Run pnpm --filter @carbignite/api exec prisma migrate deploy, pnpm --filter @carbignite/api exec prisma generate, and pnpm --filter @carbignite/api seed:demo when setting up another local database. The seed reads apps/api/prisma/demo-products.json, inserts missing SKUs and preserves existing records and IDs. Product sample data exists only in this backend setup fixture, not in frontend page code. The frontend has no hardcoded product fallback; API failures show an unavailable state. Product image URLs and crop indexes are database fields; the approved image files remain in public/carbignite. Homepage requests are dynamic so database changes appear after refresh.
