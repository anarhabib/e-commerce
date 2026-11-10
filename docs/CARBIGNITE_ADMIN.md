# CARBIGNITE workshop admin

## Shared part types

Part types are shared across Interior and Exterior. In Add/Edit product, choose an existing Part type, or select “+ Add a new part type” and enter a new name. Saving creates the type and product together. Existing names (ignoring case and repeated spaces) are rejected; select the existing dropdown entry instead. Duplicate creation from simultaneous saves is also blocked. There is no separate Part types section.

Implemented on `feat/carbignite-admin`. The local panel is at http://localhost:3000/admin and requires a server-verified owner session. Visitors without a valid session are redirected to http://localhost:3000/admin/login. The existing storefront is at `/` and `/shop`.

## First local setup

1. Start this project's PostgreSQL with `docker compose up -d`. Its configured local port is 5433.
2. From the repository root, run `pnpm --filter @carbignite/api exec prisma generate` and then `pnpm --filter @carbignite/api exec prisma migrate deploy`. The first command updates Prisma's generated TypeScript database client; the second applies unapplied migration files to the database in `apps/api/.env`. The admin migration has already been applied to this session's local database. Stop the API before regenerating on Windows if its Prisma DLL is locked.
3. Run `pnpm.cmd --filter @carbignite/api admin:setup` in an interactive terminal. It asks for your owner email and a password of at least 12 characters without displaying the password. It saves the email, password hash and random session secret directly into the ignored `apps/api/.env`, preserving database settings. Setup refuses to replace existing owner credentials. The hash lets the server check a password without storing the password itself. There is no default owner password. For deliberate credential rotation, `admin:credentials` still prints replacement configuration for you to apply manually.
4. Ensure the ignored `apps/web/.env.local` contains `API_URL=http://localhost:4000`. This is a server configuration value, not a public browser credential.
5. Run `pnpm dev` at the root to start both applications. If servers are already running, restart the API after changing its environment. On PowerShell machines that block `.ps1` launchers, use `pnpm.cmd` instead of `pnpm`.
6. Open http://localhost:3000/admin/login and sign in with the email and password you chose. The hash is configuration, not the password to enter in the form. Local setup instructions are intentionally absent from the public website.

## What changed

The reference is the handoff at `C:/Users/USER/Desktop/CARBIGNITE_PROJECT_HANDOFF/CARBIGNITE_HANDOFF/site-source/public/`. Its `admin.html`, `commerce.css`, `commerce.js`, `style.css` and `interactions.css` guided the React implementation. The shared StorefrontShell still provides DM Sans, header, footer, theme storage and dialog behavior. `features/admin/commerce.css` preserves the reference commerce rules within an admin-only scope so those rules do not affect other routes. `admin.css` handles the extra fields needed by the existing Prisma model. The product editor scrolls at short viewport heights so its additional fields remain usable.

`apps/web/features/admin/` contains the dashboard, product form, request intake form, request detail dialog, types and browser API helper. The panel uses actual database counts and paginated lists. Searches include name, SKU, make and model. Product forms retain the existing SKU, slug, description, image crop, demo flag, patterns, finishes and nullable vehicle/year fields. Blank optional fitment fields clear stored values. Available patterns and finishes share one base price, as in the existing data model; option surcharges were not added.

## How forms reach the database

When you save a product, React collects the form fields and sends JSON to `/api/admin/products` in Next.js. Next reads the private session cookie and forwards the request to Fastify's `/admin/products` with a signed bearer token. Fastify verifies owner authorization before running the route, validates fields with Zod, and uses Prisma to save PostgreSQL data. Only a successful API response closes the form. Errors stay visible inside the editor.

The browser sends the price as decimal text, such as `125.49`. Fastify converts this to `12549` integer cents; this avoids decimal rounding errors. Product prices, stock and year ranges are validated on the server even when someone bypasses the form. The older `/products` write routes retain their integer-cent contract and now also require owner authorization.

## Backend routes

