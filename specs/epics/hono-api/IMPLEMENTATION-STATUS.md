# hono-api (HA) — Implementation status

As-built ≠ intent. This file records what actually shipped, and every place
the code departed from `design.md` or from the upstream template.

| Milestone | State | PR |
|---|---|---|
| HA0 — the spec | ✅ Shipped | [#1](https://github.com/sourceplane/hono-api/pull/1) |
| HA1 — the API on Workers | ✅ Shipped | [#2](https://github.com/sourceplane/hono-api/pull/2) |
| HA2 — ready to instantiate | ✅ Shipped | [#3](https://github.com/sourceplane/hono-api/pull/3) |

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

## Verified

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
