# hono-api — risks and open questions

## HA-A — Hono version drift (RISK, mitigated)

The upstream template asks for `hono ^4.8.9`. The port pins `^4.13.0`
(4.13.13 verified) so a `pnpm install` reproduces the verified bundle; a
major bump is a deliberate PR that re-runs the tests and the dev smoke.
Hono's Workers support is first-party, so the runtime itself is not a drift
surface.

## HA-B — The welcome text names Vercel (RESOLVED)

The second welcome line reads "To learn more about Hono on Vercel, visit
https://vercel.com/docs/frameworks/hono". It now points at
https://hono.dev/docs/getting-started/cloudflare-workers. This is the only
change to the app code; the test asserts the first line (`Hello Hono!`) and
the new link.

## HA-C — wrangler's multi-environment warning on the local build (ACCEPTED)

`wrangler.jsonc` carries `env.dev`, `env.stage` and `env.prod` because the
`cloudflare-worker-turbo` composition deploys with `--env`. A bare
`wrangler deploy --dry-run` (the `build` script) therefore warns that no
target environment was given and bundles the top level (`ENVIRONMENT=local`).
That is the intended local behaviour; Orun's lanes always pass `--env`.

## HA-D — `@cloudflare/workers-types` major (RESOLVED)

wrangler 4.151 declares `@cloudflare/workers-types ^5.2026` as its peer; the
baseline's workers still carry 4.x. The port takes the 5.x line the peer range
asks for, which clears the install warning and typechecks the same.

## HA-E — Upstream's Node tsconfig (RESOLVED)

Upstream compiles with `module: NodeNext` and `types: ["node"]`, for Vercel's
Node builder. On a Worker the shared `tooling/tsconfig/worker.json` replaces
it (bundler resolution, `WebWorker` lib, `@cloudflare/workers-types`); the
`hono/jsx` JSX settings are kept so a later route can render JSX as upstream
intended. `@types/node` is dropped from the app package.

## HA-F — No live bootstrap yet (OPEN)

Everything short of the platform is proven on every pull request: the card
against the build, the blueprint read by the pinned orun, the leak gate, the
offline bootstrap with the blueprint's own hooks, the API's own plan for the
01-product merge, and the produced API built, dry-deployed, served and
smoke-tested in the job tree orun stages. What is NOT proven is the
platform's half — the repository created and linked, the Cloudflare token
minted by `integrations/reconcile`, a real `wrangler deploy`, the smoke and
the probes against workers.dev. Hence the registry row is `unlisted` until
one bootstrap from the tag has come up.

## HA-G — The first landing's push must have a `before` (WATCH)

01-product is the repository's FIRST landing and its convergence deploys.
`orun plan --changed` on a push diffs `before..after`; for a push whose
`before` is all zeros (a branch created by the push) orun resolves the base to
`main` itself and plans nothing — checked locally with orun 2.79.0. The
landing merges a pull request into orun's `Initial commit` (an empty
repository is seeded with one), so the merge's push has a `before` and plans
`api` on stage and prod — what `testing/placement.test.sh` plans, through
ci.yml's own `--from-ci github --event-file` path. If a landing ever pushed
the product straight onto an unborn `main`, the convergence would be green
and empty and the probe would 404; a re-run of the phase (its retouch marker)
re-plans the API.

## HA-H — A custom domain is the owner's step (ACCEPTED)

Attaching a domain to a Worker needs zone-level permissions. The platform
brokers `workers-deploy` (Workers Scripts, KV, account read — no DNS) and
`dns-edit` only with zone ids, which a build does not have. The API's README
says how to attach one; the workers.dev URL keeps answering, and the deploy's
smoke keeps reading it (or the custom domain, when the environment sets
`DEPLOYED_URL` under its `env:` in `intent.yaml`).

## HA-I — The Worker composition exports no deployed URL (RESOLVED)

`cloudflare-workers-assets-turbo` hands its smoke `${DEPLOYED_URL}`;
`cloudflare-worker-turbo` (0.19.0) hands it nothing but the step environment.
The smoke builds `https://<repo>-api-${ORUN_ENVIRONMENT}.<subdomain>.workers.dev`
itself — the runner sets `ORUN_ENVIRONMENT` for every step (checked with a
local `orun run` of the stage job) and the rename rewrites the Worker name and
the subdomain — and `${DEPLOYED_URL}` overrides it, which is how the
end-to-end tier runs the same command against `wrangler dev`.

## HA-J — stack-tectonic 0.19.0, not cirrus's 0.20.0 (ACCEPTED)

0.20.0's lane-scoped install links each job's `node_modules` out of its staged
tree, which Next 16's Turbopack refuses; the Next.js baselines pin 0.19.0 for
it. This Worker builds with esbuild and would survive the link, but it keeps
the family's one pin: under 0.19.0 each job installs in its own tree, and the
API has one job per lane, so the shared install saves nothing. The end-to-end
tier stages the job with whichever install scope the pinned composition plans,
so a bump is tested rather than assumed.

## HA-K — `/` does not carry the API's name (ACCEPTED)

The template's root answers two lines of text, and they stay verbatim. The API
names itself in its JSON `/health` (`API_NAME`), which is what the deploy's
smoke and the bootstrap's probe read; an owner who wants the name on `/`
writes their own root route.
