import { Badge } from "@/components/ui/badge";
import type { SourceSystem } from "@/lib/api";

export function SourceBadge({ source }: { source: SourceSystem }) {
  const label = source === "SALES_SYSTEM" ? "Sales System" : "Service System";
  const variant = source === "SALES_SYSTEM" ? "blue" : "success";

  return (
    <Badge variant={variant} className="whitespace-nowrap">
      {label}
    </Badge>
  );
}
