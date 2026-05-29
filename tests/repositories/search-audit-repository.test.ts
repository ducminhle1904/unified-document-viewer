import { describe, expect, it } from "vitest";
import { openDatabase } from "../../src/db/sqlite.js";
import { SearchAuditRepository } from "../../src/repositories/search-audit-repository.js";
import type { AuditRecordInput } from "../../src/types/documents.js";

function createRecord(overrides: Partial<AuditRecordInput> = {}): AuditRecordInput {
  return {
    requestId: crypto.randomUUID(),
    vin: "1HGCM82633A004352",
    status: "complete",
    resultCount: 2,
    warningCount: 0,
    latencyMs: 25,
    upstream: [
      {
        source: "SALES_SYSTEM",
        status: "success",
        latencyMs: 10,
        documentCount: 1
      },
      {
        source: "SERVICE_SYSTEM",
        status: "success",
        latencyMs: 15,
        documentCount: 1
      }
    ],
    ...overrides
  };
}

describe("SearchAuditRepository", () => {
  it("initializes the SQLite audit schema", () => {
    const db = openDatabase(":memory:");

    const row = db
      .prepare("SELECT name FROM sqlite_master WHERE type = 'table' AND name = 'search_audits'")
      .get() as { name: string } | undefined;

    expect(row?.name).toBe("search_audits");
    db.close();
  });

  it("stores complete audit fields and upstream JSON", () => {
    const db = openDatabase(":memory:");
    const repository = new SearchAuditRepository(db);
    const record = createRecord({
      requestId: "request-1",
      status: "partial",
      resultCount: 1,
      warningCount: 1,
      upstream: [
        {
          source: "SALES_SYSTEM",
          status: "failed",
          latencyMs: 10,
          documentCount: 0,
          errorCode: "UPSTREAM_ERROR"
        },
        {
          source: "SERVICE_SYSTEM",
          status: "success",
          latencyMs: 15,
          documentCount: 1
        }
      ]
    });

    repository.create(record);

    const row = db.prepare("SELECT * FROM search_audits WHERE request_id = ?").get("request-1") as {
      request_id: string;
      vin: string;
      status: string;
      result_count: number;
      warning_count: number;
      latency_ms: number;
      upstream_json: string;
    };

    expect(row).toMatchObject({
      request_id: "request-1",
      vin: "1HGCM82633A004352",
      status: "partial",
      result_count: 1,
      warning_count: 1,
      latency_ms: 25
    });
    expect(JSON.parse(row.upstream_json)).toEqual(record.upstream);
    db.close();
  });

  it("increments count across multiple audit inserts", () => {
    const db = openDatabase(":memory:");
    const repository = new SearchAuditRepository(db);

    repository.create(createRecord({ requestId: "request-1" }));
    repository.create(createRecord({ requestId: "request-2", status: "failed" }));

    expect(repository.count()).toBe(2);
    db.close();
  });
});
