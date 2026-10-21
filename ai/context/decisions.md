# hono-api — decisions

The choices that shape this repository, one line each, with where the full
reasoning lives. Superseded decisions stay listed, marked, so the history
reads in order.

| # | Decision | Why | Source |
|---|---|---|---|
| 1 | A plain Worker (`cloudflare-worker-turbo`), no adapter and no Pages Functions | Hono's default export already is a Workers module handler | `specs/epics/hono-api/design.md` |
| 2 | `wrangler.jsonc` is committed, not rendered | The Worker binds nothing, so there is nothing to wire; the lane's structure check finds it before any build | design.md, `apps/api/component.yaml` |
| 3 | Per-environment deploys through wrangler `env` sections | `hono-api-api-{stage,prod}`, the same shape cirrus-baseline's workers deploy with | design.md |
| 4 | No infra root | Nothing to provision; `infra/` and `packages/` stay as empty discovery roots | `repo-blueprint.yaml` (`discovery-roots`) |
| 5 | `GET /health` and one name seam (`apps/api/src/identity.ts`) | The deploy smoke and the bootstrap's probes read it; the rename rewrites one literal | IMPLEMENTATION-STATUS (HA3) |
| 6 | One landing (`01-product`) then the record (`02-docs`) | A landing has a fixed cost; the plan, not the phases, carries deploy order (cirrus-baseline since baseline-v22) | `repo-blueprint.yaml` |
| 7 | `ci.yml` plans nothing while `intent.yaml` names `ws_CHANGE_ME` | A bootstrap cannot set a repository variable (replaced the `ORUN_CI` gate) | IMPLEMENTATION-STATUS (HA3) |
| 8 | stack-tectonic 0.19.0, not 0.20.0 | The family's one pin: 0.20.0's linked install breaks the Next.js baselines | risk HA-J |
| 9 | orun is pinned only where it runs (the `orun-action` `version:` in each workflow); no kiox | `kiox.yaml` pinned a version nothing ran | IMPLEMENTATION-STATUS (HA4) |
| 10 | Component docs are generated from the manifests and checked in CI | A hand-written copy of the dependency graph and bindings drifts silently | `tooling/catalog/gen-component-docs.py` |
| 11 | `subdomain` is read from the Cloudflare connection (`from: connection.cloudflare.workersSubdomain`), never asked | It belongs to the account like its id and has one right answer; a typed one could only be wrong, and showed up after deploy in the smoke and the probes | `blueprint.yaml`, IMPLEMENTATION-STATUS (HA-6) |
