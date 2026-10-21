# hono-api (HA) — Implementation status

As-built ≠ intent. This file records what actually shipped, and every place
the code departed from `design.md` or from the upstream template.

| Milestone | State | PR |
|---|---|---|
| HA0 — the spec | ✅ Shipped | [#1](https://github.com/sourceplane/hono-api/pull/1) |
| HA1 — the API on Workers | ✅ Shipped | [#2](https://github.com/sourceplane/hono-api/pull/2) |
| HA2 — ready to instantiate | ✅ Shipped | [#3](https://github.com/sourceplane/hono-api/pull/3) |
| HA3 — a baseline | ✅ Shipped | [#4](https://github.com/sourceplane/hono-api/pull/4) (HA-4), tagged `baseline-v1` |
| HA4 — the cirrus standard | ✅ Shipped | [#5](https://github.com/sourceplane/hono-api/pull/5) (HA-5), [#6](https://github.com/sourceplane/hono-api/pull/6) (HA-6), tagged `baseline-v2` |

## Departures from the upstream template

### The second welcome line

Upstream: "To learn more about Hono on Vercel, visit
https://vercel.com/docs/frameworks/hono". Here: "To learn more about Hono on
Cloudflare Workers, visit https://hono.dev/docs/getting-started/cloudflare-workers".
The first line (`Hello Hono!`) and the route are unchanged.

### The Node tsconfig becomes the Worker tsconfig

Upstream's `tsconfig.json` (`module: NodeNext`, `types: ["node"]`, `outDir`)
is replaced by one that extends `tooling/tsconfig/worker.json` (bundler
resolution, `WebWorker` lib, `@cloudflare/workers-types`, `noEmit`). The
`jsx: react-jsx` / `jsxImportSource: hono/jsx` pair is kept. `@types/node`
is not a dependency of the app.

### `@cloudflare/workers-types` 5.x

The brief's floor was `^4.20250508.0`; wrangler 4.151.0's peer range is
`^5.20261006.1`, so the port takes 5.x to install without a peer warning.

### `GET /health` and `apps/api/src/identity.ts` (HA3)

The template has one route; the port adds a second, `GET /health`, answering
`{"status":"ok","name":API_NAME,"environment":ENVIRONMENT}`. It is what the
deploy's smoke and the bootstrap's probes read, and `API_NAME` is the one
literal the baseline's rename rewrites to a product's name. `GET /` is
unchanged.

## Departures from the port (HA3)

| What | Before | After | Why |
|---|---|---|---|
| `apps/api` smoke | `echo 'No smoke test configured.'` | `/health` answers `"status":"ok"` for `${ORUN_ENVIRONMENT}`, on the Worker's workers.dev URL or `${DEPLOYED_URL}` | the Worker composition exports no deployed URL (risks HA-I); the name is the owner's, the environment proves the right Worker answered |
| `apps/api` parameters | `orgName`, `owner`, `repo` | dropped | read by no step of the composition, and `owner: sourceplane` would have shipped into every product unrenamed |
| `ci.yml` gate | `vars.ORUN_CI == 'true'` | skip only while `intent.yaml` names `ws_CHANGE_ME` | a bootstrap cannot set a repository variable |
| `checks.yml` | push to main and pull requests | pull requests and `workflow_dispatch` | the bootstrap's convergence watch takes the newest run on the merge commit from ANY workflow |
| stack-tectonic | 0.18.2 | 0.19.0 | first-deploy and smoke retries; not 0.20.0 (risks HA-J) |
| orun lane pin | v2.78.0 | v2.78.4 | cirrus-baseline's pin |
| `intent.yaml` | terraform `parameterDefaults`; docs pages under `specs/` | neither; docs pages `ai/context/*` | no terraform component; the pages must exist in a product |
| discovery roots | `apps/`, `tests/` only | `infra/.gitkeep`, `packages/.gitkeep` too | `orun plan` refuses a missing discovery root (`stat infra: no such file or directory`) — `ci.yml` had never planned here |
| `tasks/HA-1..3` | no `metadata` | `metadata.name` and `title` | `orun work check` (2.79) refused them |

## The cirrus standard (HA4)

Nothing about the API changed. What changed is the baseline around it:

| What | Before | After | Why |
|---|---|---|---|
| orun pin | `kiox.yaml` (v2.15.0) + `kiox.lock`, shipped to every API | gone; orun is pinned where it runs, the `orun-action` `version:` in each workflow | nothing ran the kiox pin, and it disagreed with the lanes (v2.78.4) |
| `root-kiox`, `root-kiox-lock` modules | in `01-product` | removed (`testing/phases.test.sh` follows) | an API is placed with 38 + 6 files: no kiox, plus the docs below |
| component docs | none | `apps/api/docs/` and `tests/api/docs/` — `overview.md`, `architecture.md`, `runbook.md` | cirrus-baseline documents every component; the workspace Docs library renders `docs/` beside each `component.yaml` |
| how the docs stay true | — | `tooling/catalog/gen-component-docs.py` derives them from the manifest, the Worker config, Terraform, migrations and package scripts; Baseline CI runs it with `--check` | a hand-written copy of a manifest drifts silently |
| context pack | `operations.md`, `deployment.md` | plus `current.md`, `decisions.md`, `open-risks.md` | cirrus-baseline's shape; the three new pages are this repository's own and no module places them (the leak gate still allows exactly two) |
| status | HA3 "in review" | HA3 shipped and tagged `baseline-v1` | the tag existed; the documents had not caught up |

### The subdomain from the Cloudflare connection (HA-6)

`subdomain` was the one input an operator typed that the platform could
answer itself: it belongs to the Cloudflare account the same way its id does,
and it has exactly one right answer. A typed one could only be wrong, and
wrong showed up after deploy — in the deploy's smoke, the phase probes and the
console's verify URLs. `blueprint.yaml` now declares
`from: connection.cloudflare.workersSubdomain`, as cirrus-baseline does since
baseline-v23: the Cloudflare integration reads the subdomain at connect and on
its hourly health check, and the bootstrap door fills the input from the
connection the build is bound to — the same one `CLOUDFLARE_ACCOUNT_ID` and the
deploy token mint from. The console renders no field for it, and an account
with no workers.dev subdomain is refused at the door with the fix named.

- `testing/manifest.test.sh` takes cirrus-baseline's rule verbatim: the source
  is accepted, and only when `spec.requires.integrations` lists its provider.
- `repo-blueprint.yaml` keeps the input and its default; it, `BOOTSTRAP.md`
  and `docs/phases/README.md` say only a hand-run build passes
  `--set subdomain`.
- Nothing an API carries changes: the rename, the smoke and the probes read
  the value exactly as before.

Verified:

- `testing/{manifest,phases,coverage,rebrand,retouch,bootstrap-defer}.test.sh`
  green; `gen-component-docs.py --check` green (2 components).
- Mutation: with `cloudflare` dropped from `spec.requires.integrations`,
  `manifest.test.sh` fails with exactly one finding, naming
  `inputs[subdomain]`; restored, it passes.
- At v2.58.11 (the blueprint job's pin): `orun new --status` reads the
  document (`01-product` pending, 44 files); `testing/leak.test.sh` 44 files
  derived, every one read; `testing/placement.test.sh` 44 files placed, both
  landings, the API's own plan deploys `api` to stage and prod.
- `orun task check HA-6` complete.

## Verified (HA4)

- `testing/{manifest,phases,coverage,rebrand,retouch,bootstrap-defer}.test.sh`
  green; `gen-component-docs.py --check` green.
- `testing/leak.test.sh`: 44 files derived (40 − 2 kiox + 6 docs pages), every
  one read; ai/context still exactly the two declared pages; the generated
  pages name no factory path.
- `testing/placement.test.sh`: 44 files placed, both landings, branded,
  re-tenanted; the API's own `orun plan` deploys `api` to stage and prod.
- `pnpm install --frozen-lockfile`, `wire:fixture`, `typecheck`, `lint`,
  `test` (5 tests), `build` green.
- `testing/e2e.test.sh` green: the stage lane's planned steps in a staged job
  tree, `wrangler dev --env stage`, the component's own smoke.
- `orun task check HA-5` complete.
- Locally with orun 2.85.0; CI pins v2.58.11 (blueprint) and v2.78.4 (lanes).

## Verified (HA3)

- `orun new --status` reads the blueprint at v2.58.11 (the bootstrap floor),
  v2.78.4 (the lane pin) and 2.79.0: `01-product` pending (40 files),
  `02-docs` hook-only. `orun validate` (in the placed product) and
  `orun work check` clean.
- `testing/{manifest,phases,coverage,rebrand,retouch,bootstrap-defer}.test.sh`
  green.
- `testing/leak.test.sh`: 40 files derived, every one read; nothing of the
  factory ships, and no shipped file names a factory path; no provenance
  prose.
- `testing/placement.test.sh` (offline bootstrap, fixture "Sam's Tools &
  Things" / `acme-inc/acme-hono-api`, a slug that ends in this baseline's):
  orun's Initial commit and two landings; rebrand `--verify` clean; workspace
  re-tenanted, `work:` stripped, promotion and dev lanes restored; deployment
  record rendered; the API's own `orun plan` for the push that merged
  01-product, through ci.yml's `--from-ci github --event-file` path, deploys
  `api` to stage and prod side by side (no infra, so nothing to order before
  it) with the API's structure check, Worker, smoke and secret refs;
  `--resume` changes nothing.
- `testing/e2e.test.sh`: both landings pass the Checks sequence; every run
  step of the stage lane's pull-request plan (install,
  `verify-worker-structure`, `wire-fixture`, build, typecheck,
  `deploy-dry-run`) passes in a job tree staged as orun stages it, with no
  build output in it; `wrangler dev --env stage` serves the Worker; the
  component's own smoke passes verbatim and inside the deploy profile's
  planned `smoke` step, and refuses the stage Worker as prod; `/`, `/health`
  (the product's name, `environment: stage`) and a 404 are the API's own.
- Not verified: a live bootstrap against a workspace (risks HA-F).

## Verified (HA1–HA2)

- Local: `pnpm typecheck`, `pnpm lint`, `pnpm test` (2 tests), `pnpm build`
  (`wrangler deploy --dry-run --outdir dist`, 58 KiB / 15 KiB gzipped) green;
  `wrangler deploy --dry-run --env prod` (the Orun verify lane's command)
  resolves `ENVIRONMENT=prod`; `wrangler dev --port 8791`: `/` 200
  `text/plain` starting `Hello Hono!` with the Cloudflare docs line, `/nope`
  404.
- CI: `Checks` green on #2 (install, wire, typecheck, lint, test, build).
- Not verified: a live deploy. `ci.yml` is gated until the product is linked
  to an Orun workspace with a Cloudflare connection.

## Versions

| Package | Version | Why |
|---|---|---|
| hono | ^4.13.0 (4.13.13) | newest 4.x; upstream asks for `^4.8.9` and 4.13 is the same major |
| wrangler | ^4.151.0 | compatibility_date 2026-10-01; the baseline's pin |
| @cloudflare/workers-types | ^5.20261006.1 | wrangler 4.151.0's peer range (4.x installs with an unmet-peer warning) |
| typescript | ^5.8.3 (5.9.3) | upstream's floor |
| vitest | ^3.2.4 (3.2.7) | the factory's tests-vitest template |
