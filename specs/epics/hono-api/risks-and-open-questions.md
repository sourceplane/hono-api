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
