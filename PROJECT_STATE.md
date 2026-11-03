# Current implementation status

## 3 November 2026 â€” CARBIGNITE admin

- Branch: `feat/carbignite-admin`. Original checkout had no root instruction/context/state files; user-provided AGENTS instructions and `apps/web/AGENTS.md` apply. Handoff context, decisions, integration plan and public design sources were read from `C:/Users/USER/Desktop/CARBIGNITE_PROJECT_HANDOFF/CARBIGNITE_HANDOFF/`.
- `/admin` is a React panel using shared StorefrontShell/theme/DM Sans/dialogs and scoped reference commerce CSS. Product list/search/pagination, create/edit, stock/pricing/visibility, pattern/finish choices and nullable vehicle/year fields are API-backed. Dashboard counts and request lists/details/status updates use PostgreSQL. Owner intake records phone/email inquiries; customer checkout/accounts remain unimplemented.
- Main paths: `apps/web/features/admin/`, `apps/web/app/admin/page.tsx`, `apps/web/app/api/admin/[[...path]]/route.ts`, `apps/api/src/modules/admin/`, `apps/api/scripts/admin-credentials.ts`, `docs/CARBIGNITE_ADMIN.md`.
- No existing auth/order models existed. Added a server-configured owner with scrypt password hashing and signed eight-hour sessions; browser uses an HttpOnly SameSite Strict cookie through a same-origin Next proxy. Fastify checks all admin routes and existing product write routes directly. Credentials are not provisioned automatically; owner must configure the ignored API environment using `admin:credentials`.
- Additive migration `20261103140000_admin_requests` applied to the existing local PostgreSQL on localhost:5433. Adds Product.active, RequestStatus and OrderRequest snapshot storage/index; preserves existing records. Public catalog excludes inactive records. Requests use server prices, checked options and aggregate quantities, retry UUIDs and six reference statuses. No payment, stock reservation or shipping integration.
- Verification: 17 regression tests, catalog database integration, admin database integration and Next proxy HTTP integration passed. API build, web lint and production web build passed; Prisma reports all four migrations applied. Temporary test records were removed. Local Next/API dev servers restored on ports 3000/4000. Browser visual review remains manual because no browser control tool is available.
- No production deployment, commit, push or merge requested. Keep remaining auth/customer checkout scope explicit; process-local login limiting needs shared storage for multiple API instances.

## Admin access and readability follow-up

- User confirmed the sign-in issue is Products inside `/admin`. Verified owner configuration was absent in the ignored local API environment; this is not a public catalog authorization failure. Authorization remains required for admin data and edits.
- Added `pnpm.cmd --filter @carbignite/api admin:setup`: prompts locally for owner email and a hidden password, writes hashed credentials/session secret into the ignored API environment, preserves other settings, and refuses to overwrite existing credentials. Restart API after setup. No owner password was invented or configured by the agent.
- Sign-in screen includes visible first-time setup steps and a public `/products` link. Admin reference text now has a 14px minimum; form inputs use 16px, mobile metrics stack, and narrow product/request forms use one column. Files: `apps/api/scripts/admin-credentials.ts`, `apps/api/package.json`, `apps/web/features/admin/{admin-panel.tsx,admin.css,commerce.css}`. Setup documentation updated in `docs/CARBIGNITE_ADMIN.md`.
- Follow-up checks: web lint and production build passed; all eight API unit tests passed, including two owner-setup tests for preserving database configuration, hashing passwords, input validation and refusing credential replacement. Public API returns 12 products and `/products` returns HTTP 200 without sign-in. No browser visual verification available. Admin-scoped header/footer text also enlarged. Setup config generation lives in `apps/api/scripts/admin-config.ts` and is covered by `apps/api/tests/admin-setup.test.ts`.
- User requested resetting an accidentally typed password. Removed only the three owner configuration keys from the ignored local API environment, preserving other settings, and reopened interactive setup. Password input now displays asterisks and supports visible backspace feedback. Owner must finish choosing credentials in the terminal, then restart the API to load them.
- Owner completed setup; verified all three configuration keys are present without exposing their values. Restarted the local API on port 4000 at the user's request to load the new credentials. Owner can now sign in at `/admin` using their chosen email/password; password-based sign-in remains for the owner to verify.

