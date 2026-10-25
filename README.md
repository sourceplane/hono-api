# hono-api

Vercel's [Hono framework boilerplate](https://github.com/vercel/examples/tree/main/framework-boilerplates/hono)
— one `Hono` app, a welcome route — running natively as a **Cloudflare
Worker** (Hono's `fetch` handler is the Worker's; no adapter, no framework
build), and packaged as an **Orun baseline**: one command takes a new API
from nothing to live on stage and prod, in its own repository, under its own
name, in ONE landing.

The template's code is the code. What the port adds is the Worker's config,
the monorepo wrapper, a test package, the deploy contract and a `/health`
route the deploy smoke-tests. What the baseline adds is everything needed to
make a copy of it somebody else's — built the way
[cirrus-baseline](https://github.com/sourceplane/cirrus-baseline) builds its
product since baseline-v22: one landing, one convergence. See
[`specs/epics/hono-api`](specs/epics/hono-api/README.md) for the design, the
milestones and the as-built status.

## Instantiating an API

```bash
git clone --depth 1 --branch <baseline-tag> https://github.com/sourceplane/hono-api
cd hono-api
orun new --blueprint repo-blueprint.yaml --out ~/apis/acme-api --run-hooks --resume \
  --set reponame=acme-api --set productname="Acme API" \
  --set githuborg=acme-inc --set subdomain=<workers-dev-subdomain>
```

Or, once the platform's registry lists it, from the Orun console (Baselines →
`hono-api` → Build). Two phases — `01-product` (the repository, its CI and
the whole API in one pull request, deployed to stage and prod by one
convergence, smoke-tested) and `02-docs` (the live deployment recorded) —
each landing one pull request in the new repository.
**[BOOTSTRAP.md](BOOTSTRAP.md)** is the operator guide;
[docs/phases/](docs/phases/README.md) has a page per phase.

The new repository receives the **API only** — the Worker, its tests, its CI,
its tooling, a README of its own and its operating contract — renamed
throughout to the API's name, repository and Cloudflare Worker. None of this
repository's machinery ships, and nothing that ships names it.

| What makes it a baseline | Where |
|---|---|
| The console card (inputs, secrets, programme) | `blueprint.yaml` |
| The build document (modules, phases, hooks) | `repo-blueprint.yaml` |
| This tree's identity, and the bootstrap's task contracts | `.baseline/` |
| The rename engine | `tooling/rebrand/rebrand.mjs` |
| The bootstrap's helpers (deferrals, redeploy marker, work-tree strip) | `tooling/bootstrap/` |
| The deployment-record renderer | `hooks/render-deployment-docs.sh` |
| The API's README and context pack | `.baseline/product/README.md`, `ai/context/` |
| The baseline's tests: contract, leak, offline bootstrap, end to end | `testing/`, `.github/workflows/baseline.yml` |
| Cutting a `baseline-vN` tag | `.github/workflows/tag.yml` |

## What is here (the API)

| Surface | Where |
|---|---|
| The API — `GET /` answers the welcome text, `GET /health` the API's name and environment | `apps/api/src/index.ts` |
| The API's name (the rename's seam) | `apps/api/src/identity.ts` |
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
curl http://localhost:8787/health # {"status":"ok","name":"Hono API","environment":"local"}
```

Add a route with `app.get(...)` (or `post`, `route`, middleware) in
`apps/api/src/index.ts`; `wrangler dev` reloads on save.

## How it maps to Vercel

| Vercel | Here |
|---|---|
| Hono detected by Vercel's framework builder and run as a serverless function | A Cloudflare Worker: `export default app` is the module handler (`fetch` is `app.fetch`); wrangler bundles `src/index.ts` |
| `vc dev` · `vc build` · `vc deploy` | `wrangler dev` · `wrangler deploy --dry-run --outdir dist` · `wrangler deploy --env <stage\|prod>` |
| Deploy on push | Orun deploys `<repo>-api-{stage,prod}` on merge to `main` and smoke-tests `/health` (`apps/api/component.yaml`) |
| "Deploy with Vercel" (clone the template) | `orun new --blueprint repo-blueprint.yaml` — a new repository, branded, deployed |

## CI

| Workflow | What it runs | Ships to an API |
|---|---|---|
| `ci.yml` | the Orun pipeline, and the only workflow an API carries: `orun plan --changed`, then one job per lane. A pull request runs the verify lanes (the Worker built, type-checked and dry-deployed per environment; the tests' `quick-check` lane installs and checks the package, it does not run them), except the bootstrap's own landings (`orun/BASE-*`), where `plan` alone is the check; a merge deploys stage → prod. It plans nothing while `intent.yaml` names the placeholder workspace `ws_CHANGE_ME`, as this repository does | yes |
| `baseline.yml` | the baseline's own tiers: contract tests, the blueprint read by the pinned orun, the leak gate, the offline bootstrap, the API built, dry-deployed and served | no |
| `tag.yml` | cuts a `baseline-vN` tag (manual) | no |
