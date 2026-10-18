# hono-api — open risks

What is not yet proven or not yet decided. The full write-up of every risk,
including the accepted and resolved ones, is
`specs/epics/hono-api/risks-and-open-questions.md`; this page lists only what
is still live, so it should be short.

| ID | Risk | State | What closes it |
|---|---|---|---|
| HA-F | No live bootstrap yet: the repository created and linked, the deploy token minted, a real `wrangler deploy`, the smoke and the probes against workers.dev are all unproven | OPEN | One bootstrap from a tag against a workspace |
| HA-G | `orun plan --changed` plans nothing for a push with no `before`; the first landing relies on merging into orun's seeded initial commit | WATCH | Confirmed by the first live bootstrap |

Accepted, and worth knowing before you change them: HA-C (wrangler's
multi-environment warning on the local build), HA-H (a custom domain is the
owner's step), HA-J (stack-tectonic 0.19.0), HA-K (`/` does not carry the
API's name).
