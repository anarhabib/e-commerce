# Current implementation status

## Shared dialogs, demo checkout and consistent feedback live — 10 November 2026

- Final app commit `f1f1496b49dfcc6790c90abc7b43fe6b8c0f15d0` (includes demo checkout `8a64a30`) is live on the existing Render site as deployment `dep-dbp70cdbedkc73fscf60`; source pushed to `main` and `deploy/neon-render-frontend`.
- Public verification passes matching desktop hover/mobile active styles and reduced motion. Browser modal/checkout checks pass at 375x640, 393x700 and 1440x900, including filters apply/close, shared close visibility/tap area, bag persistence/subtotal, empty states, required fields, unchanged bag after demo confirmation and zero demo write requests. Transition checks wait for colors to settle before comparing. Physical Safari touch feedback remains for the user's device check.
- Every application modal now uses the single shared Dialog; mobile bottom Close is the default and stays reachable during scrolling, desktop retains top-right X. `/checkout` is explicitly a browser-only demo: no payment/order/email or saved contact details. No backend/schema/auth changes. Temporary scripts/server cleaned up.

## Consistent desktop hover and mobile press — 10 November 2026

- Unified author-defined hover and active feedback in storefront reference/interaction/integration styles and admin overrides. Pointer hover, keyboard focus and touch press now share collection title/underline/frame colors and arrow movement; shared buttons and navigation/admin actions expose their hover feedback on press too. Added a root touch-start hook so mobile Safari enables native active feedback. Reduced-motion and disabled-state exceptions retained.
- Production build/TypeScript, lint and diff checks pass. Local Edge comparison under desktop/touch emulation verifies matching computed collection/button states and reduced motion (active pseudo-state forced for deterministic style comparison). Checkout/modal regression passes at 375x640, 393x700 and 1440x900 with zero demo write requests. Physical touch-device behavior remains for user verification. Prior demo-checkout commit is `8a64a30`; final interaction follow-up publishes next.

## Shared dialogs everywhere and demo checkout — 10 November 2026

- All application modals now use `features/storefront/components/dialog.tsx`; mobile filters were the final independent native dialog and now use shared lifecycle, centering, focus restoration, Escape/backdrop close and body-scroll locking. Shared bottom Close is the default through 700px, with a sticky 44px mobile tap target; desktop retains the top-right X. Account, bag and custom brief now receive the same behavior as product/admin dialogs.
- Added bag Go to checkout link (disabled for an empty bag) and `/checkout`: `app/checkout/page.tsx`, `features/storefront/demo-checkout.tsx`. Shared shell exposes validated bag/ready state to the page. Demo shows selected variants, repeated entries/subtotal, required contact/delivery fields and a clear no-payment confirmation. It creates no order, sends no email/request, collects no card data and preserves the bag. Entered form values are not persisted. Handles loading, catalog failure and direct empty-bag access. Footer now labels demo checkout accurately.
- Production build/TypeScript, lint and catalog-cache HTTP regression pass. Local Edge checks at 375x640, 393x700 and 1440x900 pass public modal placement/44px close visibility, filter application, bag navigation/persistence/subtotal, required fields, empty states and demo completion with zero network writes. Screenshots visually reviewed. Raw `<dialog>` now occurs only in the shared component. No API/schema/auth changes. Deployment follows below.

## Modal centering and announcement alignment — 10 November 2026

- Shared `.storefront-dialog` now explicitly uses fixed positioning, zero insets, automatic margins and a dynamic viewport height cap. Removes the browser's focus outline only from the focused dialog container; interactive controls retain keyboard indicators. Announcement anchors use inline-flex with a 6px gap and an inline-flex icon span, preventing the SVG from wrapping away from its text.
- File: `apps/web/features/storefront/integration.css`. Lint and TypeScript pass. Production build/publication follows. Mobile Safari visual confirmation remains manual.

## Button and hover updates deployed and verified — 10 November 2026

