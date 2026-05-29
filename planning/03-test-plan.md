# Test Plan

## Service Tests

- Valid VIN returns combined documents from Sales and Service systems.
- Every normalized document includes a source system.
- Documents are sorted newest first.
- Duplicate documents are removed by normalized ID.
- Empty upstream responses return `status: complete` with `documents: []`.
- Sales failure returns partial results with warning metadata.
- Service failure returns partial results with warning metadata.
- Timeout result returns partial results with `UPSTREAM_TIMEOUT`.
- Both upstreams failing throws a controlled `UpstreamUnavailableError`.
- Invalid VIN is rejected before upstream calls.
- VIN input is trimmed and uppercased.
- Audit records are persisted for complete, partial, and failed searches.

## Repository Tests

- SQLite audit schema initializes when the database opens.
- `SearchAuditRepository.create()` stores status, counts, latency, and VIN fields.
- Stored `upstream_json` is valid JSON and preserves upstream statuses.
- Multiple audit inserts increment the repository count.

## API Integration Tests

- `GET /health` returns `200 { status: "ok" }`.
- Complete VIN response includes `requestId`, `vin`, `status`, `documents`, `warnings`, and `upstream`.
- Empty VIN response returns `200 complete` with `documents: []`.
- Sales failure VIN returns `200 partial` and retains Service documents.
- Service failure VIN returns `200 partial` and retains Sales documents.
- Both upstream systems unavailable returns `502` with a controlled body and no stack trace.
- Invalid VIN returns `400 INVALID_VIN`.

## E2E HTTP Tests

- Start the real Fastify server on an ephemeral port.
- Use real HTTP `fetch`, not Fastify injection.
- Use a temporary SQLite database file.
- Verify `/health`, complete, empty, partial, and failed document search flows.
- Verify audit records are persisted for complete, partial, and failed searches.

## UI Tests

- Component tests cover VIN validation, demo VIN selection, complete results, empty state, partial warning, and failed error panel.
- Playwright E2E starts the backend and React UI, then verifies complete, empty, partial, failed, and mobile no-overflow flows.

## Manual Demo

- Start the API with `npm run dev`.
- Start the UI with `VITE_API_BASE_URL=http://localhost:3000 npm run web:dev`.
- Run `./scripts/demo-requests.sh`.
- Confirm response examples match `docs/api-contract.md`.
