import { FolderOpen, MagnifyingGlass, Warning } from "@phosphor-icons/react";
import { ApiErrorPanel } from "@/components/ApiErrorPanel";
import { DocumentSummaryStrip } from "@/components/DocumentSummaryStrip";
import { DocumentTable } from "@/components/DocumentTable";
import { RequestMetadata } from "@/components/RequestMetadata";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import type { DocumentSearchResponse } from "@/lib/api";

interface DocumentResultsProps {
  data?: DocumentSearchResponse;
  error?: Error | null;
  isLoading: boolean;
}

export function DocumentResults({ data, error, isLoading }: DocumentResultsProps) {
  if (isLoading) {
    return (
      <Card className="result-card-enter overflow-hidden">
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <CardTitle>Searching document systems</CardTitle>
            <span className="search-pulse" aria-hidden="true" />
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <Skeleton className="result-skeleton h-16 w-full" />
          <Skeleton className="result-skeleton h-12 w-full [animation-delay:80ms]" />
          <Skeleton className="result-skeleton h-12 w-full [animation-delay:160ms]" />
          <Skeleton className="result-skeleton h-12 w-3/4 [animation-delay:240ms]" />
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <div className="result-card-enter">
        <ApiErrorPanel error={error} />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="industrial-panel result-card-enter border-dashed p-8 text-center">
        <MagnifyingGlass size={32} weight="regular" className="mx-auto text-primary" aria-hidden="true" />
        <h2 className="mt-3 text-lg font-semibold">Search a VIN to view vehicle documents</h2>
        <p className="mx-auto mt-2 max-w-xl text-sm text-muted-foreground">
          Results will show one consolidated document list with source-system labels and request metadata.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <RequestMetadata response={data} />

      {data.status === "partial" ? (
        <Alert className="result-card-enter border-amber-200 bg-amber-50 text-amber-950 [animation-delay:70ms]">
          <div className="flex gap-3">
            <Warning size={20} weight="regular" className="mt-0.5 shrink-0" aria-hidden="true" />
            <div>
              <AlertTitle>Partial results returned</AlertTitle>
              <AlertDescription>
                {data.warnings.map((warning) => (
                  <p key={`${warning.source}:${warning.code}`}>
                    {warning.source} reported {warning.code}. Available documents are still shown.
                  </p>
                ))}
              </AlertDescription>
            </div>
          </div>
        </Alert>
      ) : null}

      <Card className="result-card-enter [animation-delay:120ms]">
        <CardHeader>
          <CardTitle>Documents</CardTitle>
        </CardHeader>
        <CardContent>
          {data.documents.length === 0 ? (
            <div className="empty-result-panel border border-dashed border-border p-8 text-center">
              <FolderOpen size={32} weight="regular" className="mx-auto text-primary" aria-hidden="true" />
              <h3 className="mt-3 font-semibold">No documents found</h3>
              <p className="mt-2 text-sm text-muted-foreground">
                Both source systems completed the search for {data.vin}, but no documents were returned.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              <DocumentSummaryStrip documents={data.documents} />
              <DocumentTable documents={data.documents} requestId={data.requestId} />
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
