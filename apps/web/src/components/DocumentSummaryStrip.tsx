import { format } from "date-fns";
import type { NormalizedDocument } from "@/lib/api";

function formatNewestDate(documents: NormalizedDocument[]) {
  const newest = documents[0]?.documentDate;
  return newest ? format(new Date(newest), "dd MMM yyyy") : "None";
}

export function DocumentSummaryStrip({ documents }: { documents: NormalizedDocument[] }) {
  const sourceCount = new Set(documents.map((document) => document.source)).size;

  return (
    <div className="document-summary-strip">
      <div>
        <span className="summary-label">Documents</span>
        <span className="mono-value summary-value">{documents.length}</span>
      </div>
      <div>
        <span className="summary-label">Sources</span>
        <span className="mono-value summary-value">{sourceCount}</span>
      </div>
      <div>
        <span className="summary-label">Newest</span>
        <span className="mono-value summary-value">{formatNewestDate(documents)}</span>
      </div>
      <div className="summary-normalized">Deduped normalized IDs</div>
    </div>
  );
}
