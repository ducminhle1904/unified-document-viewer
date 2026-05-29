import { openDatabase } from "../../src/db/sqlite.js";
import { SearchAuditRepository } from "../../src/repositories/search-audit-repository.js";
import type { SalesSystemAdapter } from "../../src/adapters/sales-system-adapter.js";
import type { ServiceSystemAdapter } from "../../src/adapters/service-system-adapter.js";
import type { SalesDocument, ServiceDocument } from "../../src/types/upstream.js";
import type { UpstreamResult } from "../../src/types/documents.js";

export function createTestDatabase() {
  return openDatabase(":memory:");
}

export function createAuditRepository() {
  return new SearchAuditRepository(createTestDatabase());
}

export function createAuditContext() {
  const db = createTestDatabase();
  return {
    db,
    auditRepository: new SearchAuditRepository(db)
  };
}

export function successfulSales(documents: SalesDocument[] = []): SalesSystemAdapter {
  return {
    async findDocumentsByVin(): Promise<UpstreamResult<SalesDocument>> {
      return {
        source: "SALES_SYSTEM",
        status: "success",
        latencyMs: 1,
        documents
      };
    }
  };
}

export function timeoutSales(): SalesSystemAdapter {
  return {
    async findDocumentsByVin(): Promise<UpstreamResult<SalesDocument>> {
      return {
        source: "SALES_SYSTEM",
        status: "timeout",
        latencyMs: 50,
        documents: [],
        errorCode: "UPSTREAM_TIMEOUT",
        errorMessage: "Sales timeout"
      };
    }
  };
}

export function successfulService(documents: ServiceDocument[] = []): ServiceSystemAdapter {
  return {
    async findDocumentsByVin(): Promise<UpstreamResult<ServiceDocument>> {
      return {
        source: "SERVICE_SYSTEM",
        status: "success",
        latencyMs: 1,
        documents
      };
    }
  };
}

export function timeoutService(): ServiceSystemAdapter {
  return {
    async findDocumentsByVin(): Promise<UpstreamResult<ServiceDocument>> {
      return {
        source: "SERVICE_SYSTEM",
        status: "timeout",
        latencyMs: 50,
        documents: [],
        errorCode: "UPSTREAM_TIMEOUT",
        errorMessage: "Service timeout"
      };
    }
  };
}

export function failedSales(): SalesSystemAdapter {
  return {
    async findDocumentsByVin(): Promise<UpstreamResult<SalesDocument>> {
      return {
        source: "SALES_SYSTEM",
        status: "failed",
        latencyMs: 1,
        documents: [],
        errorCode: "UPSTREAM_ERROR",
        errorMessage: "Sales failure"
      };
    }
  };
}

export function failedService(): ServiceSystemAdapter {
  return {
    async findDocumentsByVin(): Promise<UpstreamResult<ServiceDocument>> {
      return {
        source: "SERVICE_SYSTEM",
        status: "failed",
        latencyMs: 1,
        documents: [],
        errorCode: "UPSTREAM_ERROR",
        errorMessage: "Service failure"
      };
    }
  };
}

export const salesDocument: SalesDocument = {
  dealId: "D-1",
  documentId: "sales-1",
  documentType: "SALES_CONTRACT",
  signedAt: "2025-01-01T10:00:00.000Z",
  buyerName: "Example Buyer",
  fileName: "Sales contract"
};

export const serviceDocument: ServiceDocument = {
  repairOrderNumber: "RO-1",
  attachmentId: "service-1",
  category: "SERVICE_INVOICE",
  createdAt: "2025-02-01T10:00:00.000Z",
  customer: { displayName: "Example Buyer" },
  description: "Service invoice"
};
