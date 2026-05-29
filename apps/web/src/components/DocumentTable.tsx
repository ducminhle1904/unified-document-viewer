import { format } from "date-fns";
import { Fragment, useState, type CSSProperties, type KeyboardEvent } from "react";
import { CaretDown, ClipboardText, FileText, Receipt } from "@phosphor-icons/react";
import { SourceBadge } from "@/components/SourceBadge";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import type { NormalizedDocument } from "@/lib/api";

function formatDocumentDate(value: string) {
  return format(new Date(value), "dd MMM yyyy, HH:mm");
}

function formatMetadataValue(value: string | number | boolean | null) {
  if (value === null) {
    return "null";
  }

  return String(value);
}

function DocumentTypeBadge({ type }: { type: string }) {
  const normalizedType = type.replaceAll("_", " ");
  const icon =
    type === "SALES_CONTRACT" ? (
      <ClipboardText size={14} weight="regular" aria-hidden="true" />
    ) : type === "SERVICE_INVOICE" ? (
      <Receipt size={14} weight="regular" aria-hidden="true" />
    ) : (
      <FileText size={14} weight="regular" aria-hidden="true" />
    );

  return (
    <Badge variant="outline" className="document-type-badge">
      {icon}
      {normalizedType}
    </Badge>
  );
}

function TimelineMarker({ source }: { source: NormalizedDocument["source"] }) {
  return (
    <span className="timeline-cell" data-source={source} aria-hidden="true">
      <span className="timeline-dot" />
    </span>
  );
}

