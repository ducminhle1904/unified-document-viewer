import type { UpstreamResult } from "../types/documents.js";
import type { ServiceDocument } from "../types/upstream.js";

export interface ServiceSystemAdapter {
  findDocumentsByVin(vin: string): Promise<UpstreamResult<ServiceDocument>>;
}

const serviceFixtures: Record<string, ServiceDocument[]> = {
  "1HGCM82633A004352": [
    {
      repairOrderNumber: "RO-7001",
      attachmentId: "service-7001",
      category: "SERVICE_INVOICE",
      createdAt: "2026-01-15T09:10:00.000Z",
      customer: { displayName: "Alex Morgan" },
      description: "12 month service invoice"
    },
    {
      repairOrderNumber: "RO-7002",
      attachmentId: "shared-warranty-2",
      category: "WARRANTY",
      createdAt: "2025-11-03T10:35:00.000Z",
      customer: { displayName: "Alex Morgan" },
      description: "Warranty registration",
      duplicateKey: "warranty-registration-1"
    }
  ],
  "2HGCM82633A004353": [],
  "5YJSA1E26HF000337": [
    {
      repairOrderNumber: "RO-8001",
      attachmentId: "service-8001",
      category: "INSPECTION_REPORT",
      createdAt: "2025-09-01T08:00:00.000Z",
      customer: { displayName: "Taylor Kim" },
      description: "Pre-delivery inspection"
    }
  ],
  "1HGCM82633A00435S": [
    {
      repairOrderNumber: "RO-9001",
      attachmentId: "service-9001",
      category: "SERVICE_INVOICE",
      createdAt: "2025-06-01T09:00:00.000Z",
      customer: { displayName: "Jordan Lee" },
      description: "Service invoice"
    }
  ]
};

const serviceFailureVins = new Set(["1HGCM82633A00435V", "1HGCM82633A00435X"]);
const serviceTimeoutVins = new Set(["1HGCM82633A00435W"]);

export function createServiceSystemAdapter(timeoutMs: number): ServiceSystemAdapter {
  return {
    async findDocumentsByVin(vin: string): Promise<UpstreamResult<ServiceDocument>> {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 20));

      if (serviceFailureVins.has(vin)) {
        return failed("SERVICE_SYSTEM", start, "UPSTREAM_ERROR", "Service System API failed");
      }

      if (serviceTimeoutVins.has(vin)) {
        await new Promise((resolve) => setTimeout(resolve, timeoutMs + 10));
        return failed("SERVICE_SYSTEM", start, "UPSTREAM_TIMEOUT", "Service System API timed out", "timeout");
      }

      return {
        source: "SERVICE_SYSTEM",
        status: "success",
        latencyMs: Date.now() - start,
        documents: serviceFixtures[vin] ?? []
      };
    }
  };
}

function failed(
  source: "SERVICE_SYSTEM",
  start: number,
  errorCode: string,
  errorMessage: string,
  status: "failed" | "timeout" = "failed"
): UpstreamResult<ServiceDocument> {
  return {
    source,
    status,
    latencyMs: Date.now() - start,
    documents: [],
    errorCode,
    errorMessage
  };
}
