# hono-api — design

## 1. What the template is

A Hono application in one file. `src/index.ts` creates `new Hono()`,
registers `app.get('/')` returning two lines of text (`Hello Hono!` and a
pointer to the framework docs), and `export default app`. The upstream
`package.json` depends on `hono` and Node typings; its `tsconfig` is
`NodeNext` with `hono/jsx` as the JSX source. On Vercel the repository is
detected as a Hono app and the default export is run as a serverless
function by Vercel's Hono builder. No data source, no auth, no other route.

## 2. The mapping (Vercel → Cloudflare)

| Vercel primitive the template uses | Here |
|---|---|
| Framework detection + the Hono builder (a serverless function) | A Cloudflare Worker: `export default app` is a module Worker (`fetch` is `app.fetch`); wrangler bundles `src/index.ts` with esbuild. No adapter — Hono targets the Workers runtime natively |
| `vc dev` on `:3000` | `wrangler dev` (the Worker under workerd on `:8787`), `pnpm --filter @app/api dev` |
| `vc build` | `wrangler deploy --dry-run --outdir dist`: the bundle, no upload |
| `vc deploy` | Orun: `apps/api/component.yaml` (`cloudflare-worker-turbo`) runs `wrangler deploy --env prod` (and `--env stage`) on merge to `main` once the product is linked; the Worker is `hono-api-api-{stage,prod}` |
| Node typings (`@types/node`, `module: NodeNext`) | `@cloudflare/workers-types` through the shared `tooling/tsconfig/worker.json` (bundler resolution, `WebWorker` lib); `nodejs_compat` is on for the Node built-ins a later route may need |
| The welcome line's link to Vercel's Hono docs | Hono's Cloudflare Workers guide — the only change to the app code |

Alternative rejected: Cloudflare Pages Functions through `hono/cloudflare-pages`.
It would also serve this app, but Pages is a second deploy surface with its
own `functions/` convention and no `--env` story, and the Cirrus fleet
deploys every worker with `cloudflare-worker-turbo`; the point of the port is
a shape every later API template can copy.

## 3. The repository

```
apps/api               the template (src/index.ts) + the Worker config
  component.yaml       Orun component: build with turbo, dry-run/deploy with wrangler --env
  wrangler.jsonc       worker name, compatibility date, nodejs_compat, observability, env.{dev,stage,prod} vars
tests/api              vitest: app.request("/") in-process — no server, no workerd
tooling/*              shared tsconfig / eslint / wrangler wiring renderer (unused here: nothing to wire)
intent.yaml            environments dev (verify) · stage · prod; `work:` points at specs/epics and tasks
.github/workflows      checks.yml (merge gate) · ci.yml (Orun lanes, gated by the ORUN_CI variable)
```

## 4. The build

`pnpm --filter @app/api build` = `wrangler deploy --dry-run --outdir dist`:
esbuild bundles `src/index.ts` and `hono` into `dist/index.js` (58 KiB,
15 KiB gzipped) and exits before upload. Orun's verify profile runs the same
dry run with `--env prod`; the deploy profile drops `--dry-run`. There is no
framework build step and nothing to pre-render.

## 5. Out of scope

