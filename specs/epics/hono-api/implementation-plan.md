# hono-api — implementation plan

Milestones land in order; each task is one pull request on an
`orun/HA-n-<slug>` branch with an `Orun-Task: HA-n` trailer.

## HA0 — the spec ✅

This doc set, `epic.yaml` and the task contracts, merged to `main`.

**Done when**
- the five documents and `epic.yaml` are on `main`
- `tasks/HA-1.TaskContract.yaml`, `HA-2`, `HA-3` exist (HA-4 joined with HA3)

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

## HA3 — a baseline (HA-4) ✅

`blueprint.yaml`, `repo-blueprint.yaml`, `.baseline/` (identity, task
contracts, the API's README), `tooling/rebrand`, `tooling/bootstrap`,
`hooks/render-deployment-docs.sh`, `ai/context/`, `docs/phases/`,
`BOOTSTRAP.md`, `testing/`, `baseline.yml` and `tag.yml`; in the API, the
`API_NAME` seam and `GET /health`, and a smoke that reads it (design §6).

**Done when**
- orun at the bootstrap floor (v2.58.11), at the lane pin (v2.78.4) and the
  current CLI (2.79.0) reads `repo-blueprint.yaml`, and
  `testing/manifest.test.sh` holds the card to it
- `Baseline CI` is green: the contract tests, the leak gate, the offline
  bootstrap (`testing/placement.test.sh`) and the end-to-end tier
  (`testing/e2e.test.sh`)
- the status file records what is proven offline and what only a live
  bootstrap can prove

## HA4 — the cirrus standard (HA-5) ✅

Bring the baseline to cirrus-baseline's standard, with nothing about the API
itself changing.

- **No kiox.** `kiox.yaml`/`kiox.lock` pinned an orun (v2.15.0) that nothing
  ran: every workflow installs orun itself through `orun-action` with its own
  `version:`. The files, their two modules and the rebrand's skip entry go.
- **Component docs.** `tooling/catalog/gen-component-docs.py` writes each
  component's `docs/overview.md`, `docs/architecture.md` and `docs/runbook.md`
  from what the component declares, as cirrus-baseline's do; the pages ship
  with the component. Baseline CI runs it with `--check`.
- **The context pack.** `ai/context/current.md`, `decisions.md` and
  `open-risks.md` beside the two pages an API ships with — this repository's
  own, so no module places them.
- **Status that agrees with the tags.** HA3 is shipped and tagged.

**Done when**
- `git grep -i kiox` finds only this milestone's own record, and the leak gate and the offline
  bootstrap pass without the two modules
- the docs check is green in Baseline CI
- this file, the status file and `epic.yaml` agree

## After HA3 (outside this repository)

1. Cut `baseline-v1` with `tag.yml` from the merged `main`.
2. Register the row in orun-cloud's `infra/baselines-registry/baselines.yaml`
   (unlisted) with the card vendored at the tag.
3. Bootstrap one API from the tag against a workspace; record its timings;
   then flip the row to public with a page on orunbase.com.

## Sequencing note

HA1 needs nothing but HA0's contracts. HA2 is documentation over HA1's
verified build and can land the same day. HA3 packages HA1's API as a
baseline. Deploying to a Cloudflare account is not a milestone here: it is the
Orun lane (`ci.yml`), which runs once `intent.yaml` names a workspace — a
bootstrap writes the product's.