- Deployed final app commit `27fcadd7c9d328f6c4ea449983fcf61925dd86ed` (includes shared-button commit `ac86c30`) to the existing free Render service as `dep-dbp6h2rrjlhs73f0cqng`, confirmed live. Source pushed to `main` and `deploy/neon-render-frontend`.
- Public Edge verification passes matching primary CTA hover/styles, Interior/Exterior title/underline/arrow hover, reduced motion, disabled states, submit type and shop navigation. Read-only public checks at 375x640, 393x700 and 1440x900 also pass navbar typography, section anchors, desktop filter alignment, product close placement and all four admin dialog close controls/SVG arrows. The first public hover attempt reached the previous version during switchover; rerun after explicit live confirmation passed.
- `admin-arrow.tsx` removed; Lucide icons are imported directly. Existing useful shared controls retained. All approved spacing/navigation/responsive-close changes are live. Temporary scripts/server cleaned up; no password, auth policy, API/schema, product or order changes were made during this UI deployment. Physical Safari review remains with the user.

## Desktop collection link hover — 10 November 2026

- Interior/Exterior collection cards now highlight their titles and Explore underlines in brand orange and translate their arrows 2px on desktop pointer hover. Keyboard focus highlights the text/underline; reduced motion keeps arrows static. Styles are in `apps/web/features/storefront/integration.css`.
- Production build and lint pass. Local Edge checks confirm both cards' colors, underline and arrow motion/reduced-motion behavior, alongside matching shared-button hover, navigation, submit and disabled-state checks. The prior shared-button commit `ac86c30` is live as Render deployment `dep-dbp6fkon74is73d0tf00`; this follow-up publishes next.

## Shared branded buttons and direct Lucide icons — 10 November 2026

- Replaced the unused legacy `components/ui/button.tsx` implementation with the existing branded primary/secondary styles. The shared Button supports native button props, navigation links, reliable native section/external anchors and optional `endIcon` content. Migrated matching filled storefront/admin actions, preserving native submit/button types and special Add-to-bag price/hover behavior.
- Explore the collection, Shop all parts and Discuss a custom part share the same dedicated `.button-icon` container and hover/focus translation. Only icons animate; reduced motion keeps them static, and disabled primary buttons retain their base color. Placement-specific margins/widths stay with their sections.
- Removed `features/admin/admin-arrow.tsx`; admin components import Lucide directly. Existing dialog/dropdown/loading/navigation components retain their useful behavior; no other newly introduced icon-only wrappers found.
- Production build/TypeScript, lint, catalog-cache HTTP regression and diff checks passed. Local Edge checks confirm all three CTA styles/hover matrices match, reduced-motion/disabled states, link navigation and submit types. Read-only release checks pass at 375x640, 393x700 and 1440x900 for prior navbar/anchors/filter changes and storefront/four admin dialog close behavior. No customer records, products, orders or credentials changed. User authorized implementation and deployment; publication follows below.

## Approved UI polish and admin controls — 10 November 2026

- User approved deployment of all pending storefront changes and requested the admin arrow/close fixes. This supersedes the earlier preview-only deployment hold.
- Added `features/admin/admin-arrow.tsx` (decorative 16px Lucide SVG) and migrated all northeast text arrows in admin sign-in, panel, product editor/gallery and request/detail actions. Shared admin CSS keeps icons inline. All four admin dialogs opt into `Dialog.closeAtEndOnMobile`: bottom Close through 700px, previous top-right SVG X on larger screens.
- Included pending collection CTA spacing, removal of duplicate mobile Shop link, reliable native section anchors, equal Account/Bag label size/weight, four-column desktop filters and mobile-only bottom product Close. No password/auth/database changes.
- Web production build, lint, TypeScript (via build), catalog-cache HTTP regression and diff whitespace check passed. Local read-only Edge checks at 375x640, 393x700 and 1440x900 passed storefront close placement, typography, section links, desktop filter alignment, admin SVG arrows and closing product/request/order/delete dialogs. Synthetic order data was intercepted only in the test browser; admin writes were blocked, no application records modified. Publication follows below.

## Owner login rejection diagnostic — 10 November 2026

