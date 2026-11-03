# Current implementation status

## 3 November 2026 — CARBIGNITE admin

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
