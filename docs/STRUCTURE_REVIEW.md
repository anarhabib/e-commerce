> Latest catalog integration: homepage product mocks are now stored in PostgreSQL. The frontend catalog module was removed; page, filters, options, imagery and bag resolve API product records. There are 12 labeled demo products, populated by the non-destructive seed:demo command. Migration 20261103130000_catalog_presentation is applied. Builds, lint, 17 regression tests, real-database integration, live-update and unavailable-API checks passed. API_MIGRATION.md and the root README describe the current setup; older sections below are historical.
> Follow-up resolution: the repository's repeated query conditions, API year-range validation (including merged PATCH records), nullable updates, broad storefront header/footer/dialog selectors and mobile-filter scroll-lock cleanup have now been fixed. Current validation is recorded in API_MIGRATION.md. The issue list below retains the earlier audit history.
> Current API-branch status, 3 November 2026: the follow-up was restored after design PR #17 merged. The owner chose this project's local Docker PostgreSQL. Both migrations have now been APPLIED to the new local database on localhost:5433; the existing container on 5432 was left untouched. No real catalog records were inserted. API year-range/null validation and repeated-query cleanup are implemented. API/web builds, lint, 13 regression tests, the real-database integration test and HTTP checks passed. Product count is zero after test cleanup. See API_MIGRATION.md for the authoritative current record; statements below about an unconfigured/unmigrated database describe earlier sessions.
> Updated after owner clarification: the owner does not need lighting data or its old schema. Prisma and API/frontend contracts now use PADDLES/CONSOLE/TRIM, with color/side removed. The old destructive lighting seed and its command were deleted with permission. Migration `20261103120000_carbon_catalog` explicitly deletes existing Product rows before changing the enum and columns. Original migration history remains intact. This migration has NOT been applied: no apps/api/.env or configured database target exists. The database-backed catalog will be empty after application until actual carbon records are entered. The homepage concept catalog stays separate.
>
> Verification after the contract update: Prisma client generation, API compilation, web production build, lint, eleven tests and Prisma schema validation passed. Schema validation used a placeholder connection string and made no database connection. The API rootDir is now explicit so removing the Prisma seed does not change the dist/src/server.js entry-point layout.
# Architecture review — 3 November 2026

## What changed from the original structure

The original `features/products` remains the API-backed catalog. `features/storefront` was added for the approved carbon design and browser-local concept selection. The temporary `(legacy)` route group is gone. `app/layout.tsx` wraps all routes in StorefrontShell; it does not replace the Fastify server or turn the server-rendered products page into client-side database access.

```text
apps/
  web/
    app/                         URL routing and server-rendered pages
      layout.tsx                 fonts, shared styles and StorefrontShell
      page.tsx                   homepage entry
      products/page.tsx          fetches products/facets and composes catalog UI
      products/error.tsx         recoverable catalog error screen
    features/
      storefront/                approved storefront and concept interactions
        storefront-shell.tsx     shared theme, bag, dialogs, reveal lifecycle
        homepage.tsx             composition of existing homepage sections
        catalog.ts               illustrative carbon products only
        selection.ts             browser-storage validation
        types.ts                 concept product and material/finish types
        components/              header/footer, sections and dialogs
        style.css                reference layout and responsive design
        interactions.css         final hover/focus exceptions
        integration.css          integration fixes and animation keyframes
      products/                  actual API-backed catalog
        api.ts                   typed product/facet requests
        types.ts                 API-facing types
        utils.ts                 price/category/fitment formatting
        components/              grid/cards, vehicle selector, filters, pagination
    components/ui/button.tsx     reused presentational button
    lib/api-client.ts            server-side API_URL fetch wrapper
    public/carbignite/           approved image URLs; folder name is branding
    tests/                       reveal lifecycle and concept-storage tests
  api/
    src/server.ts                starts the HTTP listener
    src/app.ts                   constructs Fastify, errors and routes
    src/lib/prisma.ts            shared database client
    src/lib/errors.ts            application NotFoundError
    src/modules/products/
      routes.ts                  maps HTTP methods and URLs to handlers
      controller.ts              parses input and chooses HTTP responses
      schema.ts                  Zod validation and derived input types
      service.ts                 business rules and response composition
      repository.ts              Prisma queries only
    prisma/schema.prisma         database models
    prisma/migrations/           versioned database history
    prisma/migrations/20261103120000_carbon_catalog/  approved carbon transition
```