- User reports rejected password. Verified deployed Neon Function has all three owner configuration keys (API exposes key names only); saved local hash format/session configuration is valid. A 60-second diagnostic token signed from the existing saved owner email/session secret is accepted by live `/admin/session` (200), and public `/admin` with that session renders (200). Public `/admin/login` responds 200. No password, credential hash or session token printed; no credential change performed.
- The website Account dialog uses customer Neon Auth, while `/admin/login` requires the separate pre-existing owner credentials. Asked which credentials user is using before choosing recovery. Cannot validate or recover their plaintext password. Existing UI changes remain local, awaiting approval before deployment.

## Navbar typography alignment — 10 November 2026

- `apps/web/features/storefront/integration.css` now gives header Account and Bag a shared 14px label token, weight 400 and line-height 1.4 at every breakpoint. Removed the narrow-phone 12px Account override. Local only; user approval before deployment still applies.
- Checked project skill files and lockfile: `motion-ui-review` and seven Neon skills are installed; UI UX Pro Max and Taste are not installed in this project's `.agents`/`.codex` skill directories.

## Close placement correction — 10 November 2026

- User clarified that the bottom Close belongs only on mobile. Shared `Dialog.closeAtEndOnMobile` now renders responsive close controls: at widths up to 700px the product modal hides the top toolbar and shows bottom Close; larger screens retain the previous top-right X and hide bottom Close. Other dialogs keep their previous controls. Mobile initial focus stays on the dialog; desktop keeps native initial focus behavior.
- Files: `apps/web/features/storefront/components/{dialog,product-dialog}.tsx` and `integration.css`. Prior desktop modal screenshot showing bottom Close is superseded. Changes remain local and undeployed pending user review.

## Desktop shop filter row preview — 10 November 2026

- Changed `.shop-filters` in `apps/web/features/storefront/integration.css` to four columns (wider search, then Collection, Part type and Sort by). Existing mobile sheet/breakpoints retained.
- Production build and local Edge geometry checks pass at 1024, 1280 and 1440px: all four controls share one row with no overflow. Mobile controls remain available at 393px. Screenshot: `C:/Users/USER/.codex/visualizations/2026/11/09/01a1c28c-8d7d-7081-8b1e-00b30b1411e0/desktop-filters-fixed.png`. Local, uncommitted and not deployed, pending the user's review alongside the modal/navigation changes below.

## Spacing, bottom Close and section navigation preview — 10 November 2026

- Local uncommitted changes: collection CTA has 24px mobile spacing below the heading; product dialog opts into shared `Dialog.closeAtEnd`, replacing the top toolbar with a small bottom Close action (14px icon). Dialog itself receives initial focus, retains Escape/backdrop closing and restores opener focus. Other dialogs retain their top close controls.
- Removed duplicate mobile header Shop link and its CSS; Shop remains in the hamburger/desktop nav. Homepage section links in `components/header.tsx` use native anchors so Collections resolves on repeated and cross-page navigation; intentional native-anchor lint exception is documented locally.
- Production build and lint pass. Local Edge checks at 375x640, 393x700, 430x780 and 1440x900 verify CTA gap, no modal scrolling, bottom Close placement, focus restoration, Escape and Collections navigation from home/shop. Preview screenshots: `C:/Users/USER/.codex/visualizations/2026/11/09/01a1c28c-8d7d-7081-8b1e-00b30b1411e0/{collection-fixed,modal-fixed}.png`.
- User explicitly requested images before deployment: previews shown; DO NOT deploy this revision until the user approves. No commit, push or deployment performed. Temporary preview script/server cleaned up.

## Shop-only collections update live — 10 November 2026

- Commit `aef8d1513fa381ed7178c5ba8ec06ec746dc5cac` pushed to `main` and `deploy/neon-render-frontend`; existing free Render deployment `dep-dbp5k4s9v7es73am4nqg` confirmed live. Public URL remains `https://carbignite-web-dev.onrender.com`.
- Public headless Edge checks passed at 375x640, 393x700, 430x780 and 1440x900: Interior/Exterior links and empty Exterior, no Best sellers, visible mobile Shop link and expanded menu, working back-to-top, inline bag count, both product panels without scrolling, 16px close icon, light/dark mode, adding to bag and `/products` 404. Browser checks used HTTP/1.1 after the test browser's HTTP/2 script downloads stalled, and explicitly waited for shop hydration before interacting. Health endpoint returns 200. Physical Safari review remains with the user.
- Removed temporary Neon branch `br-flat-art-bef907xj` after successful migration testing. Temporary browser scripts/server cleaned up; no browser dependency added to the repository. API is already deployed with the collection field; existing products/data preserved.

