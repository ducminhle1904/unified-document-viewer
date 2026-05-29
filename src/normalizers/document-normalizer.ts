import type { NormalizedDocument } from "../types/documents.js";
import type { SalesDocument, ServiceDocument } from "../types/upstream.js";

export function normalizeSalesDocument(document: SalesDocument): NormalizedDocument {
  return {
    id: document.duplicateKey ?? `sales:${document.documentId}`,
    externalId: document.documentId,
    source: "SALES_SYSTEM",
    type: document.documentType,
    title: document.fileName,
    documentDate: document.signedAt,
    customerName: document.buyerName,
    metadata: {
      dealNumber: document.dealId,
      duplicateKey: document.duplicateKey ?? null
    }
  };
}

export function normalizeServiceDocument(document: ServiceDocument): NormalizedDocument {
  return {
    id: document.duplicateKey ?? `service:${document.attachmentId}`,
    externalId: document.attachmentId,
    source: "SERVICE_SYSTEM",
    type: document.category,
    title: document.description,
    documentDate: document.createdAt,
    customerName: document.customer.displayName,
    metadata: {
      repairOrderNumber: document.repairOrderNumber,
      duplicateKey: document.duplicateKey ?? null
    }
  };
}
