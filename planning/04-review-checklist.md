# Best Practices for the Scenario D Submission

## Product and Design Best Practices

- Keep the solution centered on dealership workflow continuity.
- Explain that the problem is not just document display; it is reducing system switching and manual reconciliation.
- Preserve source-system labels so users can trust the result.
- Make assumptions explicit in the system design document.
- Avoid overbuilding features that the challenge did not request.

## API Contract Best Practices

- Use a single clear endpoint: `GET /api/vehicles/:vin/documents`.
- Keep response shapes stable for complete, partial, and empty results.
- Use explicit status values: `complete`, `partial`, `failed`.
- Include `requestId` in responses and logs.
- Include upstream status metadata in the response for transparency.
- Return controlled error bodies with stable error codes.

## Integration Best Practices

- Call Sales System and Service System in parallel.
- Use adapter modules for each upstream system.
- Normalize source-specific payloads into one internal document model.
- Apply per-upstream timeouts.
- Treat upstream failures as expected operational events.
- Return partial results when one source succeeds.
- Avoid leaking upstream implementation details into the public API.

## Data and Persistence Best Practices

- Persist search audit metadata rather than treating mocked documents as owned local data.
- Record the final search status and each upstream status.
- Store latency, result count, warning count, and timestamp.
- Use persisted records to support the observability story in the README and video.

## Error Handling Best Practices

Recommended behavior:

- Invalid VIN: HTTP 400, no upstream calls.
- One upstream fails: HTTP 200, partial response, warning metadata.
- Both upstreams fail: HTTP 502, controlled error body.
- Empty results: HTTP 200 with `documents: []`.
- Timeout: upstream failure with `UPSTREAM_TIMEOUT`.

Avoid:

- Returning a generic 500 for normal integration failures.
- Hiding partial failure.
- Returning inconsistent response shapes.
- Mixing source-specific fields directly into the normalized document model.

## Testing Best Practices

Prioritize tests that prove business behavior:

- Valid VIN returns combined documents.
- Each document includes a source system.
- Results are sorted newest first.
- Duplicate documents are removed.
- One upstream failure returns partial results.
- Both upstream failures return controlled error.
- Invalid VIN returns validation error.
- Empty upstream results do not crash.
- Audit records are persisted for complete, partial, and failed searches.

If time is limited, prefer a smaller number of meaningful integration tests over many shallow unit tests.

## Observability Best Practices

For the challenge, structured logs plus audit persistence are enough.

Minimum log fields:

- `requestId`
- `vin`
- `source`
- `status`
- `latencyMs`
- `documentCount`
- `errorCode`

README explanation:

- In production, these logs could feed metrics dashboards.
- Request IDs would support tracing across the aggregation service and upstream systems.
- Audit records would help support teams diagnose recurring source-system failures.

## README Best Practices

README should include:

- Project overview.
- Chosen scenario and why.
- Tech stack and rationale.
- Setup instructions.
- Run instructions.
- Test instructions.
- API examples.
- Assumptions and trade-offs.
- AI Collaboration Narrative.

Keep the AI narrative practical. Reviewers should see that AI was used strategically, while final ownership stayed with the engineer.

## Video Best Practices

Suggested 5-10 minute structure:

1. Intro and chosen scenario: 30-45 seconds.
2. Product framing and Keyloop alignment: 60 seconds.
3. Architecture walkthrough: 2 minutes.
4. Implementation highlights: 2 minutes.
5. Test and failure-handling demo: 1-2 minutes.
6. AI collaboration story: 1-2 minutes.
7. Lessons learned and trade-offs: 30-60 seconds.

Key message:

> I used AI to accelerate exploration and implementation, but I owned the design decisions, validation, tests, and final quality.

## What to Avoid

- Do not submit only a happy-path implementation.
- Do not make the UI the main story if choosing backend.
- Do not omit tests.
- Do not hide how AI was used.
- Do not claim real Keyloop API integration.
- Do not overcomplicate with microservices, queues, or cloud infrastructure unless implemented cleanly.
- Do not use vague observability language without concrete logs or audit records.