| Fastify route | Purpose |
| --- | --- |
| POST `/auth/admin/login` | Checks configured owner credentials and returns a signed session. Limited to 10 login attempts per minute per server process. |
| GET `/admin/session` | Verifies the owner session. |
| GET `/admin/overview` | Counts requests, requests awaiting review and active products, plus four latest requests. |
| GET `/admin/products?search=...&page=1` | Lists all products, including hidden ones, 20 per page. |
| POST `/admin/products` | Creates a validated product; accepts decimal `price` text. |
| PATCH `/admin/products/:id` | Updates product details; accepts decimal `price` text. |
| DELETE `/admin/products/:id` | Owner-only permanent catalog deletion; returns 204 with no body. Saved request item snapshots and shared image uploads are retained. |
| GET `/admin/orders?status=requested&page=1` | Lists saved requests, 20 per page. |
| GET `/admin/orders/:id` | Reads a request's stored customer and item snapshots. |
| POST `/admin/orders` | Records an owner-entered customer inquiry with server pricing. |
| PATCH `/admin/orders/:id` | Updates the request status. |

Every `/admin/*` route checks authorization inside Fastify, including direct HTTP calls. Existing POST/PATCH/DELETE `/products` routes also check authorization. Public GET product endpoints remain available; hidden products disappear from lists, facets and individual product reads. The browser talks through equivalent `/api/admin/*` routes in Next rather than storing a bearer token in JavaScript.

There was no authentication implementation to reuse in this checkout. Owner identity is therefore a single server-configured account, not a new customer account system. Sessions last eight hours, use an HttpOnly SameSite Strict cookie, and use Secure cookies in production. Mutating browser requests must have the same Origin as the Next application. Production must serve HTTPS. Sign out clears the browser cookie. Changing `ADMIN_SESSION_SECRET` revokes all existing sessions immediately; rotate it when changing owner credentials. Already copied bearer tokens remain valid until expiration unless the secret changes. For multiple API processes, use a shared rate limiter before deployment; the current login budget is process-local.

## Database changes and request meaning

Migration `apps/api/prisma/migrations/20261103140000_admin_requests/migration.sql` only adds:

- `Product.active`, defaulting to true, so existing products remain visible.
- `RequestStatus` with `requested`, `in_review`, `quoted`, `in_production`, `shipped` and `cancelled`.
- `OrderRequest`, with a UUID supplied by the intake form, customer/item JSON snapshots, integer total, status and timestamps; an index supports status/date queries.

No existing tables or records are removed. Product/customer names, fitment, options and prices are copied into a request snapshot so later product edits do not rewrite historical inquiries. Request creation ignores no client-provided prices: unexpected price/total fields are rejected, and totals are recalculated from current catalog records. Quantities are checked across all lines for each product. The same UUID can be retried without creating a duplicate request.

There were no orders or checkout API in the original app. The panel's **New request** action records phone/email inquiries: look up an exact active SKU, choose options and quantity, and enter customer details. The UI records one product line per inquiry; the protected backend supports multiple lines. This is owner intake, not a public checkout. Existing storefront bag behavior is preserved. Customer account/checkout integration remains future work.

Requests do not take payment, reserve or decrement inventory, send email, or calculate shipping/taxes. Status updates are owner-selected workflow labels, not proof of payment or stock reservation. There is no paid status. Confirm fitment, final quote and delivery separately.

## Manual testing

1. Before signing in, confirm `/admin` asks for owner credentials. A direct GET to `http://localhost:4000/admin/overview` should return 401.
2. Sign in and compare the desktop/mobile sidebar, cards, table and dialogs to the reference. Switch the existing header theme toggle and check both themes, focus visibility, Escape, dialog focus restoration and scrolling.
3. Under Products, create a clearly labeled test product with a unique SKU/slug, a price such as 125.49, stock 4, Forged/Matte options and a vehicle year range. Search by SKU, edit the price/stock/options, reload and confirm persistence.
4. Clear optional vehicle fields and save. Try an inverted year range and confirm the server returns validation feedback. Duplicate SKUs/slugs should show a conflict message.
5. Turn off Visible in storefront and save. Confirm it remains in the admin list and disappears from both public catalogs. A previously open storefront tab may need a refresh to retrieve the updated catalog.
6. Restore visibility. Under Order requests, choose New request, enter that exact SKU, choose the permitted options, quantity 2 and test customer details. Save, open the request and verify its estimated subtotal. Change its status, reload, then filter by that status. The stored total should stay unchanged after a later product price edit.
7. Sign out. Confirm API-backed admin data can no longer load. Stop the API and retry a load to check the unavailable/retry state. Use a fresh database or unmatched search/status to check empty states.
8. Hide your manual test product and mark the test request cancelled when finished. Those manual records persist until deliberately removed; automated tests clean up their own records.