## Interior/Exterior navigation and compact product dialog — 10 November 2026

- Replaced the homepage Best sellers grid with two prominent Interior/Exterior collection cards and Shop all parts action; removed the unused eight-product homepage fetch. Header has Shop in navigation and a visible mobile Shop link. Footer Shop/back-to-top share inline 16px SVG arrows; back-to-top now calls `window.scrollTo` and honors reduced motion.
- Added `Product.collection` (`INTERIOR`/`EXTERIOR`), server validation/filtering/facets, collection-aware shop URLs and admin editor selection. Retained existing part types as secondary categories. User confirmed all existing demos are Interior; additive migration `apps/api/prisma/migrations/20261110010000_product_collections/migration.sql` defaults existing rows to Interior without deleting data. Exterior is empty until products are assigned.
- Migration and API integration tests passed first on temporary Neon branch `br-flat-art-bef907xj` (expires 11 November), then migration applied to production and the existing `hello` API Function redeployed. No Auth/storage/realtime policy changes. Seven migrations now applied.
- Product dialog uses compact square previews, image previous/next controls, Options/Details panels and one concise demo notice. Visible close X is 16px with a 44px hit area and no large box. Normal phone layouts fit without dialog scrolling; overflow fallback remains for unusually long text/zoom. Main files: `features/storefront/components/{collection,header,footer,product-dialog,dialog}.tsx`, `integration.css`, `shop-catalog.tsx`, and shared product/API schema/repository/admin editor files.
- API build, frontend production build, lint, 26 regressions and catalog-cache HTTP regression passed. Headless Edge checks at 375x640, 393x700, 430x780 and 1440x900 passed both panel heights, theme, add-to-bag, header overflow/count alignment, collection URLs/empty Exterior, working back-to-top and `/products` 404. Screenshots visually checked in light/dark. These checks emulate phone sizes; physical Safari review remains with the user. Frontend publication follows below.

## Shop-only public catalog — 10 November 2026

- Removed `apps/web/app/products/{page,error,loading}.tsx` and page-only product card/grid/filter components from `features/products/components/`. Removed unused price/fitment helpers and the legacy mobile-filter fallback and standalone vehicle form. Shop retains its controlled vehicle fields, filter sheet and shared pagination; admin pagination remains supported. Footer now links to `/shop`, and pagination defaults there.
- Kept `features/products/api.ts`, types, image/category helpers and backend `/products` endpoints because the homepage, shop, bag and admin still depend on them. No page-exclusive API existed; no database or backend product routes were deleted.
- README/admin guide and admin HTTP test now reference `/shop`. Production build, web lint and catalog-cache HTTP regression pass; regression explicitly verifies `/products` returns 404 while shop reads/filter caching and owner writes still work. Cleared only the stale generated `.next/dev/types/validator.ts` reference to the deleted route. Publication follows the existing phone-testing deployment workflow.

## Mobile fixes deployed — 10 November 2026

- User authorized commit, push and deployment. Commit `bc43a46fb11f44a6bdfa7000a27c27b1877cb19c` is pushed to `main` and `deploy/neon-render-frontend`. Existing free Render service deployed it as `dep-dbp56v6gekts73e8k4k0`, confirmed `live`.
- Production web build passed. Public homepage and `/api/health` return HTTP 200; published CSS includes the new dialog toolbar rules. Test at `https://carbignite-web-dev.onrender.com`. Physical iPhone visual confirmation remains with the user.

## Mobile product dialog layout — 10 November 2026

- `apps/web/features/storefront/components/dialog.tsx` now places a decorative SVG close icon in its own toolbar. `features/storefront/integration.css` gives it a 44px square target with theme colors, preventing image overlap and inherited button padding from producing a tall close button.
- Product gallery frames stay square, matching the demo sheet quadrants so `200% 200%` crops preserve proportions on mobile. Single uploaded images retain the existing contain sizing. Product dialogs now scroll within `100dvh - 32px`, including single-image products, rather than overflowing short screens.
- Web lint, TypeScript and diff whitespace checks passed. Physical iPhone visual verification and Render deployment remain pending. Changes remain local on `main`.

