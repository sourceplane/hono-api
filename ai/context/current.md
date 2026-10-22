# hono-api — where this repository stands

The entry page for anyone (or any agent) picking this repository up. It is
this repository's own state and does not ship to an API built from it; the two
pages that do are [operations.md](operations.md) and
[deployment.md](deployment.md).

## What it is

Vercel's Hono boilerplate as one Cloudflare Worker, packaged as an Orun
baseline: `orun new --blueprint repo-blueprint.yaml` builds a new API in its
own repository and takes it to live on stage and prod in one landing
(`01-product`), then records what went live (`02-docs`).

## Release

| | |
|---|---|
| Latest tag | `baseline-v3` (HA5 — the domain is set later: the console asks for no domain, and an API is born with the placeholder `<reponame>.example.com` for an owner to replace) |
| Before it | `baseline-v2` (HA4 — the cirrus standard: no kiox, generated component docs, this context pack, and the workers.dev subdomain read from the Cloudflare connection instead of asked); `baseline-v1` (HA3 — the baseline) |
| Proven live | No. Everything short of the platform is proven offline in Baseline CI; a live bootstrap from a tag is still to come (risk HA-F) |

## Where to read

| Question | Page |
|---|---|
| What shipped, and every departure from upstream | `specs/epics/hono-api/IMPLEMENTATION-STATUS.md` |
| Why it is built this way | [decisions.md](decisions.md), then `specs/epics/hono-api/design.md` |
| What could still go wrong | [open-risks.md](open-risks.md), then `specs/epics/hono-api/risks-and-open-questions.md` |
| How to instantiate it | `BOOTSTRAP.md`, `docs/phases/` |
| What each component is | `apps/api/docs/`, `tests/api/docs/` (generated; `python3 tooling/catalog/gen-component-docs.py`) |

## Next

1. Bootstrap one API from `baseline-v3` against a workspace, and record its
   timings (closes HA-F).
