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

describe("GET /health — what the deploy's smoke and the bootstrap's probe read", () => {
  it("names the API and the environment the Worker runs as", async () => {
    const { default: app } = await import("@/index");
    const { API_NAME } = await import("@/identity");
    // The third argument is the Worker's env: what wrangler's
    // `env.stage.vars` hands the deployed Worker.
    const res = await app.request("/health", {}, { ENVIRONMENT: "stage" });
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toMatch(/^application\/json/);
    expect(await res.json()).toEqual({ status: "ok", name: API_NAME, environment: "stage" });
  });

  it("still answers when the Worker has no ENVIRONMENT var", async () => {
    const { default: app } = await import("@/index");
    const res = await app.request("/health");
    expect(res.status).toBe(200);
    expect(await res.json()).toMatchObject({ status: "ok", environment: "unknown" });
  });
});

describe("the API's identity (apps/api/src/identity.ts)", () => {
  it("names the API", async () => {
    const { API_NAME } = await import("@/identity");
    expect(API_NAME.trim()).not.toBe("");
  });
});
