# AI Collaboration Narrative

## Short Version for README

I used AI as a working assistant during the challenge, mainly for exploration and review. It helped me compare backend-first and frontend-first approaches, sketch the first API contract, and list edge cases I needed to prove with tests.

I did not treat generated output as finished work. I reviewed the code, cut back overbuilt parts, fixed UI and Docker issues when they showed up, and verified the final behavior with type checks, backend tests, UI tests, E2E checks, Docker rebuilds, and manual API calls.

The final shape is deliberately small: one REST endpoint, two mocked upstream adapters, normalized documents, audit persistence, readable logs, and tests around the failure modes that matter for Scenario D.

## Working Notes

### How I Used AI

I split the work into four passes:

1. Understand the business context and Keyloop alignment.
2. Design the API, data flow, and failure behavior.
3. Implement the backend and mocked upstream systems.
4. Verify the result with automated tests and manual review.

During design, I asked AI to compare architecture options and draft possible response shapes. During implementation, I used it for repetitive scaffolding and as a second pass over module boundaries. During verification, I used it to challenge the test plan and find missing cases.

### Design Phase

I used AI to analyze the challenge requirements and compare the four scenarios. I chose Scenario D because it maps well to Keyloop's platform direction: connecting dealership systems and making operational data easier to use.

The design pass produced this checklist:

- VIN validation.
- Parallel upstream calls.
- Normalization across different source payloads.
- Partial failure handling.
- Timeout behavior.
- Source-system transparency.
- Audit persistence.
- Readable observability.

I then narrowed the scope. One example: I chose to persist search audit records rather than storing mocked upstream documents as if they were authoritative local records.

### Implementation Phase

I used AI for repetitive implementation work:

- Server setup.
- Route scaffolding.
- Type definitions.
- Mock upstream payload examples.
- Test skeletons.
- README structure.

I treated generated code as a draft. Where it suggested heavier infrastructure or too much UI, I cut it back to the pieces needed for Scenario D.

### Verification and Ownership

I verified the solution through automated tests and manual inspection.

The tests cover:

- Combined results from Sales and Service systems.
- Source metadata on every document.
- Partial success when one upstream fails.
- Controlled error when both upstreams fail.
- VIN validation.
- Empty result handling.
- Sorting by document date.
- Duplicate document handling.
- Audit persistence.

I also checked that the API behavior matched the documented design and that logs/audit data would help diagnose upstream integration issues.

### What I Refined After AI Output

The main refinements were:

- Making partial failure an explicit first-class response state.
- Keeping source-system labels visible in every document.
- Adding audit persistence as the database-backed part of the challenge.
- Avoiding unnecessary infrastructure that would distract from the core integration problem.
- Making the response contract stable across complete, partial, and empty result cases.

### What I Owned Directly

I made the final architecture choices, checked the trade-offs, fixed broken behavior, and ran the verification steps. AI made the iteration faster, but the submitted behavior is based on inspected code and passing tests, not on generated claims.
