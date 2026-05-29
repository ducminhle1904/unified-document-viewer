import Database from "better-sqlite3";
import { dirname } from "node:path";
import { mkdirSync } from "node:fs";

export type SqliteDatabase = Database.Database;

export function openDatabase(databaseUrl: string): SqliteDatabase {
  if (databaseUrl !== ":memory:") {
    mkdirSync(dirname(databaseUrl), { recursive: true });
  }

  const db = new Database(databaseUrl);
  db.pragma("journal_mode = WAL");
  db.exec(`
    CREATE TABLE IF NOT EXISTS search_audits (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      request_id TEXT NOT NULL UNIQUE,
      vin TEXT NOT NULL,
      status TEXT NOT NULL,
      result_count INTEGER NOT NULL,
      warning_count INTEGER NOT NULL,
      latency_ms INTEGER NOT NULL,
      upstream_json TEXT NOT NULL,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);

  return db;
}
