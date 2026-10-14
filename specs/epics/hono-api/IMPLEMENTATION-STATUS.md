# hono-api (HA) — Implementation status

As-built ≠ intent. This file records what actually shipped, and every place
the code departed from `design.md` or from the upstream template.

| Milestone | State | PR |
|---|---|---|
| HA0 — the spec | | |
| HA1 — the API on Workers | | |
| HA2 — ready to instantiate | | |

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
