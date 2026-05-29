import { describe, expect, it } from "vitest";
import { pino } from "pino";
import type { Logger } from "pino";
import { DocumentAggregationService, InvalidVinError, UpstreamUnavailableError } from "../../src/services/document-aggregation-service.js";
import {
  createAuditContext,
  createAuditRepository,
  failedSales,
  failedService,
  salesDocument,
  serviceDocument,
  successfulSales,
  successfulService,
  timeoutSales
} from "../fixtures/test-dependencies.js";

function createService(overrides = {}) {
  return new DocumentAggregationService({
    salesAdapter: successfulSales([salesDocument]),
    serviceAdapter: successfulService([serviceDocument]),
    auditRepository: createAuditRepository(),
    logger: pino({ enabled: false }),
    ...overrides
  });
}

function createMemoryLogger() {
  const records: Array<{ level: "info" | "warn" | "error"; payload: Record<string, unknown>; message: string }> = [];
  const logger = {
    info(payload: Record<string, unknown>, message: string) {
      records.push({ level: "info", payload, message });
    },
    warn(payload: Record<string, unknown>, message: string) {
      records.push({ level: "warn", payload, message });
    },
    error(payload: Record<string, unknown>, message: string) {
      records.push({ level: "error", payload, message });
    }
  } as unknown as Logger;

  return { logger, records };
}

describe("DocumentAggregationService", () => {
  it("returns combined documents with source systems sorted newest first", async () => {
    const service = createService();
    const response = await service.searchByVin("1HGCM82633A004352");

    expect(response.status).toBe("complete");
    expect(response.documents).toHaveLength(2);
    expect(response.documents.map((document) => document.source)).toEqual(["SERVICE_SYSTEM", "SALES_SYSTEM"]);
    expect(response.documents[0].documentDate).toBe("2025-02-01T10:00:00.000Z");
    expect(response.upstream).toEqual([
      {
        source: "SALES_SYSTEM",
        status: "success",
        latencyMs: 1,
        documentCount: 1,
        errorCode: undefined
      },
      {
        source: "SERVICE_SYSTEM",
        status: "success",
        latencyMs: 1,
        documentCount: 1,
        errorCode: undefined
      }
    ]);
  });

  it("deduplicates documents by normalized id", async () => {
    const response = await createService({
      salesAdapter: successfulSales([{ ...salesDocument, duplicateKey: "shared-1" }]),
      serviceAdapter: successfulService([{ ...serviceDocument, duplicateKey: "shared-1" }])
    }).searchByVin("1HGCM82633A004352");

    expect(response.documents).toHaveLength(1);
  });

  it("returns partial results when one upstream fails", async () => {
    const response = await createService({
      salesAdapter: failedSales()
    }).searchByVin("1HGCM82633A004352");

    expect(response.status).toBe("partial");
    expect(response.documents).toHaveLength(1);
    expect(response.warnings[0]).toMatchObject({
      source: "SALES_SYSTEM",
      code: "UPSTREAM_ERROR"
    });
    expect(response.upstream[0]).toMatchObject({
      source: "SALES_SYSTEM",
      status: "failed",
      documentCount: 0,
      errorCode: "UPSTREAM_ERROR"
    });
  });

  it("returns partial results when one upstream times out", async () => {
    const response = await createService({
      salesAdapter: timeoutSales()
    }).searchByVin("1HGCM82633A004352");

    expect(response.status).toBe("partial");
    expect(response.documents).toHaveLength(1);
    expect(response.warnings[0]).toMatchObject({
      source: "SALES_SYSTEM",
      code: "UPSTREAM_TIMEOUT"
    });
    expect(response.upstream[0]).toMatchObject({
      source: "SALES_SYSTEM",
      status: "timeout",
      errorCode: "UPSTREAM_TIMEOUT"
    });
  });

  it("returns complete empty results when both upstreams succeed with no documents", async () => {
    const response = await createService({
      salesAdapter: successfulSales([]),
      serviceAdapter: successfulService([])
    }).searchByVin("2HGCM82633A004353");

    expect(response.status).toBe("complete");
    expect(response.documents).toEqual([]);
    expect(response.warnings).toEqual([]);
    expect(response.upstream.map((item) => item.documentCount)).toEqual([0, 0]);
  });

  it("normalizes VIN input by trimming and uppercasing it", async () => {
    const response = await createService().searchByVin("  1hgcm82633a004352  ");

    expect(response.vin).toBe("1HGCM82633A004352");
  });

  it("throws a controlled error when both upstreams fail", async () => {
    await expect(
      createService({
        salesAdapter: failedSales(),
        serviceAdapter: failedService()
      }).searchByVin("1HGCM82633A004352")
    ).rejects.toBeInstanceOf(UpstreamUnavailableError);
  });

  it("rejects invalid VINs before upstream calls", async () => {
    let salesCalls = 0;
    let serviceCalls = 0;

    await expect(
      createService({
        salesAdapter: {
          async findDocumentsByVin() {
            salesCalls += 1;
            return successfulSales().findDocumentsByVin("1HGCM82633A004352");
          }
        },
        serviceAdapter: {
          async findDocumentsByVin() {
            serviceCalls += 1;
            return successfulService().findDocumentsByVin("1HGCM82633A004352");
          }
        }
      }).searchByVin("bad-vin")
    ).rejects.toBeInstanceOf(InvalidVinError);

    expect(salesCalls).toBe(0);
    expect(serviceCalls).toBe(0);
  });

  it("persists audit records for successful searches", async () => {
    const auditRepository = createAuditRepository();
    await createService({ auditRepository }).searchByVin("1HGCM82633A004352");

    expect(auditRepository.count()).toBe(1);
  });

  it("persists audit records for partial searches", async () => {
    const auditRepository = createAuditRepository();
    await createService({
      auditRepository,
      salesAdapter: failedSales()
    }).searchByVin("1HGCM82633A004352");

    expect(auditRepository.count()).toBe(1);
  });

  it("persists audit records for failed searches before throwing", async () => {
    const { auditRepository } = createAuditContext();

    await expect(
      createService({
        auditRepository,
        salesAdapter: failedSales(),
        serviceAdapter: failedService()
      }).searchByVin("1HGCM82633A004352")
    ).rejects.toBeInstanceOf(UpstreamUnavailableError);

    expect(auditRepository.count()).toBe(1);
  });

  it("logs the document search workflow with traceable event names", async () => {
    const { logger, records } = createMemoryLogger();

    await createService({ logger }).searchByVin("1HGCM82633A004352");

    expect(records.map((record) => record.payload.event)).toEqual([
      "document_search_started",
      "upstream_document_search_completed",
      "upstream_document_search_completed",
      "search_audit_persisted",
      "document_search_completed"
    ]);
    expect(records.every((record) => record.payload.requestId)).toBe(true);
    expect(records.every((record) => record.payload.vin === "1HGCM82633A004352")).toBe(true);
    expect(records.at(-1)).toMatchObject({
      level: "info",
      payload: {
        status: "complete",
        resultCount: 2,
        warningCount: 0
      }
    });
  });
});
