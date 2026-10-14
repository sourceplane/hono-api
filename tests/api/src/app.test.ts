import { describe, expect, it } from "vitest";

// Hono's app.request() drives the router in-process — no server, no
// workerd — so this is the template's behaviour, independent of the runtime.
describe("the Hono app (apps/api/src/index.ts)", () => {
  it("answers / with the welcome text", async () => {
    const { default: app } = await import("@/index");
    const res = await app.request("/");
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^text\/plain/);
    const body = await res.text();
    expect(body.startsWith("Hello Hono!")).toBe(true);
    expect(body).toContain("https://hono.dev/docs/getting-started/cloudflare-workers");
  });

  it("answers an unknown path with 404", async () => {
    const { default: app } = await import("@/index");
    const res = await app.request("/nope");
    expect(res.status).toBe(404);
  });
});
