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

Routes beyond `/`, bindings (KV, D1, R2 — the `*-starter` ports carry the
wiring-template shape for those), a custom domain (the baseline's
`cloudflare-domain` root), and Hono's JSX/SSR (`hono/jsx` stays configured in
`tsconfig`, as upstream had it, and is unused).
