import { randomUUID } from "node:crypto";
import type { Logger } from "pino";
import type { SalesSystemAdapter } from "../adapters/sales-system-adapter.js";
import type { ServiceSystemAdapter } from "../adapters/service-system-adapter.js";
import { normalizeSalesDocument, normalizeServiceDocument } from "../normalizers/document-normalizer.js";
import type { SearchAuditRepository } from "../repositories/search-audit-repository.js";
import type { DocumentSearchResponse, NormalizedDocument, SearchStatus, Warning } from "../types/documents.js";

export class InvalidVinError extends Error {
  constructor() {
    super("VIN must be 17 characters and use allowed VIN characters.");
  }
}

export class UpstreamUnavailableError extends Error {
  constructor(public readonly response: DocumentSearchResponse) {
    super("Both upstream document systems failed.");
  }
}

export interface DocumentAggregationDependencies {
  salesAdapter: SalesSystemAdapter;
  serviceAdapter: ServiceSystemAdapter;
  auditRepository: SearchAuditRepository;
  logger: Logger;
}

const vinPattern = /^[A-HJ-NPR-Z0-9]{17}$/;

export class DocumentAggregationService {
  constructor(private readonly deps: DocumentAggregationDependencies) {}

  async searchByVin(vinInput: string): Promise<DocumentSearchResponse> {
    const vin = vinInput.trim().toUpperCase();
    if (!vinPattern.test(vin)) {
      this.deps.logger.warn({
        event: "document_search_rejected",
        vin,
        reason: "INVALID_VIN"
      }, "document search rejected");
      throw new InvalidVinError();
    }

    const requestId = randomUUID();
    const startedAt = Date.now();
    this.deps.logger.info({
      event: "document_search_started",
      requestId,
      vin,
      upstreamTargets: ["SALES_SYSTEM", "SERVICE_SYSTEM"]
    }, "document search started");

    const [sales, service] = await Promise.all([
      this.deps.salesAdapter.findDocumentsByVin(vin),
      this.deps.serviceAdapter.findDocumentsByVin(vin)
    ]);

    for (const upstream of [sales, service]) {
      const upstreamLog = {
        event: "upstream_document_search_completed",
        requestId,
        vin,
        source: upstream.source,
        status: upstream.status,
        latencyMs: upstream.latencyMs,
        documentCount: upstream.documents.length,
        failureReason: upstream.errorCode
      };

      if (upstream.status === "success") {
        this.deps.logger.info(upstreamLog, "upstream document search completed");
      } else {
        this.deps.logger.warn(upstreamLog, "upstream document search completed");
      }
    }

    const warnings: Warning[] = [sales, service]
      .filter((result) => result.status !== "success")
      .map((result) => ({
        code: result.errorCode ?? "UPSTREAM_ERROR",
        source: result.source,
        message: result.errorMessage ?? `${result.source} failed`
      }));

    const successfulUpstreams = [sales, service].filter((result) => result.status === "success").length;
    const status: SearchStatus =
      successfulUpstreams === 2 ? "complete" : successfulUpstreams === 1 ? "partial" : "failed";

    const documents = dedupeDocuments([
      ...sales.documents.map(normalizeSalesDocument),
      ...service.documents.map(normalizeServiceDocument)
    ]).sort((a, b) => Date.parse(b.documentDate) - Date.parse(a.documentDate));

    const response: DocumentSearchResponse = {
      requestId,
      vin,
      status,
      documents: status === "failed" ? [] : documents,
      warnings,
      upstream: [sales, service].map((result) => ({
        source: result.source,
        status: result.status,
        latencyMs: result.latencyMs,
        documentCount: result.documents.length,
        errorCode: result.errorCode
      }))
    };

    const totalLatencyMs = Date.now() - startedAt;

    this.deps.auditRepository.create({
      requestId,
      vin,
      status,
      resultCount: response.documents.length,
      warningCount: warnings.length,
      latencyMs: totalLatencyMs,
      upstream: response.upstream
    });

    this.deps.logger.info({
      event: "search_audit_persisted",
      requestId,
      vin,
      status,
      resultCount: response.documents.length,
      warningCount: warnings.length,
      latencyMs: totalLatencyMs
    }, "search audit persisted");

    const completionLog = {
      event: "document_search_completed",
      requestId,
      vin,
      status,
      resultCount: response.documents.length,
      warningCount: warnings.length,
      latencyMs: totalLatencyMs,
      upstream: response.upstream
    };

    if (status === "complete") {
      this.deps.logger.info(completionLog, "document search completed");
    } else if (status === "partial") {
      this.deps.logger.warn(completionLog, "document search completed");
    } else {
      this.deps.logger.error(completionLog, "document search completed");
    }

    if (status === "failed") {
      throw new UpstreamUnavailableError(response);
    }

    return response;
  }
}

function dedupeDocuments(documents: NormalizedDocument[]): NormalizedDocument[] {
  const seen = new Set<string>();
  const deduped: NormalizedDocument[] = [];

  for (const document of documents) {
    if (seen.has(document.id)) {
      continue;
    }
    seen.add(document.id);
    deduped.push(document);
  }

  return deduped;
}
