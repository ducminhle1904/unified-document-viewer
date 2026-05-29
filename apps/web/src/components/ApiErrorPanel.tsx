import { WarningCircle } from "@phosphor-icons/react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { ApiError } from "@/lib/api";

export function ApiErrorPanel({ error }: { error: Error }) {
  const apiError = error instanceof ApiError ? error : null;
  const body = apiError?.body;

  return (
    <Alert className="border-destructive/30 bg-red-50 text-red-950">
      <div className="flex gap-3">
        <WarningCircle size={20} weight="regular" className="mt-0.5 shrink-0" aria-hidden="true" />
        <div className="min-w-0">
          <AlertTitle>{body?.code ?? "REQUEST_FAILED"}</AlertTitle>
          <AlertDescription>
            <p>{body?.message ?? error.message}</p>
            {body?.requestId ? (
              <p className="mono-value mt-2 truncate" title={body.requestId}>
                Request: {body.requestId}
              </p>
            ) : null}
            {body?.warnings?.length ? (
              <div className="mt-3 flex flex-wrap gap-2">
                {body.warnings.map((warning) => (
                  <Badge key={`${warning.source}:${warning.code}`} variant="warning">
                    {warning.source} / {warning.code}
                  </Badge>
                ))}
              </div>
            ) : null}
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
