# CARBIGNITE: features added with Neon

This file describes the Neon integration added to the existing storefront.
The backend and frontend are deployed. Public app:
https://carbignite-web-dev.onrender.com
The selected hosting layout is one free Render frontend in Ohio, with the
existing API, database and managed services on Neon. `render.yaml` creates only
that frontend. Its `/api/health` check avoids backend/database requests, and
code deployments are manual to conserve build minutes.

## Customer accounts

The header's **Account** button now opens a working customer account dialog.
Customers can create an account with their name, email and password, sign in,
restore their session after a reload, and sign out. Unverified customers can
request an email verification code and enter it in the dialog.

Neon Auth manages customer identities. Requests go through the frontend's own
`/api/auth` routes, so browser authentication does not depend on cross-site
cookies. A customer session does not grant access to the owner panel.

Files: `apps/web/features/storefront/components/account-dialog.tsx`,
`apps/web/lib/customer-auth.ts`, `apps/web/lib/customer-auth-client.ts`,
`apps/web/app/api/auth/[...path]/route.ts`, `apps/web/app/api/account/route.ts`.

## Persistent product image storage

Authenticated owner uploads now store new images in Neon's private `assets`
bucket. PostgreSQL keeps the image's object key, and the existing image route
serves it to product cards and dialogs. Storage credentials stay on the backend.
JPEG, PNG and WebP validation and the 5 MB image limit still apply.

Existing images stored as database bytes remain readable. A local environment
without storage credentials can still use the database image-storage fallback.
The image migration preserves existing rows and image bytes.

Files: `apps/api/src/lib/object-storage.ts`,
`apps/api/src/modules/admin/media.ts`,
`apps/api/prisma/migrations/20261103160000_object_storage/migration.sql`,
`apps/web/app/media/[id]/route.ts`.

## Live owner order updates

The owner's Overview and Order requests views now receive live updates when
orders change. A small summary query detects changes, then the owner panel
reloads its current authorized view. It does not repeatedly download the
catalog or customer details to look for changes.

Only an authenticated owner can obtain or renew the short-lived query
capability. Switching away from those views or leaving the panel closes its
subscription. Connection status appears in the owner sidebar.

Files: `apps/api/src/modules/admin/realtime.ts`,
`apps/web/features/admin/use-live-orders.ts`,
`apps/web/features/admin/admin-panel.tsx`.

## Deployed API and PostgreSQL connection

The existing Fastify API now also runs in the deployed Neon Function. The
Function keeps its original `hello` slug and URL, but serves CARBIGNITE's real
catalog, image and owner routes. The Next server authenticates itself with a
server-only secret; owner operations also require the existing owner session.

Prisma still manages the PostgreSQL schema and queries. It now uses a small,
reusable node-postgres connection pool and a JavaScript client engine, allowing
the same API to run locally, on Render, and in Neon Functions without native
Prisma engine files. `/health` checks the API process without querying the DB.

Files: `hello.ts`, `neon.ts`, `apps/api/src/function.ts`,
`apps/api/src/lib/prisma.ts`, `apps/api/src/app.ts`.

## Environment setup and deployment commands

- `pnpm.cmd neon:sync-env` copies the relevant Neon values into each app's
  ignored environment file. It preserves owner settings, maps the direct
  database URL for Prisma and creates missing local application secrets.
- `pnpm.cmd neon:sync-env --hosted-api` also points the frontend at the deployed
  Neon API. Restart the frontend after changing its environment.
- `pnpm.cmd neon:deploy` updates Neon using the API's server-side environment.
- `npm.cmd run build` generates Prisma's client and builds the API and frontend.
- `pnpm.cmd --filter @carbignite/api test:neon` starts a temporary production
  frontend, tests the five live services and removes its test fixtures.

Files: `scripts/sync-neon-env.mjs`, `package.json`, `DEPLOYMENT.md`.

## Verified and remaining work

Verified: production build, lint, 25 regressions, gallery and catalog
cache tests, and live HTTP tests for database reads, private image upload/read,
legacy images, owner access, customer signup/signin/signout/session restoration,
customer/owner isolation, deployed API routes and a real Realtime order event.
Temporary test accounts, orders and images were removed. Public browser
artifacts were checked for configured server secrets; none were found.

The live HTTP suite also passes against the actual Render frontend. Its origin
is registered for customer Auth and Realtime. A Render reverse-proxy origin
mismatch was fixed while retaining owner-write protection against foreign
origins; five security regressions cover this behavior.

Remaining: real-mailbox email delivery/code verification and production SMTP
configuration before a commercial launch. See `DEPLOYMENT.md` for hosting,
manual code updates and verification commands.
# Demo checkout

The bag links to `/checkout` for a demonstration of the order summary and
contact/delivery form. Completing it creates no real order, takes no payment,
sends no email, and keeps the bag. Form details are not saved or submitted.
All site modals, including mobile filters, use the shared Dialog component,
with a bottom Close control on mobile and a top-right X on desktop.

