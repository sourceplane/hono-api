# Epic: hono-api (HA)

**Vercel's Hono boilerplate is the smallest framework template in its catalog — one `Hono` app, one route, a two-line welcome text — and Hono was written for the Workers runtime before it ran anywhere else. On Cloudflare the port is the file itself: `src/index.ts` exports the app, wrangler bundles it, and the Worker's `fetch` is Hono's. Around it is the Cirrus baseline's repository shape: an Orun intent, one component per deployable, a credential-free check lane as the merge gate, and an Orun lane that turns on when the product is linked to a workspace.**

The upstream code stays the code. The port adds the Worker's config (`wrangler.jsonc` with per-environment sections, the way the baseline's workers deploy), the monorepo wrapper (pnpm + Turborepo, shared tsconfig and eslint), a test package that drives the app in-process with `app.request()`, and the deploy contract. The one textual change is the second welcome line, which pointed at Vercel's Hono docs and now points at Hono's Cloudflare Workers guide.

## Status

| Field | Value |
|-------|-------|
| Status | 🟡 HA0–HA2 shipped (#1, #2, #3); HA3 — a baseline — in this PR (HA-4), not yet proven by a live bootstrap |
| Cluster | **HA** (HA0–HA3) |
| Owner(s) | `apps/api` (the Worker) · `tests/api` (the in-process request tests) |
| Builds on | `cirrus-baseline` conventions (intent, components, `checks.yml` gate, gated `ci.yml`) and the `cloudflare-worker-turbo` composition its workers deploy with — no bounded context of the fleet is needed |
| Upstream | [vercel/examples `framework-boilerplates/hono`](https://github.com/vercel/examples/tree/main/framework-boilerplates/hono) |
| Changes | Adds the Worker config, the monorepo wrapper, tests and the deploy contract; the template's app code is untouched but for the welcome line's link |
| Decisions locked | (1) A plain Worker (`cloudflare-worker-turbo`), not Pages Functions and not an adapter: Hono's default export is already a Workers module handler. (2) `wrangler.jsonc` is committed, not rendered: the Worker binds nothing, so there is nothing to wire. (3) Per-environment deploys through wrangler `env` sections (`--env stage` / `--env prod`), naming `hono-api-api-{stage,prod}`. (4) No infra root. |
| Gate | HA1 is the first user-visible rung (the API serves from a Worker). |
| Shipped as | `main` after [#3](https://github.com/sourceplane/hono-api/pull/3); verified locally under `wrangler dev` and the `--env prod` dry run, deploy gated until a workspace is linked |

## Read order

1. `design.md` — what maps to what, the build, what is out of scope
2. `implementation-plan.md` — the milestones and what "done" means for each
3. `risks-and-open-questions.md` — what could go wrong and what was decided
4. `IMPLEMENTATION-STATUS.md` — what actually shipped (kept distinct from intent)

## Milestones at a glance

| Milestone | What it lands | Done when |
|---|---|---|
| HA0 — the spec | this doc set and the task contracts | merged on `main` |
| HA1 — the API on Workers | `apps/api` bundled by wrangler, `tests/api`, green checks | `wrangler dev` answers `/` with the welcome text; Checks green |
| HA2 — ready to instantiate | README, as-built status | a reader can run, test, preview and deploy it |
| HA3 — a baseline | card, build document, rename, bootstrap tooling, tests | a new API goes from nothing to live in one landing; Baseline CI green |