## Automated checks

- `pnpm test`: existing reveal, bag, scroll-lock and product-schema regression tests.
- `pnpm --filter @carbignite/api test:integration`: existing real-database catalog test, updated to authenticate writes.
- `pnpm --filter @carbignite/api test:admin`: real-database authorization, visibility, pricing, request persistence/retry, option/quantity and status tests. Test-only credentials exist only in the test process; temporary records are removed afterward.
- `pnpm --filter @carbignite/api exec node --env-file=.env --import tsx --test tests/admin-web.integration.test.ts`: checks the real Next proxy with Next dev running on 3000 and the API port 4000 free. It temporarily starts a test API on 4000, tests HttpOnly cookies, same-origin enforcement and public routes, then stops it. Do not run this while your normal API is listening on 4000.
- `pnpm --filter @carbignite/api build`, `pnpm --filter @carbignite/web lint` and `pnpm --filter @carbignite/web build`: compile and lint checks.

Verification on 3 November 2026: all 17 existing regression tests, the catalog database test, the admin database test and the Next proxy HTTP test passed. API compilation, web lint and the production web build passed. Prisma reports all four migrations applied. Temporary database test records were removed. The local Next/API development servers were restored on ports 3000/4000; owner credentials still require configuration.

Browser visual verification is still required; HTTP checks do not establish pixel parity. No production migration, merge or deployment is included. The implementation is being submitted on `feat/carbignite-admin` for review.

Readability follow-up: admin body labels, badges, table descriptions and mobile copy now use at least 14px text, with 16px form controls. Mobile metrics stack and editor fields use one column on narrow screens. The sign-in screen is separate from the protected admin panel; setup instructions remain in developer documentation only.

The server checks the root-scoped `carbignite-owner-session` cookie by calling Fastify's protected session endpoint before rendering `/admin`. Cookie presence alone never grants access. The cookie remains HttpOnly, SameSite Strict and Secure in production. Older API-scoped sessions require signing in again. Both the page and API enforce access; sign-out returns to `/admin/login`. HTTP tests verify absent, forged and expired sessions are redirected while a valid owner session renders the panel.

## Product gallery

The product editor now shows image previews. Select several JPEG, PNG or WebP files under **Upload photos**, or add existing image URLs individually. Products support up to 12 images, with a 5 MB limit per uploaded file. **Make cover** moves an image to the first position; **Remove** removes it from this product's gallery. Click **Save product** to persist those changes. Changing the cover resets the old concept-sheet crop; the crop selector is still available for the original demo image sheet. No gallery images are required.

The storefront product dialog displays the cover and a row of thumbnail controls for switching between images. Admin table thumbnails now have an explicit display size. Checkbox dimensions and margins are reset so the checkbox and its label align horizontally.

Migration `20261103150000_product_gallery` adds `Product.imageUrls` and a `MediaAsset` table. It copies existing cover URLs into the gallery without removing previous data. `imageUrl` remains the first gallery image for older catalog components and clients. Updating either contract keeps the two fields synchronized. The migration has been applied locally; there are now five migrations.

Uploads go through the same signed-in Next admin proxy to Fastify's POST `/admin/images`. Fastify checks owner authorization, size and JPEG/PNG/WebP file signatures, then stores the image bytes in PostgreSQL. It returns a `/media/:id` URL that the form adds to the gallery. Next's public `/media/[id]` route forwards image reads to Fastify so the browser can load images from the frontend origin. Database backups now also contain uploaded image bytes. External image URLs must remain available at their original host.

