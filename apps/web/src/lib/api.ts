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

export interface ApiWarning {
  code: string;
  source: SourceSystem;
  message: string;
}

export interface UpstreamSummary {
  source: SourceSystem;
  status: UpstreamStatus;
  latencyMs: number;
  documentCount: number;
  errorCode?: string;
}

export interface DocumentSearchResponse {
  requestId: string;
  vin: string;
  status: SearchStatus;
  documents: NormalizedDocument[];
  warnings: ApiWarning[];
  upstream: UpstreamSummary[];
}

export interface ApiErrorBody extends Partial<DocumentSearchResponse> {
  code: string;
  message: string;
}

export class ApiError extends Error {
  constructor(
    public readonly statusCode: number,
    public readonly body: ApiErrorBody
  ) {
    super(body.message || body.code);
  }
}

const apiBaseUrl = import.meta.env.VITE_API_BASE_URL ?? "http://localhost:3000";

export async function searchDocumentsByVin(vin: string): Promise<DocumentSearchResponse> {
  const response = await fetch(`${apiBaseUrl}/api/vehicles/${encodeURIComponent(vin)}/documents`);
  const body = (await response.json()) as DocumentSearchResponse | ApiErrorBody;

  if (!response.ok) {
    throw new ApiError(response.status, body as ApiErrorBody);
  }

  return body as DocumentSearchResponse;
}

export const demoVins = [
  { label: "Complete", vin: "1HGCM82633A004352" },
  { label: "Empty", vin: "2HGCM82633A004353" },
  { label: "Sales partial", vin: "1HGCM82633A00435S" },
  { label: "Service partial", vin: "1HGCM82633A00435V" },
  { label: "Failed", vin: "1HGCM82633A00435X" }
];

export function isValidVin(value: string): boolean {
  return /^[A-HJ-NPR-Z0-9]{17}$/.test(value.trim().toUpperCase());
}
