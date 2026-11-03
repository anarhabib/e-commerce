# CARBIGNITE design review

This branch contains the approved homepage design, light/dark themes, native product and bag dialogs, six material previews, glass navigation, final hover exceptions, reduced-motion support and filter/mobile-menu animations. The reveal effect handles Strict Mode cleanup, Fast Refresh, dynamically inserted cards and motion-preference changes.

The homepage lives in features/carbignite. Its shell is mounted only by the homepage route. The existing catalog components and API contract remain; app/products/layout.tsx retains the original header/footer there. The make/model/year selector appears above the catalog grid, uses API facets and preserves category/search filters while resetting pagination.

No backend, database migration, package rename, catalog-model change or permanent shared-layout restructure is included. That work is preserved separately for feat/carbignite-api-structure. The patch and extracted reference handoff are excluded from implementation commits.

Validation: web production build/TypeScript passed; lint has only the existing unused buttonStyles warning in pagination; all eight reveal/storage tests passed. Browser visual comparison and live API/database integration were not exercised by the agent. Homepage concepts are not actual inventory, and account/checkout/admin remain deferred.

Commands from the repository root (package names intentionally unchanged in this design PR):

```sh
pnpm --filter @flame-lenses/web dev
pnpm --filter @flame-lenses/web build
pnpm --filter @flame-lenses/web lint
pnpm --filter @flame-lenses/web exec node --test tests/scroll-reveal.test.mjs
pnpm --filter @flame-lenses/api exec node --import tsx --test ../web/tests/concept-selection.test.ts
```