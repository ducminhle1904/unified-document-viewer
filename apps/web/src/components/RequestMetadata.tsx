import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { DocumentSearchResponse } from "@/lib/api";

export function RequestMetadata({ response }: { response: DocumentSearchResponse }) {
  return (
    <div className="result-card-enter flex flex-col gap-3 border border-border bg-card/95 p-4 md:flex-row md:items-center md:justify-between">
      <div>
        <div className="text-xs font-semibold uppercase text-muted-foreground">Search context</div>
        <div className="mt-1 flex flex-wrap items-center gap-2">
          <span className="mono-value text-foreground">{response.vin}</span>
          <Badge variant={response.status === "complete" ? "success" : response.status === "partial" ? "warning" : "destructive"}>
            {response.status}
          </Badge>
        </div>
      </div>
      <Separator className="md:hidden" />
      <div className="min-w-0 md:text-right">
        <div className="text-xs font-semibold uppercase text-muted-foreground">Request ID</div>
        <div className="mono-value mt-1 truncate text-foreground" title={response.requestId}>
          {response.requestId}
        </div>
      </div>
    </div>
  );
}