Removing an image from a product does not delete a potentially shared upload from storage. Uploads are saved immediately; gallery membership/order is saved with the product. Cancelling the editor can therefore leave an unattached upload. A media-library cleanup tool and image resizing are future improvements; no shared image files are deleted automatically.

Verification: `pnpm test`, catalog/admin database integration, and the new `pnpm --filter @carbignite/api test:gallery` passed. The real Next proxy HTTP test also uploads an image and verifies public image bytes through the frontend. Tests cover unauthorized upload denial, unsupported content, gallery ordering/removal persistence, invalid URLs and duplicate images, and clean up their records. API/web builds and lint passed. Manual browser checks: open a product, check checkbox baselines, upload two photos, make the second the cover, save, reload and inspect its storefront dialog; remove an image, save, and reload to confirm it stays removed. Visual browser verification remains manual.

## Shared dropdowns

All dropdowns now use `components/ui/dropdown.tsx` and its shared stylesheet: storefront vehicle filtering and product options, catalog vehicle selection, and admin forms/status filtering. Menus follow the existing light/dark colors. Borders remain neutral on selection; the arrow rotates on opening. Keyboard focus uses a quiet text underline instead of an orange outline. Arrow keys, Home/End, typing to find an option, Enter/Space, Escape, Tab and outside-click dismissal are supported; reduced-motion preferences remove the arrow animation.

A hidden native select preserves form submission and the existing change handlers, so backend contracts are unchanged. Menus can open above controls when space is limited in a dialog. Manual browser checks should include keyboard navigation, selected values surviving saves, vehicle make/model/year dependency resets, and the absence of orange outlines/native blue menus in both themes.

## Notifications

Save and status confirmations now appear as compact cards at the bottom right rather than a banner above the admin content. They share the website's light/dark theme, thin borders, orange accent and DM Sans. Notifications disappear after five seconds, pause while hovered or keyboard-focused, and have an explicit dismiss button. Switching admin sections clears them. The shared provider also handles existing storefront notifications, with a maximum of three cards and repeat-message replacement. Form errors stay next to the form so they can be corrected.

Motion follows the restrained guidance in the user-linked design-motion-principles repository: a short 240ms arrival, quicker 160ms exit, small movement, and no transition for reduced-motion users. Manual checks: save twice, check that notifications auto-dismiss, pause/resume on hover and focus, close via keyboard, switch tabs, and verify mobile/light/dark/reduced-motion presentation.

## Delete and duplicate products

Each product row now includes **Edit**, **Duplicate** and **Delete**. Delete opens a confirmation naming the product and SKU. Confirming permanently removes that product from the catalog; it does not remove existing order-request item snapshots or shared image uploads. Cancel leaves the product untouched. To temporarily remove a product from the storefront, edit it and turn off Visible in storefront instead.

Duplicate opens a prefilled editor and saves nothing until you choose Save product. The copy has a new SKU/slug, a name ending in “(copy)”, zero stock and hidden visibility. Review those values and set real stock/visibility before publishing it. Description, pricing, compatibility, options and gallery are copied; image uploads are shared, not uploaded again. Saving uses the normal validated POST endpoint, so the original record is not modified.

The frontend sends Delete through the same owner-session and same-origin checks as other admin mutations. Fastify independently checks authorization. A successful deletion returns HTTP 204, meaning there is no JSON body to parse. Database and real Next HTTP tests cover authorization, deletion, preserved request snapshots, duplicate creation and proper empty-response forwarding. No schema migration is needed for either action.
# Creating a part type while editing a product

In Products → Add/Edit, choose Interior or Exterior, then select an existing
Part type or “+ Add a new part type.” Enter its name and save the product.
Saving creates the type automatically in that collection and makes it available
in future product dropdowns. Matching names reuse the existing type regardless
of case or extra spaces. Cancelling, or a failed product save, creates no type.
Shop filters show type names from active products. There is no separate Part
types management section.