## Mobile arrow rendering follow-up — 10 November 2026

- Verified product cards in `apps/web/features/storefront/components/collection.tsx` already use Lucide SVG arrows (commit `096ac06`); the provided live iPhone screenshot shows the older emoji rendering. Added decorative accessibility marking to that icon and replaced remaining northeast text arrows in `hero.tsx`, `custom-brief.tsx` and the footer collection link with SVGs. Preserved existing header/footer edits.
- Web lint, TypeScript and diff whitespace checks passed. Live Render redeployment and iPhone visual verification remain pending; no deployment was performed for this follow-up.

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

- `/shop` now reuses the shared dependent make/model/year VehicleSelector above the search/category/sort toolbar; removed the duplicate make-only filter. Find parts preserves existing search/category/sort, resets pagination, and applies vehicle filtering through the existing server API. Shop page parsing now retains model and validates year (1900�2100) in URLs.
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
- Admin product table now displays a live �Showing X�Y of Z products� count, based on the server page and total. Empty search results show �No products�; the existing 10-item pagination and server count provide accurate ranges. Paths: apps/web/features/admin/admin-panel.tsx, types.ts, admin.css. No additional validation run for this display-only change.

## Storefront small-text readability

- Applied a compact three-step type scale as CSS variables on the storefront root: 12px captions, 13px labels, and 14px supporting text. Replaced formerly tiny 6–11px declarations with semantic tokens so metadata, badges, footer copy, dialogs, and mobile labels stay readable while preserving a clear hierarchy. Based on the linked UI/UX Pro Max guidance to use reusable semantic design tokens and keep text resilient; the repo does not prescribe exact pixel sizes. Main file: apps/web/features/storefront/style.css. No component, API, or schema changes. Web lint, TypeScript, and production build passed for this revision. Visual reflow review remains manual.
## Render + Neon development deployment preparation

- Added root `render.yaml` for separate Oregon free Render web services for
  `@carbignite/api` and `@carbignite/web`, using the repository's pnpm workspace
  commands and a server-side `API_URL` reference from web to API.
- Fastify already listened on `0.0.0.0` and platform `PORT`; added a database-
  independent `/health` route and made the API start script work without a
  local `.env` file on Render. Prisma already uses PostgreSQL; added the Prisma
  v6 `DIRECT_URL` for Neon migrations. Existing signed admin auth and same-site
  Next proxy are unchanged.
- Uploaded image bytes are stored in PostgreSQL `MediaAsset`, so they do not
  depend on Render's temporary disk. Neon storage remains a free-tier capacity
  limit to monitor.
- Important migration constraint: `20261103120000_carbon_catalog` deletes
  existing `Product` rows as part of the historical catalog conversion. The
  new deployment instructions require a fresh empty Neon database before
  running `prisma migrate deploy`; no reset, database push, credential entry or
  live migration was performed.
- Added `DEPLOYMENT.md` with beginner-friendly Neon/Render steps and env vars.
  Account creation, credentials, live migration, and URL verification remain
  user tasks. Prisma schema validation, API TypeScript build, web lint,
  TypeScript check, web production build, and Prettier checks passed. Local
  Prisma client generation hit Windows `EPERM` replacing its native engine
  file; API compilation still passed using the existing generated client, and
  the Render Linux build runs client generation in its clean build environment.

## Neon agent skills

- Installed Neon's seven default skills for Codex in `.agents/skills/neon*`;
  `skills-lock.json` records the installed sources. Verified each `SKILL.md`
  exists. The installer required a temporary Node 22.22 runtime because the
  system Node 22.11 is below its minimum; system Node was not changed.

## Neon CLI and project MCP setup

- Fetched `https://neon.com/.well-known/agent-skills/neon/SKILL.md` and verified
  it matches the installed parent skill; all seven project skills were already
  present and were preserved.
