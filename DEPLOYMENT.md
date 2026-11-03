# CARBIGNITE development deployment: Render + Neon

## Selected architecture

Public app: https://carbignite-web-dev.onrender.com

The existing Render service is already deployed from branch
`deploy/neon-render-frontend` of `anarhabib/e-commerce`. It was created through
the official Render CLI using the settings in `render.yaml`; it is not a
Blueprint-managed service. Keep this service and use its Settings/Manual Deploy
controls for future updates. The creation steps below are for reproducing the
setup in another account, not for creating a duplicate in this workspace.

| Part                                                   | Host                                |
| ------------------------------------------------------ | ----------------------------------- |
| Next.js frontend and same-origin proxies               | One free Render web service in Ohio |
| Existing Fastify API                                   | Existing Neon Function              |
| PostgreSQL, customer Auth, private images and Realtime | Existing Neon project               |

`render.yaml` creates only the frontend. Ohio is close to the existing Neon
backend region (`aws-us-east-2`). This avoids a duplicate API service consuming
Render instance hours. Product, owner and customer flows use the existing API
contracts and same-origin frontend proxies.

The database migrations and hosted API have already been verified. Keep this
existing Neon project; do not create or reset a replacement database.

## 1. Publish the deployment branch

Push the reviewed code and `render.yaml` to the GitHub branch selected for
deployment. Keep `.env`, `.env.local`, `apps/api/.env` and
`apps/web/.env.local` private; they are ignored by Git. `FEATURES.md` describes
the added features and their implementation files.

## 2. Create the free Render frontend

1. Sign in at https://dashboard.render.com and select **New > Blueprint**.
2. Connect the GitHub repository and choose the branch containing these changes.
   Keep the Blueprint path as root `render.yaml`.
3. Review the single `carbignite-web-dev` service: Node runtime, **Free** plan,
   **Ohio** region. Keep Root Directory blank so pnpm sees the workspace and
   root lockfile. No other service or database should appear.
4. Supply the three unsynced values from your synchronized, private
   `apps/web/.env.local` file:

   | Render variable      | Value source                                                  |
   | -------------------- | ------------------------------------------------------------- |
   | `API_URL`            | Same value in `apps/web/.env.local`, the deployed Neon API    |
   | `API_ORIGIN_SECRET`  | Same value in `apps/web/.env.local` and the deployed Function |
   | `NEON_AUTH_BASE_URL` | Same value in `apps/web/.env.local`                           |

   Render generates `NEON_AUTH_COOKIE_SECRET`. The Blueprint sets
   `NODE_VERSION=22.22.0` and `NODE_ENV=production`. Database, AWS, owner and
   Realtime secrets stay on the Neon backend and are not needed on the frontend.

5. Apply the Blueprint. The first deployment creates the service and builds
   the selected branch. Record its actual `https://...onrender.com` URL.

The build command is:

```text
pnpm install --frozen-lockfile --prod=false --filter @carbignite/web... && pnpm --filter @carbignite/web build
```

It installs the web workspace and its dependencies using the committed lockfile,
then creates Next.js production output. Start command:

```text
pnpm --filter @carbignite/web start
```

It starts Next on Render's assigned port. `/api/health` checks that Next can
respond without making API or database requests. This app needs a Node web
service because its auth, API and media proxies execute on the server.

## 3. Register the deployed frontend origin

After the actual Render URL is available, add it to the ignored
`apps/api/.env` file as `APP_ORIGIN`, for example:

```dotenv
APP_ORIGIN=https://YOUR-FRONTEND.onrender.com
```

From the repository root in PowerShell, preview the origin update:

```powershell
neon.cmd config plan --env apps/api/.env
```

This reads the local Function settings and shows the Realtime origin change.
After reviewing it, apply that change:

```powershell
neon.cmd deploy --update-existing --env apps/api/.env
```

This allows the actual frontend origin to subscribe to authorized live queries.
Owner authentication is still required to obtain or renew each query capability.
Register the same frontend with customer Auth:

```powershell
neon.cmd neon-auth domain add https://YOUR-FRONTEND.onrender.com
```

This allows Auth redirects to that frontend. Replace the example with the
actual URL, including `https://` and no trailing slash. Local development
continues to use the allowed `http://localhost:3000` origin.

## 4. Verify the public app