## Product gallery and checkbox alignment

- Product editor now previews existing images, uploads multiple JPEG/PNG/WebP files (5 MB each; 12 per product), accepts image URLs, selects a cover, and removes gallery images. Save persists gallery membership/order. Storefront product dialog has thumbnail switching. Checkbox labels use explicit flex alignment and reset checkbox sizing/margins; collapsed inline admin thumbnails now display as blocks.
- Additive local migration `20261103150000_product_gallery` adds `Product.imageUrls` and PostgreSQL `MediaAsset` bytes. Existing cover URLs are backfilled. Product service synchronizes legacy `imageUrl` with the gallery's first image. Uploads require Fastify owner authorization at POST `/admin/images`; public GET `/media/:id` is served through Next `/media/[id]` with file-type headers. Removing gallery membership retains shared image storage; unused-upload cleanup/resizing remains future work.
- Paths: `apps/api/src/modules/admin/media.ts`, product schema/service, Prisma schema/migration, `apps/web/features/admin/product-gallery.tsx`, product editor/admin CSS, storefront product dialog/integration CSS, `apps/web/app/media/[id]/route.ts`. Product saves refresh shared catalog data.
- Checks: 19 regression tests, catalog/admin/gallery database integration and real Next proxy upload/image HTTP tests passed; API build, web lint and production build passed. Test records cleaned up. Browser visual review remains manual. Normal API is restarted after testing. Five local migrations now applied.

## Shared dropdown styling

- User requested branded dropdowns across the entire app, with no orange selection/focus border and a subtle arrow animation. Added `apps/web/components/ui/dropdown.tsx` and `dropdown.css`, imported globally in the root layout. Migrated storefront make/product options, catalog make/model/year, admin status filters, request options/status and product category/image crop.
- Menus use theme paper/ink/line/soft tokens in light and dark mode, neutral selected/hover backgrounds, a 180ms rotating arrow, and a static keyboard-focus underline. The shared control keeps a hidden native select for FormData and existing real change events, with keyboard navigation, typeahead, Escape/outside dismissal, disabled-fieldset support and menu placement within dialogs. Reduced motion disables the arrow transition. No backend or database changes.
- Verification: 19 regression tests, web lint, TypeScript and production build passed; admin/catalog routes return HTTP 200. Search confirms the only remaining native select is the hidden form control inside the shared component. Browser keyboard/visual review remains manual. Verify every dropdown opens, closes with Escape/outside click, changes filters/options, and submits the selected value in admin forms; verify keyboard focus, disabled vehicle fields, both themes and mobile dialog placement.

## Admin control alignment follow-up

- Fixed order-detail status dropdown collapsing because the shared form button had width 100% and a top margin: the status row now uses grid, a flexible dropdown column and an auto-width action; stacks below 480px. Toolbar actions align to the bottom of labeled filters. Search inputs, toolbar dropdowns and action buttons share a 48px height; Add product stays on one line. Only `apps/web/features/admin/admin.css` changed; no data/API changes. Browser visual review remains manual.

## Input focus styling

- Replaced the orange 2px outline with 5px outside offset on all inputs/textareas with a subtle muted inset bottom line. Focus stays inside the original field dimensions across the app; checkboxes/radios use an inward graphite focus marker. Shared input focus border is neutral. Button/link keyboard focus and the custom dropdown design remain unchanged. Paths: storefront `style.css`, `interactions.css`, `integration.css`. No backend changes; browser visual verification remains manual.

## Server-protected admin page