- Installed global Neon CLI 8.17.1. The user completed CLI OAuth sign-in, and
  the CLI profile now reports valid credentials. Commands that need newer Node
  use the temporary Node 22.22 runtime without replacing system Node.
- The requested `neon init` created an offline `.neon` link for project
  `still-cloud-64487711`, branch `production`, plus `neon.ts` and `hello.ts`.
  It added `.neon` to `.gitignore`. Its dependency install failed at the pnpm
  workspace root; installed `@neon/config` and `@neon/env` explicitly with `-w`,
  updating root `package.json` and `pnpm-lock.yaml`.
- Added project `.codex/config.toml` with OAuth-only Neon MCP URL pinned to
  this project. The earlier init also added OAuth MCP entries to the user's
  Antigravity/Gemini and Copilot configurations; its plugin/global-skill
  installs failed. Existing project skills cover Codex without those plugins.
- Verified existing global Codex configuration, API/web environment files,
  `.neon`, `neon.ts`, `hello.ts` and `skills-lock.json` were unchanged by the
  project MCP installation. MCP OAuth consent is prompted on first use after
  the project configuration is loaded. Service deployment, database migration,
  application integration and live service tests remain pending.

## Neon database connection verification

- User-provided deployment output reports `assets` and `hello` provisioned on
  the requested production branch, with Neon variables pulled to root
  `.env.local`. The application services still need integration and live tests.
- Fixed the API's missing `DIRECT_URL`: privately copied the root Neon
  `DATABASE_URL_UNPOOLED` into `apps/api/.env` as `DIRECT_URL`, and synchronized
  its pooled `DATABASE_URL`. Preserved existing admin settings and documented
  the CLI variable-name mapping in `apps/api/.env.example`.
- Reran `prisma migrate status`: connection to Neon's `neondb`/`public` succeeds;
  all five repository migrations are unapplied. Status exits 1 for this pending
  state. No database migrations were executed. Verify the target has no app
  data before applying the historical product-deletion migration.

## CARBIGNITE Neon service integration

- Confirmed the five initial migrations are applied. Added/applied
  `20261103160000_object_storage`: nullable legacy image bytes and an optional
  unique object key, preserving existing images and products. Migration status
  now reports all six migrations up to date.
- Prisma remains v6/PostgreSQL and now uses `@prisma/adapter-pg`, a small reused
  node-postgres pool and the JavaScript client engine. Paths:
  `apps/api/src/lib/prisma.ts`, `prisma/schema.prisma`, `prisma/seed.ts`. Native
  Windows engine generation no longer blocks builds; the same client bundles
  for Neon's Node runtime.
- New product uploads use the existing private `assets` bucket through
  `src/lib/object-storage.ts`; metadata stores the key, and the existing
  `/media/:id` and Next image proxy serve the bytes with immutable caching.
  Legacy database images still read; no-AWS local setups retain the DB fallback.
  Upload authorization and validation remain in the existing owner routes.
- `hello.ts` now exports `apps/api/src/function.ts`, which adapts the existing
  Fastify routes to the deployed Function while preserving its slug/URL. It
  requires a server-only origin secret except for `/health`; Next server reads,
  owner proxy and media proxy send it. Owner routes still verify owner tokens.
- The existing Account placeholder now uses customer Neon Auth via the
  same-origin `app/api/auth/[...path]` SDK handler, protected `api/account` route,
  and `features/storefront/components/account-dialog.tsx`. Owner login remains
  independent; customer sessions cannot grant owner access. Email/password,
  loading/errors and optional email-code verification use existing design styles.
- Owner Overview/Order requests use a sealed Realtime summary query and
  `features/admin/use-live-orders.ts`; renewals verify owner access, changes
  refresh only the current owner view, and cleanup closes subscriptions.
  Storefront catalog caching and checkout behavior remain unchanged.
- `scripts/sync-neon-env.mjs` privately maps Neon exports into package env
  files, preserves owner credentials and generates missing local app secrets.
  Root scripts add `build`, `neon:sync-env`, `neon:deploy`; npm's workspace
  package-manager check now warns so requested `npm run build` can run pnpm.
  `render.yaml`, env examples and `DEPLOYMENT.md` document free hosting and the
  additional server-only variables. No Render services were created here.
