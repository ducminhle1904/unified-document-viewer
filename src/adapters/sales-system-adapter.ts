import type { SalesDocument } from "../types/upstream.js";
import type { UpstreamResult } from "../types/documents.js";

export interface SalesSystemAdapter {
  findDocumentsByVin(vin: string): Promise<UpstreamResult<SalesDocument>>;
}

const salesFixtures: Record<string, SalesDocument[]> = {
  "1HGCM82633A004352": [
    {
      dealId: "D-1001",
      documentId: "sales-1001",
      documentType: "SALES_CONTRACT",
      signedAt: "2025-11-03T10:30:00.000Z",
      buyerName: "Alex Morgan",
      fileName: "Vehicle sales contract"
    },
    {
      dealId: "D-1001",
      documentId: "shared-warranty-1",
      documentType: "WARRANTY",
      signedAt: "2025-11-03T10:35:00.000Z",
      buyerName: "Alex Morgan",
      fileName: "Warranty registration",
      duplicateKey: "warranty-registration-1"
    }
  ],
  "2HGCM82633A004353": [],
  "5YJSA1E26HF000337": [
    {
      dealId: "D-2002",
      documentId: "sales-2002",
      documentType: "FINANCE_AGREEMENT",
      signedAt: "2025-08-12T14:00:00.000Z",
      buyerName: "Taylor Kim",
      fileName: "Finance agreement"
    }
  ],
  "1HGCM82633A00435V": [
    {
      dealId: "D-3003",
      documentId: "sales-3003",
      documentType: "SALES_CONTRACT",
      signedAt: "2025-05-01T12:00:00.000Z",
      buyerName: "Jordan Lee",
      fileName: "Sales contract"
    }
  ]
};

const salesFailureVins = new Set(["1HGCM82633A00435S", "1HGCM82633A00435X"]);
const salesTimeoutVins = new Set(["1HGCM82633A00435T"]);

export function createSalesSystemAdapter(timeoutMs: number): SalesSystemAdapter {
  return {
    async findDocumentsByVin(vin: string): Promise<UpstreamResult<SalesDocument>> {
      const start = Date.now();
      await new Promise((resolve) => setTimeout(resolve, 15));

      if (salesFailureVins.has(vin)) {
        return failed("SALES_SYSTEM", start, "UPSTREAM_ERROR", "Sales System API failed");
      }

      if (salesTimeoutVins.has(vin)) {
        await new Promise((resolve) => setTimeout(resolve, timeoutMs + 10));
        return failed("SALES_SYSTEM", start, "UPSTREAM_TIMEOUT", "Sales System API timed out", "timeout");
      }

      return {
        source: "SALES_SYSTEM",
        status: "success",
        latencyMs: Date.now() - start,
        documents: salesFixtures[vin] ?? []
      };
    }
  };
}

function failed(
  source: "SALES_SYSTEM",
  start: number,
  errorCode: string,
  errorMessage: string,
  status: "failed" | "timeout" = "failed"
): UpstreamResult<SalesDocument> {
  return {
    source,
    status,
    latencyMs: Date.now() - start,
    documents: [],
    errorCode,
    errorMessage
  };
}