- `/admin` now checks its session server-side with Fastify before rendering the panel; absent, forged or expired sessions redirect to `/admin/login`. Added `apps/web/lib/admin-session.ts`, `apps/web/app/admin/login/page.tsx` and `features/admin/admin-login.tsx`. Removed all owner-setup instructions from public UI; setup remains a local terminal command documented for developers. Sign-out/expired sessions navigate to the separate login screen.
- New root-scoped HttpOnly SameSite Strict `carbignite-owner-session` cookie allows both server-rendered admin pages and the API proxy to verify the same session. Old API-scoped cookie is cleared on login/logout and no longer accepted by the proxy. Existing browser sessions require one fresh sign-in. Backend role/signature/expiry checks remain authoritative for every API call; credentials/data unchanged.
- Verification: web lint and production build passed. Real Next HTTP integration passed for anonymous/forged/expired page redirects, valid owner panel rendering, removal of setup information, new cookie flags/path, API authorization, CSRF rejection and media upload/read. Tests cleaned their temporary media. Normal API restored afterward; browser visual review remains manual.

## Focus and product status colors

- Changed the shared inset input/textarea focus underline to the brand orange, retaining the original field dimensions and neutral dropdown styling. Product visibility badges now use separate classes: Active is green and Hidden is muted gray, with light/dark theme variants. Files: storefront `integration.css`, admin `admin-panel.tsx` and `admin.css`. No backend or database changes; browser visual review remains manual.
- Matched admin dialog text/number inputs and dropdowns to an explicit 48px border-box height, 16px font, 24px line height and identical padding. This fixes quantity versus concept-image-crop sizing without resizing checkboxes, file uploads or textareas. File: `apps/web/features/admin/admin.css`; visual browser verification remains manual.

## Uploaded product image fit

- Shared `productImageStyle` now uses `contain` and disables background repetition for single uploaded photos, so portrait/landscape images remain fully visible inside product cards, gallery thumbnails and the product dialog. Explicit concept-sheet crops retain their 200% crop and positioning. File: `apps/web/features/products/utils.ts`. No database changes; visual browser verification remains manual.
- Verified the user's Test Product had photoIndex 1 (Console surround) applied to a `/media/` upload. The shared renderer now ignores sheet crops for uploaded media, and the editor disables that setting for uploaded covers, saving a null crop on subsequent saves. Admin list and editor previews now reuse the same image helper. Existing uploaded images render correctly without needing database edits; demo-sheet crops remain available.

## Branded notification pop-ups

- Replaced persistent admin success banners and the old storefront toast with shared corner notification cards. Provider/context and viewport live in `apps/web/components/ui/notifications.tsx`, styles in `notifications.css`, mounted through StorefrontShell. Admin save/request/status confirmations and storefront messages share light/dark styling, orange accent, status icon and dismiss control. Inline form/validation errors remain with their fields.
- Notifications dismiss after five seconds, pause on hover/keyboard focus, deduplicate repeated messages and cap the visible stack at three. Switching admin sections or signing out clears notifications. No layout space is reserved, so notifications do not shift the dashboard or persist across tabs.
- Motion informed by the user-linked https://github.com/kylezantos/design-motion-principles and local motion-cookbook/accessibility/creation-gotchas references: restrained 240ms entrance/160ms exit, small translate/opacity changes, no bounce/pulse and reduced-motion support. No animation package or skill installation added. Browser visual/timer interaction review remains manual.
- Verification: web lint, production build and all 19 regression tests passed. Removed legacy toast markup/state/styles and the persistent admin notice banner. No API, authentication or database changes.

## Product delete and duplicate actions

- Added Edit / Duplicate / Delete actions to admin product rows. Delete opens a branded confirmation with the product name/SKU and busy/error states, then calls protected DELETE `/admin/products/:id`. It reuses the existing product deletion service. Next proxy now supports DELETE and empty 204 responses; client API helper handles 204 without attempting JSON parsing. Deleting the last row on a page moves back a page, refreshes shared storefront data and shows a success pop-up.
- Duplicate opens the product editor in create mode, copies details/options/gallery, generates a distinct SKU/slug and copy name, and starts hidden with zero stock. Only Save creates the new database record using existing validated POST; the original stays unchanged. Shared uploads and immutable order-request snapshots remain intact when deleting products. No database migration required.
- Paths: `apps/web/features/admin/delete-product-dialog.tsx`, admin panel/editor/API/CSS, Next admin proxy, `apps/api/src/modules/admin/routes.ts`. Tests added to admin database and Next HTTP integration for duplicate creation, protected deletion, missing products, preserved request snapshots, cross-origin rejection and empty-response handling. Both integration tests, API build, web lint and production build passed. Temporary records cleaned; normal API restored. Browser visual interactions remain manual.

