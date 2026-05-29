import cors from "@fastify/cors";
import Fastify, { type FastifyInstance } from "fastify";
import { createSalesSystemAdapter, type SalesSystemAdapter } from "./adapters/sales-system-adapter.js";
import { createServiceSystemAdapter, type ServiceSystemAdapter } from "./adapters/service-system-adapter.js";
import type { AppConfig } from "./config/env.js";
import { openDatabase, type SqliteDatabase } from "./db/sqlite.js";
import { createLogger } from "./observability/logger.js";
import { SearchAuditRepository } from "./repositories/search-audit-repository.js";
import { registerDocumentRoutes } from "./routes/document-routes.js";
import { DocumentAggregationService } from "./services/document-aggregation-service.js";

export interface CreateAppOptions {
  config: AppConfig;
  db?: SqliteDatabase;
  salesAdapter?: SalesSystemAdapter;
  serviceAdapter?: ServiceSystemAdapter;
}

export async function createApp(options: CreateAppOptions): Promise<FastifyInstance> {
  const logger = createLogger();
  const app = Fastify({ logger: process.env.NODE_ENV !== "test" });
  await app.register(cors);

  const db = options.db ?? openDatabase(options.config.DATABASE_URL);
  const auditRepository = new SearchAuditRepository(db);
  const aggregationService = new DocumentAggregationService({
    salesAdapter: options.salesAdapter ?? createSalesSystemAdapter(options.config.UPSTREAM_TIMEOUT_MS),
    serviceAdapter: options.serviceAdapter ?? createServiceSystemAdapter(options.config.UPSTREAM_TIMEOUT_MS),
    auditRepository,
    logger
  });

  await registerDocumentRoutes(app, aggregationService);

  app.get("/health", async () => ({
    status: "ok"
  }));

  app.addHook("onClose", async () => {
    db.close();
  });

  return app;
}