- Deployed API Function and Realtime origin policy to the existing Neon
  production branch. Live `test:neon` passes database/production shop reads,
  private image upload/read plus legacy-image compatibility, owner API access,
  customer signup/signin/signout/session restoration and owner isolation, and
  an actual committed-order Realtime event. Test fixtures are removed; explicit
  WebSocket/storage-client cleanup fixed the first test runner's shutdown hang.
- Final `npm run build`, web lint, 20 existing regressions, live gallery test,
  catalog-cache HTTP regression, and diff whitespace checks passed. Final
  deployed-service E2E rerun exits 0 with one test passing and none failing;
  fixtures and temporary server are cleaned up. Git ignores all real env files.
  Synced local web `API_URL` to the verified hosted Function; restart Next to
  pick up environment changes. `DEPLOYMENT.md` includes the current one-free-
  Render-frontend path and the retained two-service Render Blueprint option.
  Real mailbox email delivery/code verification and live Render URL checks
  remain manual. Production Auth also needs SMTP/domain configuration.

## Selected free frontend deployment

- Created root `FEATURES.md` describing the new customer account, image storage,
  live owner orders, API hosting, environment commands and verification limits.
- User chose the most efficient free layout: one free Render Next.js frontend
  in Ohio, close to the existing Neon API/services. Root `render.yaml` now
  provisions only that frontend, with server-only API/Auth values and a
  generated customer-cookie secret. This supersedes the earlier two-service
  Render option; the working Neon API remains the single backend host.
- Added `apps/web/app/api/health/route.ts` for database-independent Render health
  checks. Automatic deployments are disabled to conserve free build minutes;
  source updates can be deployed manually. No keep-alive requests or paid
  resources are configured. The completed public deployment is recorded below.
- Created `deploy/neon-render-frontend`; frontend lint, production build (with
  `/api/health`) and whitespace checks pass. Source is published on that branch;
  local secrets and Codex configuration are excluded from publication.

## Public Render frontend deployed and verified

- Live URL: `https://carbignite-web-dev.onrender.com`. Official Render CLI
  confirms service `srv-dbkra3qjnfac739oho00` is on the Free plan in Ohio, with
  automatic deploys off. The existing Neon Function remains the backend; no
  duplicate Render API, paid instance or Render database was created.
- Pushed source branch `deploy/neon-render-frontend`. Current deployed app code
  is commit `995da6bd1b6fc3d3d769035de18fe6d66516f698`; deployment
  `dep-dbkrg9fb9u1s7388cpfg` reports `live`. Render build/TypeScript succeeded.
  The service was created by CLI using `render.yaml` settings, not as a managed
  Blueprint; future code deployments are manual. Main remains unchanged.
- Registered the actual Render origin for Neon Auth and Realtime while
  preserving localhost. API `.env` privately records `APP_ORIGIN`; frontend
  receives only API/Auth settings, with a separate generated cookie secret.
- First public test exposed owner POST requests rejected behind Render's HTTPS
  proxy. Added `apps/web/lib/same-origin.ts` and five security regressions:
  owner proxy uses trusted `APP_ORIGIN`/`RENDER_EXTERNAL_URL`, never untrusted
  forwarded headers, and still rejects foreign/missing origins. Local 25-test
  regression suite, lint, production build and cache HTTP regression pass.
- `apps/api/tests/neon.e2e.test.ts` now optionally targets a public frontend
  using `NEON_E2E_WEB_URL`, which must match configured `APP_ORIGIN`. Complete
  public Render HTTP suite exits 0: health/shop, private and legacy images,
  owner proxy, customer signup/signin/signout/session restoration, customer/
  owner isolation, and an order event using the Render WebSocket origin all
  pass. Temporary customer/order/image fixtures were removed; service remains
  running. No existing customer or product records were deleted.
- `FEATURES.md` documents the new features and verification; `DEPLOYMENT.md`
  records the chosen layout, live URL and manual updates. Real mailbox delivery
  and email-code verification remain manual; production SMTP is not configured.
