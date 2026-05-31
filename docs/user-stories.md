# Scenario D User Stories

## Product Framing

A dealership user needs one reliable place to search a VIN and see all related vehicle documents from sales and service systems, without switching tools, re-entering data, or manually reconciling inconsistent records.

The product should feel like an operational tool for dealership staff. The value is speed, trust, and continuity across departments.

These stories informed the implementation scope. They are not a full production portal spec; they define the user-facing behavior needed to validate Scenario D.

## Primary Personas

### Service Advisor

The service advisor needs quick access to vehicle service documents while helping a customer with aftersales or workshop-related questions.

User story:

> As a service advisor, I want to search by VIN and see service-related documents so I can support aftersales workflows quickly.

Acceptance criteria:

- The advisor can enter a VIN and submit a search.
- Service documents are shown in the unified result list.
- Each service document clearly indicates that it came from the Service System.
- If the Sales System is unavailable, service results are still returned when possible.

### Sales Consultant

The sales consultant needs sales documents and service context in one place while answering vehicle or customer questions.

User story:

> As a sales consultant, I want sales documents and service context in one view so I can answer customer questions without switching systems.

Acceptance criteria:

- Sales documents and service documents appear in one consolidated list.
- The list is sorted by document date, newest first.
- The source system is visible for every document.
- The response shape is consistent even though the source systems use different document formats.

### Operations Manager

The operations manager needs confidence in document lineage and system reliability.

User story:

> As an operations manager, I want each document to show its source system so I can trust where the data came from.

Acceptance criteria:

- Every document includes a source field such as `SALES_SYSTEM` or `SERVICE_SYSTEM`.
- The API response includes request metadata such as request ID and upstream status.
- Partial results include a warning that identifies which source failed.
- Search activity is persisted for audit and support review.

### Support or Admin User

The support/admin user needs to diagnose integration failures without asking dealership staff to reproduce vague problems.

User story:

> As a support/admin user, I want failed upstream calls logged clearly so integration issues can be diagnosed.

Acceptance criteria:

- Logs include request ID, VIN, upstream system name, latency, status, and failure reason.
- Audit records are persisted for successful, partial, and failed searches.
- The API returns controlled errors instead of leaking stack traces.
- The system distinguishes invalid input from upstream failure.

## Core Workflow

1. User enters a VIN.
2. Backend validates the VIN.
3. Backend calls the Sales System API and Service System API in parallel.
4. Backend normalizes results into one document model.
5. Backend deduplicates repeated records where appropriate.
6. Backend sorts documents by date descending.
7. Backend persists an audit record.
8. Backend returns documents, source metadata, and warnings if applicable.

## Response Experience

The response should answer three user questions:

- What documents exist for this vehicle?
- Where did each document come from?
- Is the result complete, partial, or failed?

## Out-of-Scope for the Challenge

These features are out of scope for this submission:

- Authentication and role-based authorization.
- Real Keyloop API integration.
- Document preview or binary file download.
- Full production frontend portal.
- Complex search beyond VIN.
- Event streaming.

They are reasonable extensions, but they are not needed to prove the chosen backend layer.

## Future Extensions

Possible next steps:

- Add authentication and dealership-level authorization.
- Add document preview/download permissions.
- Add cache invalidation or event subscriptions for updated documents.
- Add correlation with service history and sales activities.
- Add a frontend dashboard for support teams to review failed upstream calls.
- Add OpenAPI documentation and consumer contract tests.
