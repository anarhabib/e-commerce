# Carbon API and structure follow-up

Branch: feat/carbignite-api-structure. Based on merged design PR #17 (main 84e4d23). Both recovery stashes were retained after restoring the follow-up; no stash was popped or dropped.

## Database

The owner selected this project's Docker Compose PostgreSQL and approved discarding lighting data. Port 5432 was occupied by flame-lenses-db-1. The project container e-commerce-db-1 now uses configurable localhost port 5433; the other container and its data were not changed. This project's volume was newly created and its public schema was empty before migration.

Both 20260928205126_init_product and 20261103120000_carbon_catalog were applied successfully. Prisma reports the schema is up to date. The transition replaces lighting categories with PADDLES/CONSOLE/TRIM, drops color/side and deletes old Product rows if present. No old product rows existed in this new database. Original migration history is retained.

Local apps/api/.env and apps/web/.env.local were created from the project's Compose connection settings and are ignored by Git. Configuration examples are safe placeholders. The database/user spelling is retained for compatibility; product structure is now carbon-oriented.

## API changes

- Removed the obsolete lighting seed and unsupported postinstall script.
- Carbon category contract is reflected in Prisma, Zod and frontend API types.
- Nullable image/vehicle fields can be cleared explicitly using null.
- Starting year cannot exceed ending year. PATCH checks the merged stored/request record, so changing only one endpoint cannot silently invert an existing range.
- Query years are limited to 1900–2100, matching product fields.
- Repository reuses one vehicle/search predicate instead of repeating filters.
- Explicit TypeScript rootDir retains the dist/src/server.js entry-point path.

## Structure

Restored the separate, previously approved follow-up: features/storefront holds the shared layout and homepage; both routes use the root StorefrontShell; duplicate old layout components are removed. The approved design assets and interaction exceptions remain. Vehicle selection is above the API product grid, initialized from the URL and preserving other filters. No account, checkout or admin implementation was added.

## Verified locally

- Prisma generation, migrate deploy and migrate status: passed.
- API build: passed.
- Web build and TypeScript: passed.
- Web lint: passed.
- pnpm test: 13 regression tests passed.
- pnpm --filter @carbignite/api test:integration: passed against real PostgreSQL. It creates uniquely identified temporary products, verifies creates, duplicates, vehicle/category filters, facets, PATCH range errors, null clearing, missing products and invalid inputs, then deletes its records.
- Product count after tests: zero.
- HTTP GET localhost:4000/products and /products/filters: 200 with empty results.
- HTTP GET localhost:3000 and /products: 200.

The API development server was started locally. Browser visual interactions remain unverified by the agent; HTTP/build checks do not establish visual parity. No fabricated production carbon fitment, stock or images were inserted. Product writes still lack authentication/roles; account/checkout/admin remain deferred. No commit, push, PR, merge or deployment was performed for this follow-up.
## Follow-up structure verification

Storefront chrome selectors now target the shell's direct header/footer and header navigation. Reference dialog rules target the storefront-dialog class, so the catalog filter sheet keeps its own sizing and layout. The approved glass values and hover exceptions were retained.

Both the shared Dialog and MobileFilters use lib/scroll-lock.ts. Each open dialog owns an idempotent release handle; nested dialogs keep scrolling locked until all owners close. MobileFilters releases on native close and unmount, preserving the previous body overflow. Its sticky toolbar now follows the shared header's 72px/87px heights.

After these fixes: 16 regression tests, web lint, production web build and TypeScript passed. The previously passing PostgreSQL integration test remains separate and opt-in. No API source changed during this UI lifecycle follow-up. Browser interaction remains unverified; no PR, commit or deployment was performed.
## Database-backed homepage catalog

The owner's request to move page mocks into PostgreSQL is implemented. Migration 20261103130000_catalog_presentation is applied and adds currency, photoIndex, isSample, patterns and finishes. Prisma reports no drift between the local database and schema.

The approved 12 samples were transferred into prisma/demo-products.json and inserted with seed:demo. It upserts by stable SKU using an empty update, so repeated setup preserves existing records and IDs. No year ranges or sellable stock were invented. This is clearly marked demo inventory, not production fitment evidence.

Frontend features/storefront/catalog.ts was removed. The server layout retrieves all product pages through features/products/api.ts and passes them into the shared shell. Collection filters derive their categories/makes from the records. Product descriptions, prices/currency, image paths/crops and pattern/finish options come from those records. Both catalog renderers share database-driven image styling. No product-sheet URL or fake product ID remains in storefront code/CSS.

Bag storage uses a new versioned key and database IDs. Restored options are validated against each current database product; names/prices are looked up from the catalog rather than trusted from localStorage. API outage state does not overwrite existing saved bag data. Static material-study choices and marketing copy remain UI/domain configuration, not a product dataset.

Verification: API build, TypeScript, web production build, lint, 17 regression tests and PostgreSQL integration test passed. Integration coverage includes database option/image-crop round trips. Repeating the seed kept the catalog at 12. An API-created temporary product appeared in homepage HTML without a frontend change, then was deleted. A temporary production server with an unavailable API rendered the unavailable state and no mock products; it was stopped afterward. The normal app remains on localhost:3000/4000. Browser visual interaction remains unverified. No commit or push was performed.