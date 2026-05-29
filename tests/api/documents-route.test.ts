import { describe, expect, it } from "vitest";
import { createApp } from "../../src/app.js";
import { createTestDatabase } from "../fixtures/test-dependencies.js";

async function createTestApp() {
  return createApp({
    config: {
      PORT: 0,
      DATABASE_URL: ":memory:",
      UPSTREAM_TIMEOUT_MS: 50
    },
    db: createTestDatabase()
  });
}

describe("documents API", () => {
  it("returns health status", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/health"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toEqual({ status: "ok" });

    await app.close();
  });

  it("returns documents for a valid VIN", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/vehicles/1HGCM82633A004352/documents"
    });

    expect(response.statusCode).toBe(200);
    const body = response.json();
    expect(body.requestId).toEqual(expect.any(String));
    expect(body.vin).toBe("1HGCM82633A004352");
    expect(body.status).toBe("complete");
    expect(body.warnings).toEqual([]);
    expect(body.upstream).toHaveLength(2);
    expect(body.upstream.map((item: { source: string; status: string }) => `${item.source}:${item.status}`)).toEqual([
      "SALES_SYSTEM:success",
      "SERVICE_SYSTEM:success"
    ]);
    expect(body.documents).toHaveLength(3);
    expect(body.documents.every((document: { source?: string }) => Boolean(document.source))).toBe(true);

    await app.close();
  });

  it("returns complete empty results", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/vehicles/2HGCM82633A004353/documents"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      vin: "2HGCM82633A004353",
      status: "complete",
      documents: [],
      warnings: []
    });

    await app.close();
  });

  it("returns controlled validation errors", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/vehicles/bad-vin/documents"
    });

    expect(response.statusCode).toBe(400);
    expect(response.json()).toMatchObject({
      code: "INVALID_VIN"
    });

    await app.close();
  });

  it("returns partial results when one upstream fails", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/vehicles/1HGCM82633A00435S/documents"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "partial",
      documents: [
        {
          source: "SERVICE_SYSTEM"
        }
      ],
      warnings: [
        {
          source: "SALES_SYSTEM",
          code: "UPSTREAM_ERROR"
        }
      ]
    });

    await app.close();
  });

  it("returns partial results when the service upstream fails", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/vehicles/1HGCM82633A00435V/documents"
    });

    expect(response.statusCode).toBe(200);
    expect(response.json()).toMatchObject({
      status: "partial",
      documents: [
        {
          source: "SALES_SYSTEM"
        }
      ],
      warnings: [
        {
          source: "SERVICE_SYSTEM",
          code: "UPSTREAM_ERROR"
        }
      ]
    });

    await app.close();
  });

  it("returns a controlled error when both upstreams fail", async () => {
    const app = await createTestApp();

    const response = await app.inject({
      method: "GET",
      url: "/api/vehicles/1HGCM82633A00435X/documents"
    });

    expect(response.statusCode).toBe(502);
    expect(response.json()).toMatchObject({
      code: "UPSTREAM_DOCUMENT_SYSTEMS_UNAVAILABLE",
      status: "failed",
      documents: []
    });
    expect(response.body).not.toContain("stack");

    await app.close();
  });
});