## Semantic notification colors

- Notification accent stripe and icon now use green for success, red for errors, and brand orange for informational messages, with matching pale icon surfaces and dark-theme variants. Text labels/icons still distinguish message types without relying only on color. File: `apps/web/components/ui/notifications.css`. Timing, dismissal and backend behavior unchanged; visual browser verification remains manual.
- Notifications moved to the top-right corner, below shared navigation (104px desktop / 88px mobile, with safe-area support). No longer anchored to the bottom. Success/error color build passed before this placement-only CSS adjustment.

## Pull request preparation

- User requested a PR for the completed admin panel and subsequent UI refinements. Target: `main`; head: `feat/carbignite-admin`. Latest fetched main matches the branch base. Local API/web credential files remain ignored and are excluded from the commit.
- Validation accumulated during implementation: API/web builds, web lint, 19 regression tests, catalog/admin/gallery real-database integration and Next proxy HTTP authorization/upload/deletion checks passed. Final web build/lint rerun for the latest notification position/color changes. Browser visual and keyboard interaction review remains manual.
- Includes two additive migrations (`20261103140000_admin_requests`, `20261103150000_product_gallery`), locally applied. Owner setup and deployment/testing steps are in `docs/CARBIGNITE_ADMIN.md`. No merge, production migration or deployment is part of this PR task.

## Request status badge colors

- Request badges now have six distinct text/surface palettes shared by dashboard, request list and detail dialog: requested amber, in review blue, quoted purple, in production orange, shipped green and cancelled red. Includes dark-theme variants; status labels remain visible so meaning does not rely on color alone. File: `apps/web/features/admin/admin.css`. Product visibility badges remain separate. No API/schema/status changes; browser visual review remains manual.

## Browser tab icon

- Added the user-supplied CARBIGNITE C monogram as root Next app icons: `apps/web/app/favicon.ico` (16/32/48px), `icon.png` (64px) and `apple-icon.png` (180px). Converted with the installed Sharp dependency without changing the original artwork or source file. Next file-based metadata supplies icon links across storefront and admin routes. Browser favicon caching may require a hard refresh.

## Dedicated shop and limited homepage collection

- Added `/shop` with server-applied search (name/SKU), make/category filters, newest/price sorting, 12 products per page and matching total count. URL query parameters preserve selections and pagination; control changes remove page, and out-of-range pages redirect to the last available page. Includes loading, retryable error, empty-results and clear-filter states.
- Paths: `apps/web/app/shop/{page,loading,error}.tsx`, `apps/web/features/storefront/shop-catalog.tsx`, shared product pagination and storefront integration CSS. Reuses storefront ProductCard, ProductDialog, options and existing shell/cart. Styles use existing theme tokens and responsive layouts. Header Collection links to `/shop`.
- Homepage uses independent `getHomepageProducts()` query (page 1, limit 8), existing SKU ordering because no featured field exists. Collection preserves its design/filter controls, caps display at eight and links to `/shop`. Other homepage sections unchanged. Full shell catalog loading remains necessary for existing saved-bag validation and is not capped by homepage limit.
- API: existing GET `/products` accepts optional `sort=newest|price-asc|price-desc`; absent sort preserves SKU ordering. Database orders before applying skip/take and counts all matches with the same active-product filters. Stable ID tie-breakers prevent ambiguous ordering. Existing `/products/filters` adds distinct active-product `makes`, including products with no model. No migration or new database field; checkout/auth unchanged.
- Verification: API build, web lint and production build (including TypeScript) passed. Expanded real-database catalog integration passed for sort orders, count/pages, second-page results, search and hidden-product exclusion; temporary records cleaned. Browser visual/keyboard review in both themes remains manual.

## Shop search control alignment

