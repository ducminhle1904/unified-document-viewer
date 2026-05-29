# AI Collaboration Narrative

## Short Version for README

I used AI agents as engineering collaborators throughout the challenge, but kept ownership of the architecture, trade-offs, verification, and final code quality. I used AI to explore design options, draft API contracts, generate boilerplate, identify edge cases, and review test coverage. I then validated the output by inspecting the implementation, refining the failure-handling model, adding tests for core business behavior, and running the application locally.

The most useful AI contribution was speed: it helped me compare approaches quickly and uncover scenarios I might otherwise have missed, such as partial upstream failure, timeout behavior, duplicate documents, and audit persistence. The final decisions remained human-owned: I chose a backend-first design because Scenario D is primarily an integration and reliability problem, and I kept the implementation focused on a clear REST contract, parallel upstream aggregation, normalized document output, structured logs, and persisted audit records.

## Detailed Version for Submission

### Strategy

My AI strategy was to use agents for acceleration and challenge coverage, not as a replacement for engineering judgment.

I divided the work into four phases:

1. Understand the business context and Keyloop alignment.
2. Design the API, data flow, and failure behavior.
3. Implement the backend and mocked upstream systems.
4. Verify the result with automated tests and manual review.

In each phase, I used AI differently. During design, I asked AI to compare architecture options and produce candidate API contracts. During implementation, I used AI to generate boilerplate and suggest module boundaries. During verification, I used AI to review the test plan and identify missing edge cases.

### How AI Helped in the Design Phase

I used AI to analyze the challenge requirements and compare the four scenarios. I chose Scenario D because it best matches Keyloop's platform philosophy: connecting dealership systems, reducing fragmented workflows, and making data available through a unified operational interface.

AI helped generate an initial list of design concerns:

- VIN validation.
- Parallel upstream calls.
- Normalization across different source payloads.
- Partial failure handling.
- Timeout behavior.
- Source-system transparency.
- Audit persistence.
- Structured observability.

I then refined the scope to keep the solution realistic for a technical challenge. For example, I chose to persist search audit records rather than storing mocked upstream documents as if they were authoritative local records.

### How AI Helped in the Implementation Phase

I used AI to accelerate repetitive implementation work:

- Server setup.
- Route scaffolding.
- Type definitions.
- Mock upstream payload examples.
- Test skeletons.
- README structure.

I treated AI-generated code as a draft. I reviewed the code for clarity, correctness, and maintainability before accepting it. Where the AI suggested over-engineered options, I simplified the implementation to keep the challenge focused.

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

### Final Ownership Statement

AI helped me move faster, but I remained responsible for the final design and implementation. I made the architecture decisions, confirmed the trade-offs, validated the edge cases, and ensured the solution matched the business problem: giving dealership users a single reliable view of vehicle documents across fragmented systems.
