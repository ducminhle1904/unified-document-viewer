import type { SqliteDatabase } from "../db/sqlite.js";
import type { AuditRecordInput } from "../types/documents.js";

export class SearchAuditRepository {
  constructor(private readonly db: SqliteDatabase) {}

  create(record: AuditRecordInput): void {
    this.db
      .prepare(`
        INSERT INTO search_audits (
          request_id,
          vin,
          status,
          result_count,
          warning_count,
          latency_ms,
          upstream_json
        )
        VALUES (@requestId, @vin, @status, @resultCount, @warningCount, @latencyMs, @upstreamJson)
      `)
      .run({
        ...record,
        upstreamJson: JSON.stringify(record.upstream)
      });
  }

  count(): number {
    const row = this.db.prepare("SELECT COUNT(*) as count FROM search_audits").get() as { count: number };
    return row.count;
  }
}