Routes beyond `/` and `/health` (§6), bindings (KV, D1, R2 — the
`*-starter` ports carry the wiring-template shape for those), a custom-domain
component (§6: the brokered deploy token carries no zone permissions, so
attaching a domain is the owner's step), and Hono's JSX/SSR (`hono/jsx` stays
configured in `tsconfig`, as upstream had it, and is unused).

## 6. The baseline (HA3)

The repository instantiates new APIs the way
[cirrus-baseline](https://github.com/sourceplane/cirrus-baseline) instantiates
its product since baseline-v22: a console card (`blueprint.yaml`) the platform
renders, a build document (`repo-blueprint.yaml`) `orun new` runs, and a
rename engine that makes the copy somebody else's. What a small baseline
contains is portfolio-starter-kit's (baseline-v2); how the build runs is
cirrus's — ONE landing.

| portfolio-starter-kit | Here | Why the difference |
|---|---|---|
| three phases: `01-scaffold`, `02-site`, `03-docs` | two: `01-product`, `02-docs` | cirrus-baseline v22: a landing has a fixed cost, and nothing here needs the scaffold merged before the app — the order a deploy needs is the plan's |
| the brokered secrets reconciled in `02-site`'s `pre` | in `01-product`'s `post`, after `repo` and `link`, before `land` | cirrus's 01-product: the credentials are minted once the repository is the workspace's, before the landing whose convergence uses them |
| `cloudflare-workers-assets-turbo` (`DEPLOYED_URL` exported to the smoke) | `cloudflare-worker-turbo`, which exports none | the smoke names its own workers.dev URL from `${ORUN_ENVIRONMENT}`, overridable by `${DEPLOYED_URL}` (a custom domain, a local `wrangler dev`) |
| `SITE_NAME` + `SOURCE_URL` in `apps/web/app/site.ts` | `API_NAME` in `apps/api/src/identity.ts`, answered by `/health` | the API names itself in one place, its JSON health response; it links nowhere |
| `SITE_URL` per environment | none | the API renders no absolute link to itself |
| smoke: the home page's nav and the feed | smoke: `/health` answers `"status":"ok"` for THIS environment | the name is the owner's to change; the environment proves the right Worker answered |
| the leak gate reads the README and the context pages for provenance | it reads EVERY shipped file, for factory paths and provenance | a comment in a shipped workflow or intent pointing at `testing/` or `specs/` points at nothing in a product |

| Cirrus (v22) | Here | Why the difference |
|---|---|---|
| `01-product` → `07-domain` → `08-docs` | `01-product` → `02-docs` | no domain phase; numbered from one, there being no history of phases to keep names for |
| await: convergence, `WIRING_*` secrets, URLs | await: convergence, URLs | no infra component, so nothing lease-publishes wiring |
| `CLOUDFLARE_API_TOKEN`, `CLOUDFLARE_D1_TOKEN`, `CLOUDFLARE_ACCOUNT_ID` | `CLOUDFLARE_API_TOKEN` (`workers-deploy`), `CLOUDFLARE_ACCOUNT_ID` | no D1 |
| task contracts in `tasks/` | `.baseline/tasks/` | `tasks/` is this repository's own work tree (`intent.yaml` `work:`), where an unkeyed contract is an error |
| every wiring reader `dependsOn` its infra, `mode: enforced` on main | `apps/api` declares no `dependsOn` | it reads no wiring; the component says where such an edge goes |

**Identity in the app** is one literal, `API_NAME` in
`apps/api/src/identity.ts`. `GET /health` answers
`{"status":"ok","name":API_NAME,"environment":ENVIRONMENT}`, where
`ENVIRONMENT` is the `env.<name>.vars` value the deploy's `--env` selected.
The rename writes the name with `JSON.stringify`, so any name the card's
pattern admits — apostrophes and ampersands included — stays a valid string,
and `/health` serialises it back. `GET /` stays the template's text, verbatim.

**The Worker's config stays committed.** The composition's
`verify-worker-structure` step runs `test -f package.json` and
`test -f wrangler.jsonc` before any build, in the tree the runner stages,
which has no build output; a generated config would fail it. The Worker binds
nothing, so there is nothing to render; `wire-fixture` and `wire-live` are
no-ops.

**The API's CI is on from its first commit.** `ci.yml` used to wait for an
`ORUN_CI` repository variable, which a bootstrap has no way to set. It now
plans nothing only while `intent.yaml` names the placeholder `ws_CHANGE_ME`,
which this repository carries and no product does. And only `ci.yml` runs on
a push to main (`checks.yml` is pull requests only), because the bootstrap's
convergence watch takes the newest run for the merge commit from any
workflow.

**Testing without the platform.** `testing/lib/bootstrap.sh` places both
phases and runs the blueprint's own `run:` hooks, read out of the document, on
top of orun's empty `Initial commit`; `testing/placement.test.sh` then plans
the product's push-to-main exactly as `ci.yml` does (`--from-ci github
--event-file … --changed`); `testing/e2e.test.sh` runs every step of the stage
lane's pull-request plan in a job tree staged as orun stages it, serves the
Worker with `wrangler dev --env stage`, and runs the component's own smoke
against it.
