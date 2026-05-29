export type SourceSystem = "SALES_SYSTEM" | "SERVICE_SYSTEM";

export type SearchStatus = "complete" | "partial" | "failed";

export type UpstreamStatus = "success" | "failed" | "timeout";

export interface NormalizedDocument {
  id: string;
  externalId: string;
  source: SourceSystem;
  type: string;
  title: string;
  documentDate: string;
  customerName?: string;
  metadata: Record<string, string | number | boolean | null>;
}

export interface UpstreamResult<T> {
  source: SourceSystem;
  status: UpstreamStatus;
  latencyMs: number;
  documents: T[];
  errorCode?: string;
  errorMessage?: string;
}

export interface Warning {
  code: string;
  source: SourceSystem;
  message: string;
}

export interface DocumentSearchResponse {
  requestId: string;
  vin: string;
  status: SearchStatus;
  documents: NormalizedDocument[];
  warnings: Warning[];
  upstream: Array<{
    source: SourceSystem;
    status: UpstreamStatus;
    latencyMs: number;
    documentCount: number;
    errorCode?: string;
  }>;
}

export interface AuditRecordInput {
  requestId: string;
  vin: string;
  status: SearchStatus;
  resultCount: number;
  warningCount: number;
  latencyMs: number;
  upstream: DocumentSearchResponse["upstream"];
}
