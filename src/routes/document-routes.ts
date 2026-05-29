import type { FastifyInstance } from "fastify";
import { InvalidVinError, UpstreamUnavailableError, type DocumentAggregationService } from "../services/document-aggregation-service.js";

export async function registerDocumentRoutes(app: FastifyInstance, service: DocumentAggregationService) {
  app.get("/api/vehicles/:vin/documents", async (request, reply) => {
    const { vin } = request.params as { vin: string };

    try {
      return await service.searchByVin(vin);
    } catch (error) {
      if (error instanceof InvalidVinError) {
        return reply.code(400).send({
          code: "INVALID_VIN",
          message: error.message
        });
      }

      if (error instanceof UpstreamUnavailableError) {
        return reply.code(502).send({
          code: "UPSTREAM_DOCUMENT_SYSTEMS_UNAVAILABLE",
          message: error.message,
          ...error.response
        });
      }

      request.log.error({ error }, "Unhandled document search error");
      return reply.code(500).send({
        code: "INTERNAL_SERVER_ERROR",
        message: "An unexpected error occurred."
      });
    }
  });
}
