# hono-api

Vercel's [Hono framework boilerplate](https://github.com/vercel/examples/tree/main/framework-boilerplates/hono)
— one `Hono` app, one route, a welcome text — running natively as a
**Cloudflare Worker** (Hono's `fetch` handler is the Worker's; no adapter, no
framework build), inside the repository conventions of the
[Cirrus baseline](https://github.com/sourceplane/cirrus-baseline): an
[Orun](https://github.com/sourceplane/orun) intent, one component per
deployable, a credential-free check lane as the merge gate, and an Orun lane
that turns on once the product is linked to a workspace.

The template's code is the code. What the port adds is the Worker's config,
the monorepo wrapper, a test package, and the deploy contract. See
[`specs/epics/hono-api`](specs/epics/hono-api/README.md) for the design, the
milestones and the as-built status.

## What is here

| Surface | Where |
|---|---|
| The API — `GET /` answers the welcome text | `apps/api/src/index.ts` |
| Worker config (name, compatibility, per-environment vars) | `apps/api/wrangler.jsonc` |
| Deploy contract | `apps/api/component.yaml` (`cloudflare-worker-turbo`) |
| Tests | `tests/api` (vitest, drives the app in-process with `app.request()`) |

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build            # wrangler deploy --dry-run → apps/api/dist (the bundle, no upload)
```

Run the Worker locally under workerd and call it:

```bash
pnpm --filter @app/api dev        # http://localhost:8787
curl http://localhost:8787/       # Hello Hono! …
```

Add a route with `app.get(...)` (or `post`, `route`, middleware) in
`apps/api/src/index.ts`; `wrangler dev` reloads on save.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Hono detected by Vercel's framework builder and run as a serverless function | A Cloudflare Worker: `export default app` is the module handler (`fetch` is `app.fetch`); wrangler bundles `src/index.ts` |
| `vc dev` · `vc build` · `vc deploy` | `wrangler dev` · `wrangler deploy --dry-run --outdir dist` · `wrangler deploy --env <stage\|prod>` |
| Deploy on push | Orun deploys `hono-api-api-{stage,prod}` on merge to `main` (`apps/api/component.yaml`) |

## Deploying

`.github/workflows/checks.yml` runs install, typecheck, lint, test and build on
every push and pull request. `ci.yml` is the Orun deployment pipeline: set
`execution.state.workspace` in `intent.yaml` to this product's Orun workspace
(`orun cloud link`), connect a Cloudflare account to that workspace, and set
the `ORUN_CI` repository variable to `true`. From then on a merge to `main`
deploys the Worker to `stage`, then `prod`.