- Updated `apps/web/features/storefront/integration.css`: search uses a flexible input and compact auto-width button, with explicit 48px heights, centered text and zero input margins. Shop dropdown triggers share the same height. Fixes inherited full-width form-button styling and input top margin that caused the oversized, misaligned Search action.
- Shop dropdown selected, hovered and keyboard-active options now use brand orange with white text in both themes. Scoped to shop filters; no query/API behavior changes. Browser visual review remains manual.

## Shop vehicle selector and search clear icon

- `/shop` now reuses the shared dependent make/model/year VehicleSelector above the search/category/sort toolbar; removed the duplicate make-only filter. Find parts preserves existing search/category/sort, resets pagination, and applies vehicle filtering through the existing server API. Shop page parsing now retains model and validates year (1900–2100) in URLs.
- Shared selector accepts optional availableMakes (includes makes without model data) and allowEmpty (lets shop return to all vehicles); other usages retain their existing defaults. Search replaces the browser clear glyph with a thin-stroke Lucide X, theme colors, orange hover, visible keyboard focus and a labeled 40px target; clearing also removes the applied search and resets pagination.
- Paths: `apps/web/features/storefront/shop-catalog.tsx`, `integration.css`, `apps/web/app/shop/page.tsx`, `apps/web/features/products/components/vehicle-selector.tsx`. Shop vehicle dropdowns retain orange selected/hover states and responsive layout. No backend/schema changes. Browser visual/keyboard review remains manual.
- Verification: web lint and production build (including TypeScript) passed for the vehicle selector and search clear changes.

## Unified shop filters, mobile sheet and branded pagination

- Replaced the separate vehicle Find parts/search controls with one shared ShopFilterForm. Vehicle, search, category and sort remain drafts until the single Search submit applies them together through URL parameters and resets pagination. Dependent make/model/year choices reset invalid child selections. Search clear edits the draft; Clear filters resets all fields and applied URL state.
- Desktop displays the combined form; below 1024px the existing MobileFilters component hosts it in a redesigned native dialog sheet with one full-width Search button, active removable filter chips and total count. Reuses existing modal focus/Escape/backdrop handling and scroll lock. MobileFilters accepts an optional custom content component and shop variant; `/products` keeps its original default content. Shared VehicleSelector now supports controlled fields-only rendering without a nested form or second submit.
- Pagination uses theme paper/ink/line colors, square 44px controls, orange selected/hover states, numbered desktop links with ellipses, and compact previous/page-status/next on phones. Links preserve all applied URL parameters and mark the current page accessibly. Shared by `/shop` and `/products`.
- Paths: `apps/web/features/storefront/shop-catalog.tsx`, `integration.css`, `apps/web/features/products/components/{vehicle-selector,mobile-filters,pagination}.tsx`. No backend, schema, checkout or authentication changes. Browser visual/keyboard review in both themes remains manual.
- Verification: web lint, production build with TypeScript, all 19 existing regression tests and diff whitespace checks passed. Removed obsolete search-button styles; compact pagination follows the 700px phone breakpoint.

## Homepage best sellers and section navigation

- Removed homepage category tabs and make filter: the eight-product preview is now presented as Best sellers with updated supporting copy, selected-part count and View all products linking to `/shop`. Existing cards/dialog/cart and the eight-active-product query remain unchanged. File: `apps/web/features/storefront/components/collection.tsx`.
- Verified current header already links Collection to `/#collection` and Material to `/#material`, with both matching section IDs and smooth scrolling/reduced-motion support. Preserved the user's header edits; from other routes these links return to the corresponding homepage section. Full search/vehicle/category filtering stays in `/shop`.
- Best sellers is presentation copy requested by the user, not a computed sales ranking. Selection still uses the existing SKU ordering; real best-seller ranking/curation remains future work and requires an explicit data source. No schema/backend changes.
- Verification: web lint and production build with TypeScript passed. Browser visual/scroll review remains manual.

## Shared loading bar and catalog cache

