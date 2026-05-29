# Decisions

## Locked Decisions

- Implement **Scenario D: Unified Document Viewer**.
- Choose **backend-first** as the fully implemented service layer.
- Use Node.js and TypeScript.
- Use Fastify for the REST API.
- Use SQLite for local audit persistence.
- Use Vitest for automated tests.
- Use structured logs for observability.
- Keep the backend as the fully implemented service layer.
- Include a focused React reviewer UI to demonstrate the API, while avoiding production frontend scope.

## API Decisions

- Main endpoint: `GET /api/vehicles/:vin/documents`.
- Response includes `requestId`, `vin`, `status`, `documents`, `warnings`, and `upstream`.
- `status` is one of `complete`, `partial`, or `failed`.
- Invalid VIN returns HTTP 400.
- One upstream failure returns HTTP 200 with `partial` status and warnings.
- Both upstreams failing returns HTTP 502 with a controlled response.

## Persistence Decisions

- Persist search audit metadata.
- Do not persist mocked upstream documents as authoritative local data.
- Store upstream status metadata as JSON on the audit record.

## Scope Decisions

- No authentication.
- No production deployment setup.
- No document preview/download workflow because the mock API does not expose document binaries.
- No production-grade frontend portal; the UI is a demo client for the backend contract.
- No real external integrations; upstream APIs are mocked in adapter modules.
