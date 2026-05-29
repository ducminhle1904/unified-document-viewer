import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import Database from "better-sqlite3";
import { createApp } from "../../src/app.js";

const tempDirs: string[] = [];

afterEach(() => {
  for (const dir of tempDirs.splice(0)) {
    rmSync(dir, { recursive: true, force: true });
  }
});

async function startE2eServer() {
  const tempDir = mkdtempSync(join(tmpdir(), "keyloop-e2e-"));
  tempDirs.push(tempDir);
  const databaseUrl = join(tempDir, "audit.sqlite");
  const app = await createApp({
    config: {
      PORT: 0,
      DATABASE_URL: databaseUrl,
      UPSTREAM_TIMEOUT_MS: 50
    }
  });

  await app.listen({ port: 0, host: "127.0.0.1" });
  const address = app.server.address();
  if (!address || typeof address === "string") {
    throw new Error("Expected server to listen on a TCP address.");
  }

  return {
    app,
    baseUrl: `http://127.0.0.1:${address.port}`,
    databaseUrl
  };
}

describe("documents HTTP E2E", () => {
  it("serves health and document search flows over real HTTP with SQLite audit persistence", async () => {
    const { app, baseUrl, databaseUrl } = await startE2eServer();

    try {
      const health = await fetch(`${baseUrl}/health`);
      expect(health.status).toBe(200);
      expect(await health.json()).toEqual({ status: "ok" });

      const complete = await fetch(`${baseUrl}/api/vehicles/1HGCM82633A004352/documents`);
      expect(complete.status).toBe(200);
      expect(await complete.json()).toMatchObject({
        status: "complete",
        vin: "1HGCM82633A004352"
      });

      const empty = await fetch(`${baseUrl}/api/vehicles/2HGCM82633A004353/documents`);
      expect(empty.status).toBe(200);
      expect(await empty.json()).toMatchObject({
        status: "complete",
        documents: []
      });

      const partial = await fetch(`${baseUrl}/api/vehicles/1HGCM82633A00435S/documents`);
      expect(partial.status).toBe(200);
      expect(await partial.json()).toMatchObject({
        status: "partial",
        warnings: [
          {
            source: "SALES_SYSTEM",
            code: "UPSTREAM_ERROR"
          }
        ]
      });

      const failed = await fetch(`${baseUrl}/api/vehicles/1HGCM82633A00435X/documents`);
      expect(failed.status).toBe(502);
      expect(await failed.json()).toMatchObject({
        status: "failed",
        documents: []
      });
    } finally {
      await app.close();
    }

    const db = new Database(databaseUrl, { readonly: true });
    const auditSummary = db
      .prepare("SELECT status, COUNT(*) as count FROM search_audits GROUP BY status ORDER BY status")
      .all() as Array<{ status: string; count: number }>;
    db.close();

    expect(auditSummary).toEqual([
      { status: "complete", count: 2 },
      { status: "failed", count: 1 },
      { status: "partial", count: 1 }
    ]);
  });
});