function DocumentDetailPanel({ document, requestId }: { document: NormalizedDocument; requestId: string }) {
  const metadataEntries = Object.entries(document.metadata);

  return (
    <div className="document-detail-panel">
      <div className="flex flex-col gap-1 md:flex-row md:items-start md:justify-between">
        <div>
          <div className="section-label text-primary">Inspection detail</div>
          <h3 className="mt-1 font-semibold">{document.title}</h3>
        </div>
        <SourceBadge source={document.source} />
      </div>

      <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2 xl:grid-cols-3">
        <div>
          <dt className="detail-label">Type</dt>
          <dd className="mt-1">
            <DocumentTypeBadge type={document.type} />
          </dd>
        </div>
        <div>
          <dt className="detail-label">Document date</dt>
          <dd className="mono-value mt-1 text-foreground">{formatDocumentDate(document.documentDate)}</dd>
        </div>
        <div>
          <dt className="detail-label">External ID</dt>
          <dd className="mono-value mt-1 text-foreground">{document.externalId}</dd>
        </div>
        <div>
          <dt className="detail-label">Customer</dt>
          <dd className="mt-1 text-foreground">{document.customerName ?? "Not provided"}</dd>
        </div>
        <div>
          <dt className="detail-label">Normalized ID</dt>
          <dd className="mono-value mt-1 text-foreground">{document.id}</dd>
        </div>
        <div>
          <dt className="detail-label">Search request</dt>
          <dd className="mono-value mt-1 text-foreground">{requestId}</dd>
        </div>
      </dl>

      <div className="mt-4 border-t border-border pt-4">
        <div className="detail-label">Metadata</div>
        {metadataEntries.length ? (
          <dl className="mt-2 grid gap-2 sm:grid-cols-2">
            {metadataEntries.map(([key, value]) => (
              <div key={key} className="metadata-chip">
                <dt>{key}</dt>
                <dd className="mono-value">{formatMetadataValue(value)}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <p className="mt-2 text-sm text-muted-foreground">No metadata supplied.</p>
        )}
      </div>
    </div>
  );
}

export function DocumentTable({ documents, requestId }: { documents: NormalizedDocument[]; requestId: string }) {
  const [expandedDocumentId, setExpandedDocumentId] = useState<string | null>(null);

  function toggleDocument(documentId: string) {
    setExpandedDocumentId((current) => (current === documentId ? null : documentId));
  }

  function handleRowKeyDown(event: KeyboardEvent<HTMLTableRowElement>, documentId: string) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleDocument(documentId);
    }
  }

  return (
    <div>
      <div className="documents-table-shell hidden md:block">
        <Table className="documents-table">
          <colgroup>
            <col className="w-[44%]" />
            <col className="w-[18%]" />
            <col className="w-[18%]" />
            <col className="w-[20%]" />
          </colgroup>
          <TableHeader>
            <TableRow>
              <TableHead>Document</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Customer</TableHead>
              <TableHead>External ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {documents.map((document, index) => (
              <Fragment key={`${document.source}:${document.externalId}`}>
                <TableRow
                  role="button"
                  tabIndex={0}
                  aria-expanded={expandedDocumentId === document.id}
                  aria-controls={`document-detail-${document.id}`}
                  className="table-row-enter document-inspection-row"
                  data-source={document.source}
                  data-expanded={expandedDocumentId === document.id}
                  onClick={() => toggleDocument(document.id)}
                  onKeyDown={(event) => handleRowKeyDown(event, document.id)}
                  style={{ "--row-index": index } as CSSProperties}
                >
                  <TableCell className="py-4">
                    <div className="document-primary-cell">
                      <TimelineMarker source={document.source} />
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2 font-medium">
                          <FileText size={16} weight="regular" className="shrink-0 text-primary" aria-hidden="true" />
                          <span className="truncate">{document.title}</span>
                          <CaretDown
                            size={14}
                            weight="regular"
                            className="document-caret shrink-0 text-muted-foreground"
                            aria-hidden="true"
                          />
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <span className="mono-value whitespace-nowrap text-muted-foreground">
                            {formatDocumentDate(document.documentDate)}
                          </span>
                          <DocumentTypeBadge type={document.type} />
                        </div>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <SourceBadge source={document.source} />
                  </TableCell>
                  <TableCell>{document.customerName ?? "Not provided"}</TableCell>
                  <TableCell>
                    <span className="table-id-value" title={document.externalId}>
                      {document.externalId}
                    </span>
                  </TableCell>
                </TableRow>
                {expandedDocumentId === document.id ? (
                  <TableRow className="document-detail-row hover:bg-transparent">
                    <TableCell colSpan={4} className="p-0">
                      <div id={`document-detail-${document.id}`} className="document-detail-shell">
                        <DocumentDetailPanel document={document} requestId={requestId} />
                      </div>
                    </TableCell>
                  </TableRow>
                ) : null}
              </Fragment>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="grid gap-3 md:hidden">
        {documents.map((document, index) => {
          const isExpanded = expandedDocumentId === document.id;

          return (
            <article
              key={`${document.source}:${document.externalId}`}
              className="result-row document-mobile-card border border-border bg-background p-4"
              data-source={document.source}
              data-expanded={isExpanded}
              style={{ "--row-index": index } as CSSProperties}
            >
              <button
                type="button"
                className="w-full text-left focus-visible:outline-none"
                aria-expanded={isExpanded}
                aria-controls={`document-mobile-detail-${document.id}`}
                onClick={() => toggleDocument(document.id)}
              >
                <div className="mobile-timeline-rail" aria-hidden="true">
                  <TimelineMarker source={document.source} />
                </div>
                <div className="mt-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{document.title}</h3>
                    <p className="mono-value mt-1 text-muted-foreground">{formatDocumentDate(document.documentDate)}</p>
                  </div>
                  <SourceBadge source={document.source} />
                </div>
              </button>
              <dl className="mt-4 grid grid-cols-2 gap-3 text-sm">
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">Type</dt>
                  <dd className="mt-1">
                    <DocumentTypeBadge type={document.type} />
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase text-muted-foreground">External ID</dt>
                  <dd className="mt-1">
                    <span className="table-id-value" title={document.externalId}>
                      {document.externalId}
                    </span>
                  </dd>
                </div>
                <div className="col-span-2">
                  <dt className="text-xs uppercase text-muted-foreground">Customer</dt>
                  <dd className="mt-1">{document.customerName ?? "Not provided"}</dd>
                </div>
              </dl>
              {isExpanded ? (
                <div id={`document-mobile-detail-${document.id}`} className="document-detail-shell mt-4">
                  <DocumentDetailPanel document={document} requestId={requestId} />
                </div>
              ) : null}
            </article>
          );
        })}
      </div>
    </div>
  );
}