- Added `components/ui/loading-bar.tsx` / `loading-bar.css`: a thin two-pixel orange indeterminate bar with theme-aware track, screen-reader status and static reduced-motion variant. Root/shop/products route fallbacks use it; admin list/access/sign-in/sign-out/save/delete/request/upload states and shop search use the same component. `components/ui/navigation-link.tsx` uses Next useLinkStatus for pending links (including pagination), portaling the fixed bar outside transformed controls. Already-prefetched transitions remain instant.
- Public API reads opt into the Next persistent Data Cache via `lib/catalog-cache.ts` and `features/products/api.ts`. Cache lasts until invalidation/eviction; each server-filtered query has its own cache entry. Query key ordering is canonicalized; React cache also deduplicates full catalog assembly within a render. Homepage eight-product query stays separate from full bag catalog and paginated shop queries. No browser polling or client-side catalog filtering added.
- The protected Next admin proxy (`app/api/admin/[[...path]]/route.ts`) immediately expires the shared catalog tag only after successful product POST/PATCH/DELETE, including empty 204 deletion. This covers cached product lists, homepage, filters and bag data on the following request. Failed/unauthorized writes, image uploads and order updates preserve cache. Admin/session data remain no-store. Updates made directly to PostgreSQL or directly to Fastify bypass the web proxy and require explicit cache invalidation/restart; this workflow assumes edits through the admin UI. Already-open customer tabs are not pushed live updates. Development hard reloads may bypass Next fetch caching; production behavior is tested.
- Reduced identified unnecessary renders: memoized storefront context so opening dialogs/bag/theme updates do not broadcast new product context; split stable notification actions from notification items so notices do not rerender storefront/admin consumers; avoid resetting an unchanged saved bag and redundant controlled VehicleSelector local state. MobileFilters now accepts stable React children and provides close via context, preventing filter-form remounts during transitions. Clicking an already-active admin tab no longer sets a loading state with no new request.
- Added `tests/catalog-cache.integration.test.mjs` and `pnpm --filter @carbignite/web test:cache` (run after web build). Starts isolated temporary production Next and mock API servers; no database or real credentials. Verifies repeat home/shop/filter reads stay cached, equivalent URL key order reuses data, success-only invalidation for all three product writes, preserved empty 204 responses and uncached admin reads. Test processes close afterward.
- Checks: web lint, production build/TypeScript, cache HTTP integration and all 19 existing regressions passed. Browser inspection was attempted but the browser access host is unavailable, so visual/timing/profiler verification remains manual. No API database schema or authentication behavior changes.

## Hydration-safe reveal animations

- Fixed the reported `/shop` hydration mismatch: StorefrontShell's root MutationObserver decorated streamed page markup (`reveal`, `is-visible`, `--reveal-delay`) before ShopCatalog hydrated. Removed reveal setup and the DOM ref from the shared shell.
- Added `apps/web/features/storefront/use-reveal.ts`; Homepage and ShopCatalog attach it to their own main element, so animation setup starts in that page component's post-hydration effect and only observes its subtree. Updated `style.css` selectors for page-scoped motion-ready. Existing stagger, reduced-motion, missing-observer fallback and Strict Mode cleanup behavior remain intact. No hydration-warning suppression, caching or API changes.
- `tests/scroll-reveal.test.mjs` now tests the extracted hook, including isolation between a hydrated page and a page waiting to hydrate. Web lint, all 20 regressions and production build with TypeScript passed. Browser hydration-console verification remains manual because the browser host was unavailable in this session.

## Shared admin/storefront pagination

- Admin Products and Order requests now render the same `features/products/components/pagination.tsx` used by storefront. Added optional onPageChange/disabled props for local admin state; storefront retains URL links and query preservation. Shared page numbers, ellipses, orange active state and phone controls use existing design CSS.
- Replaced the admin-only pagination helper with guarded changePage, preserving search/status/tab state and loading protection. Removed unused `.admin-pagination` styles from `features/admin/admin.css`. Single-page results follow shared pagination behavior (no pager). No API or authentication changes.
- Verification: web lint and production build with TypeScript passed. Admin visual/click review remains manual.
- Admin product table now displays a live “Showing X–Y of Z products” count, based on the server page and total. Empty search results show “No products”; the existing 10-item pagination and server count provide accurate ranges. Paths: apps/web/features/admin/admin-panel.tsx, types.ts, admin.css. No additional validation run for this display-only change.