## One concrete request

A customer submits the vehicle selector. It updates `/products?make=...&model=...&year=...`, preserving categories/search and dropping the old page number. Next renders `app/products/page.tsx`, which calls `features/products/api.ts`. The shared fetch helper requests Fastify using server-only `API_URL`. Fastify routes call the controller; Zod validates the query. The service calls the repository. Prisma reads PostgreSQL and returns products/counts; the response comes back to Next and the grid renders. The browser never connects directly to PostgreSQL.

The controller/service/repository separation is reasonable even for a small app. Keep it: HTTP decisions, business rules and database queries have different jobs. Likewise frontend `api.ts` and API backend modules are not duplicates: one is the consumer, the other serves the request.

## Implemented vehicle-selector change

The existing make/model/year selector now appears above the `/products` grid on desktop and mobile. Its duplicate sidebar placement was removed; active vehicle summaries and clearing remain. Initial fields come from the URL. Make/model changes reset dependent selections. Submission preserves category/search and resets pagination. Year is disabled if no supported years exist. Options use actual API facets, never carbon sample data. No fitment or year data was invented.

## Issues and recommendations

1. Two data sources remain: illustrative homepage concepts versus API catalog records. The API schema is now carbon-oriented; actual database migration and real catalog population are pending. Product variants/material pricing remain future work. Keep features/products, schema and migration history.
2. No backend authentication/roles protect product writes. This must be implemented before exposing an admin or production commerce workflow. No auth implementation was added in this review.
3. The old lighting seed and command were removed after owner permission. The prepared carbon migration deliberately discards old Product rows; it has not run.
4. `repository.findMany` repeats make/model/year/search clauses already produced by vehicleWhere. Consolidate later with query regression tests; this is redundant logic, not an unnecessary repository layer.
5. Product validation checks each year independently but does not ensure yearFrom <= yearTo. Nullable database fitment/image fields also cannot currently be cleared with null through PATCH. Define the intended update contract before changing it.
6. Some reference selectors target every descendant header/footer/dialog. The mobile catalog filter dialog also contains a header/footer, so narrow storefront chrome selectors to direct children in a dedicated CSS review. Passing compilation does not verify the filter sheet visually.
7. MobileFilters restores body overflow with a literal empty string on close and lacks unmount restoration. It should preserve the previous value and restore it on unmount, like the shared Dialog lifecycle.
8. StorefrontShell combines persistence, reveals and dialogs. This is workable now; extracting small hooks can improve readability later, without moving everything into the route files.
9. Three CSS files are a preserved reference cascade, not three styling engines. Tailwind handles suitable utilities. Later consolidate obsolete experiments only with visual checks; keep the final interaction exceptions.
10. `formatFitment` is currently unused. Reuse it in catalog cards or remove only that function; `utils.ts` itself is required for price/category formatting.
11. Both app .env.example files now contain placeholder configuration. `apps/web/README.md` only forwards to the root README and is optional. Root package `main: index.js` is unused metadata for a private workspace, not an application entry point.
12. Retain generated Prisma files in local builds and retain all migration history. Dependency folders and build output are generated artifacts, not hand-written application structure. The existing Git ignore rules exclude generated build/dependency state.

## Verification and boundaries

Web production build including TypeScript and lint passed after moving the selector. Live vehicle options and filtering require the actual API/database, which were not running in this session. Browser control is unavailable, so mobile rendering and real interaction remain unverified. Only the owner-approved old seed source was deleted. No database rows have been changed. No migrations, seeds, commits, pushes, merges or deployments were performed.