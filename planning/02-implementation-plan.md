# Implementation Plan

## Phase 1: Repository Structure

- Create project-specific `AGENTS.md`.
- Move research artifacts into `docs/` and `planning/`.
- Add README, API contract, video outline, and planning tracker files.

## Phase 2: Backend Scaffold

- Add TypeScript project configuration.
- Add Fastify app factory and server entrypoint.
- Add environment configuration.
- Add SQLite database initialization.

## Phase 3: Scenario D Logic

- Add Sales and Service mocked upstream adapters.
- Add source-specific document normalizers.
- Add aggregation service for VIN validation, parallel requests, dedupe, sorting, warnings, upstream metadata, and audit persistence.
- Add REST route and controlled error responses.

## Phase 4: Verification

- Add service tests for business behavior.
- Add API route tests using Fastify injection.
- Run typecheck and test suite.

## Phase 5: Submission Polish

- Confirm README setup/run/test instructions.
- Confirm system design, API contract, and AI collaboration docs align with implementation.
- Use `planning/04-review-checklist.md` for final pre-submission review.

## Phase 6: Reviewer UI

- Add a focused React UI for VIN search and document review.
- Keep the UI aligned with the backend contract: complete, empty, partial, and failed states.
- Show source labels, request metadata, normalized document details, and audit-friendly identifiers.
- Verify the UI with component tests, Playwright E2E tests, and manual responsive checks.