- `/api/health` returns `{"status":"ok"}`.
- `/shop` displays products from Neon; search, filters, sorting and pagination work.
- Product images load through `/media/...`.
- Account signup, signin, session restoration and signout work on the Render URL.
- `/admin` keeps the existing owner login. Customers cannot access owner tools.
- Owner Overview and Order requests show live connection status and update
  after an order changes.

Real-mailbox email delivery and code verification still need a human test.
Before a production launch, follow the
[Neon Auth production checklist](https://neon.com/docs/auth/production-checklist).

## Free usage and source updates

Render's Free plan sleeps after 15 minutes without inbound traffic; waking can
take about a minute. The workspace shares 750 free instance hours per month.
One frontend consumes fewer shared hours than running a separate Render API.
Storage on Render is temporary; this app's data and uploaded images live on
Neon. There are no keep-alive pings, persistent disks or paid resources here.
See [Render free limits](https://render.com/docs/free).

Automatic code deployments are disabled (`autoDeployTrigger: off`) to conserve
build minutes. After pushing a code update, use **Manual Deploy > Deploy latest
commit** in Render. Product edits through the owner UI do not need a code build;
they invalidate the existing storefront cache. Monitor both providers' free
usage limits in their dashboards.

## Local commands and verification

Run these commands from the repository root:

```powershell
pnpm.cmd neon:sync-env
```

Copies the relevant root Neon exports into each app's ignored env file. It maps
`DATABASE_URL_UNPOOLED` to Prisma's `DIRECT_URL`, preserves owner settings and
creates missing app-server/customer-cookie secrets. Values are never printed.
The root source is `.env` if present, otherwise `.env.local`.

```powershell
pnpm.cmd neon:deploy
```

Deploys the API using server-side settings from `apps/api/.env`. The Function
requires `API_ORIGIN_SECRET` from Next for every route except `/health`; owner
routes additionally verify the existing signed owner token. No secret is sent
to browser JavaScript.

```powershell
pnpm.cmd neon:sync-env --hosted-api
```

Also points local Next at the deployed API. Restart Next after env changes.
Without that flag, the current web `API_URL` is preserved.

```powershell
npm.cmd run build
pnpm.cmd --filter @carbignite/api test:neon
```

The build generates Prisma's JavaScript client and builds API and frontend
through pnpm. npm may warn that the workspace uses pnpm; the warning does not
stop the build. The live test starts production Next on port 4317 and tests
all five Neon services. It creates and removes only temporary test images,
an order and a customer account, then stops its temporary server. It requires
configured owner settings, but never needs your plain owner password.

## Database and upload safety

Prisma remains on PostgreSQL v6 tooling with the node-postgres adapter and a
small reused connection pool. App requests use the pooled URL; migrations use
`DIRECT_URL`. New uploads store private bucket keys in `MediaAsset`; legacy
database image bytes remain readable. With no AWS values, local uploads retain
their database fallback. Both paths survive frontend restarts.

All six migrations are already applied for this linked branch. For future
schema changes use `pnpm.cmd --filter @carbignite/api exec prisma migrate deploy`
to apply only unapplied migration files. Never reset the database.
The historical `20261103120000_carbon_catalog` migration contains
`DELETE FROM "Product"`; first initialization must target a verified empty
database. Do not apply the initial history to existing application data.

## Current verification status

Passed: production builds, web lint, 25 regressions, gallery/cache
checks, and live HTTP tests for Postgres, private storage, hosted API, customer
Auth and a committed-order Realtime event. Test fixtures were removed.
Browser artifacts were scanned for configured server secrets; none were found.
Render reports the frontend deployment as live. The complete service suite
passes against its actual public URL, including owner operations after the
Render proxy-origin correction. Email inbox delivery and code verification
remain manual.

To repeat the public-site checks from this authorized checkout:

```powershell
$env:NEON_E2E_WEB_URL='https://carbignite-web-dev.onrender.com'
pnpm.cmd --filter @carbignite/api test:neon
$env:NEON_E2E_WEB_URL=$null
```

The temporary variable targets the existing public frontend instead of starting
a local one. Its URL must match the API's configured `APP_ORIGIN`. The test
cleans up only its own fixtures and leaves the public service running. Clearing
the variable returns subsequent tests to the local production-server mode.
