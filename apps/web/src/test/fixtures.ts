import type { DocumentSearchResponse } from "@/lib/api";

export const completeResponse: DocumentSearchResponse = {
  requestId: "request-complete",
  vin: "1HGCM82633A004352",
  status: "complete",
  documents: [
    {
      id: "service:service-7001",
      externalId: "service-7001",
      source: "SERVICE_SYSTEM",
      type: "SERVICE_INVOICE",
      title: "12 month service invoice",
      documentDate: "2026-01-15T09:10:00.000Z",
      customerName: "Alex Morgan",
      metadata: { repairOrderNumber: "RO-7001" }
    },
    {
      id: "sales:sales-1001",
      externalId: "sales-1001",
      source: "SALES_SYSTEM",
      type: "SALES_CONTRACT",
      title: "Vehicle sales contract",
      documentDate: "2025-11-03T10:30:00.000Z",
      customerName: "Alex Morgan",
      metadata: { dealNumber: "D-1001" }
    }
  ],
  warnings: [],
  upstream: [
    { source: "SALES_SYSTEM", status: "success", latencyMs: 15, documentCount: 1 },
    { source: "SERVICE_SYSTEM", status: "success", latencyMs: 20, documentCount: 1 }
  ]
};

export const emptyResponse: DocumentSearchResponse = {
  ...completeResponse,
  requestId: "request-empty",
  vin: "2HGCM82633A004353",
  documents: [],
  upstream: [
    { source: "SALES_SYSTEM", status: "success", latencyMs: 15, documentCount: 0 },
    { source: "SERVICE_SYSTEM", status: "success", latencyMs: 20, documentCount: 0 }
  ]
};

export const partialResponse: DocumentSearchResponse = {
  ...completeResponse,
  requestId: "request-partial",
  vin: "1HGCM82633A00435S",
  status: "partial",
  documents: [completeResponse.documents[0]],
  warnings: [
    {
      code: "UPSTREAM_ERROR",
      source: "SALES_SYSTEM",
      message: "Sales System API failed"
    }
  ],
  upstream: [
    { source: "SALES_SYSTEM", status: "failed", latencyMs: 16, documentCount: 0, errorCode: "UPSTREAM_ERROR" },
    { source: "SERVICE_SYSTEM", status: "success", latencyMs: 21, documentCount: 1 }
  ]
};
