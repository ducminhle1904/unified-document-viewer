# Keyloop Scenario D: Unified Document Viewer

This repository implements **Scenario D: The Unified Document Viewer** from the Keyloop technical assessment.

The chosen implementation layer is **backend-first**: a REST API that accepts a VIN, queries two mocked dealership systems in parallel, normalizes their document formats, returns a single consolidated document list, and persists search audit metadata in SQLite.

## Scenario Summary

- **Domain:** Operate
- **Task:** Provide a single view of all vehicle-related documents from two dealership systems.
- **Core flow:** User searches by VIN, the backend calls the mocked Sales System API and Service System API in parallel, then returns a consolidated document list with source-system labels.
- **Why this scenario:** Scenario D best matches Keyloop's Operate domain because the core problem is connecting fragmented dealership systems while preserving trust in where each document came from.

## Architecture

The service is organized around a small integration pipeline:

1. `GET /api/vehicles/:vin/documents` receives the VIN search request.
2. The route validates the VIN through the aggregation service.
3. Sales and Service adapters simulate two external dealership systems.
4. Normalizers convert source-specific payloads into one document model.
5. The aggregation service deduplicates, sorts newest first, and builds warning/upstream metadata.
6. The audit repository persists request metadata to SQLite.

More detail is available in:

- [System design](docs/system-design.md)
- [API contract](docs/api-contract.md)
- [AI collaboration narrative](docs/ai-collaboration.md)

## Tech Stack

- Node.js and TypeScript
- Fastify for the REST API
- SQLite via `better-sqlite3` for local audit persistence
- Vitest for business behavior tests
- pino structured logs for local observability
- Vite, React, Tailwind CSS, and shadcn-style components for the reviewer UI
- Playwright for browser E2E verification

## Setup

```bash
npm install
cp .env.example .env
npm run build
npm test
npm run web:build
npm run web:test
```

## Run

```bash
npm run dev
```

The API starts on `http://localhost:3000` by default.

Run the reviewer UI in a second terminal:

```bash
VITE_API_BASE_URL=http://localhost:3000 npm run web:dev
```

The UI starts on `http://127.0.0.1:5173` by default.

## Demo Requests

```bash
curl http://localhost:3000/health
curl http://localhost:3000/api/vehicles/1HGCM82633A004352/documents
curl http://localhost:3000/api/vehicles/2HGCM82633A004353/documents
curl http://localhost:3000/api/vehicles/1HGCM82633A00435S/documents
curl http://localhost:3000/api/vehicles/1HGCM82633A00435X/documents
```

Or run:

```bash
./scripts/demo-requests.sh
```

## Tests

```bash
npm test
```

The test suite includes:

- **Service tests** for aggregation business logic: combined results, source labels, newest-first sorting, deduplication, empty results, partial failures, timeout handling, VIN normalization, invalid VIN rejection, and audit side effects.
- **Repository tests** for SQLite audit schema initialization, audit insert/count behavior, and stored upstream JSON.
- **API integration tests** using Fastify injection for health, complete, empty, partial, failed, and invalid VIN responses.
- **E2E HTTP tests** that start the real server on an ephemeral port, call it with `fetch`, use a temporary SQLite database file, and verify audit persistence.
- **UI component tests** for VIN validation, demo searches, and complete/empty/partial/failed states.
- **UI browser E2E tests** for complete, empty, partial, failed, and mobile no-overflow flows.

UI verification commands:

```bash
npm run web:test
npm run web:e2e
```

## Assumptions and Trade-Offs

- The implementation is backend-first because Scenario D is primarily an integration, aggregation, reliability, and observability problem.
- The backend remains the fully implemented assessment layer; the React UI is a focused reviewer/demo client for the same API contract.
- SQLite is used to satisfy persistence locally without adding external infrastructure.
- The system persists search audit metadata, not mocked upstream documents as authoritative local records.
- Authentication, deployment automation, and document download behavior are out of scope for this focused assessment implementation.

## AI Collaboration Narrative

I used AI agents as engineering collaborators throughout the challenge while keeping ownership of the architecture, trade-offs, verification, and final code quality.

AI was used to accelerate research, compare backend-first versus frontend-first options, draft the API contract, identify failure modes such as partial upstream failure and duplicate documents, scaffold implementation boundaries, and review test coverage. I then validated the output by inspecting the code, simplifying overbuilt areas, aligning behavior with the assessment requirements, and running automated tests.

The final solution remains human-owned: the architecture is intentionally focused on the Scenario D integration problem, with a clear REST contract, parallel mocked upstream aggregation, normalized document output, persisted audit records, structured logs, and tests around core business behavior.
