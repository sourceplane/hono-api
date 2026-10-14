# hono-api — implementation plan

Milestones land in order; each task is one pull request on an
`orun/HA-n-<slug>` branch with an `Orun-Task: HA-n` trailer.

## HA0 — the spec ✅

This doc set, `epic.yaml` and the task contracts, merged to `main`.

**Done when**
- the five documents and `epic.yaml` are on `main`
- `tasks/HA-1.TaskContract.yaml`, `HA-2`, `HA-3` exist

## HA1 — the API on Workers ✅

`apps/api` is the upstream `src/index.ts` with the Worker config around it;
`tests/api` drives the app in-process with `app.request()`.

**Done when**
- `pnpm install && pnpm typecheck && pnpm lint && pnpm test && pnpm build` is green locally and in `Checks`
- `apps/api/dist/index.js` exists after the build (the wrangler dry-run bundle)
- `wrangler dev` (via `pnpm --filter @app/api dev`) answers `/` with `Hello Hono!` and an unknown path with 404
- `wrangler deploy --dry-run --env prod` (what the Orun verify lane runs) resolves `ENVIRONMENT=prod`

## HA2 — ready to instantiate ✅

The README explains the port and how to run, test, preview and deploy it;
`IMPLEMENTATION-STATUS.md` records what shipped and every departure.

**Done when**
- the README's quick start works from a fresh clone
- the status file names the PRs and the welcome-line departure

## Sequencing note

HA1 needs nothing but HA0's contracts. HA2 is documentation over HA1's
verified build and can land the same day. Deploying to a Cloudflare account
is not a milestone here: it is the Orun lane (`ci.yml`) that turns on when
`intent.yaml`'s workspace is set and the `ORUN_CI` variable is `true`.
