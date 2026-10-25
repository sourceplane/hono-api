# hono-api

A [Hono](https://hono.dev) API on one **Cloudflare Worker**. Hono's `fetch`
handler is the Worker's — no adapter, no framework build: wrangler bundles
`apps/api/src/index.ts` and Cloudflare runs it. Every merge to `main` deploys
it to stage, then prod.

## Live deployment

<!-- 02-docs:begin -->
Not recorded yet. The bootstrap's last phase writes the live URLs, the
workspace and the secrets the API uses into
[ai/context/deployment.md](ai/context/deployment.md); how the API deploys
and how to operate it is in
[ai/context/operations.md](ai/context/operations.md).
<!-- 02-docs:end -->

## Routes

| Route | Answers |
|---|---|
| `GET /` | the welcome text (`Hello Hono!` and a pointer to Hono's Workers guide) |
| `GET /health` | `{"status":"ok","name":"<API_NAME>","environment":"<env>"}` — what the deploy's smoke and an operator's probe read |
| anything else | `404 Not Found` |

## What is here

| Surface | Where |
|---|---|
| The routes | `apps/api/src/index.ts` |
| The API's name (what `/health` answers with) | `apps/api/src/identity.ts` |
| Worker config (name, compatibility date, per-environment vars) | `apps/api/wrangler.jsonc` |
| Deploy contract | `apps/api/component.yaml` (`cloudflare-worker-turbo`) |
| Tests | `tests/api` (vitest, drives the app in-process with `app.request()`) |

## Getting started

```bash
pnpm install
pnpm typecheck
pnpm lint
pnpm test
pnpm build            # wrangler deploy --dry-run → apps/api/dist (the bundle, no upload)
```

Run the Worker locally under workerd and call it:

```bash
pnpm --filter @app/api dev                 # http://localhost:8787
curl http://localhost:8787/                # Hello Hono! …
curl http://localhost:8787/health          # {"status":"ok",…,"environment":"local"}
```

Add a route with `app.get(...)` (or `post`, `route`, middleware) in
`apps/api/src/index.ts`; `wrangler dev` reloads on save. Keep `/health`: the
deploy's smoke reads it.

## How it deploys

Merges to `main` converge through [Orun](https://github.com/sourceplane/orun):
`.github/workflows/ci.yml` plans the changed components and runs each lane
against the workspace in `intent.yaml`. The API deploys to `stage`, then to
`prod` once stage has converged on the same commit; `dev` only verifies. The
Worker is `hono-api-api-<env>` on your account's workers.dev subdomain, and
every deploy is smoke-tested over HTTP: `/health` must answer `"status":"ok"`
for that environment. A pull request runs the same pipeline's verify lanes:
the Worker built, type-checked and dry-deployed for each environment, with
nothing deployed. They do not lint or run the tests, so run `pnpm typecheck`,
`pnpm lint` and `pnpm test` before you push. (A push to `main` builds,
deploys and smoke-tests.)

The pipeline holds one credential, GitHub's own `GITHUB_TOKEN`. The
Cloudflare token and account id are brokered per run from the workspace's
Cloudflare connection; nothing provider-shaped is stored in the repository
or in GitHub.

## Adding a binding or a secret

The Worker binds nothing today, so `wrangler.jsonc` is committed as it
deploys. To give it a KV namespace, a D1 database or an R2 bucket, add the
resource under `infra/` as its own component and have `apps/api/component.yaml`
depend on it; `tooling/wire/` renders a wrangler template from the ids that
component publishes. A runtime secret (an API key for a service the API
calls) is an Orun secret: `orun secrets set <KEY> --org <ws> --env <env>`,
declared in the component's `optionalSecretEnv` and named in its
`runtimeSecrets`, then pushed to the Worker after each deploy. Until it is
set, the route that needs it should say so rather than fail.

## Custom domain

The API answers on workers.dev from its first deploy. To serve it on your own
domain, add the domain to the Cloudflare account the API deploys into and
attach it to the Worker (dashboard → Workers & Pages → `hono-api-api-prod` →
Settings → Domains & Routes → Add → Custom domain); do the same for stage
with a subdomain if you want one. The workers.dev URL keeps answering, and the
deploy's smoke keeps reading it — unless the environment sets `DEPLOYED_URL`
in `intent.yaml`, which the smoke reads instead:

```yaml
environments:
  prod:
    env:
      DEPLOYED_URL: https://hono-api.example.com
```

The repository names the domain in one place, `BASE_DOMAIN` in `intent.yaml`
(one line per environment), which the API was born with as the reserved
placeholder `hono-api.example.com` — the example above carries it too.
Replace it with your domain in the same change that attaches it.
