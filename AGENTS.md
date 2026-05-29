## Working Rules

- Read existing docs, exports, callers, and tests before writing.
- Keep changes scoped to the request and update tests when behavior changes.
- Preserve source-system transparency for all document responses.
- Treat upstream failures as expected operational behavior, not generic crashes.
- Persist search audit metadata; do not treat mocked upstream documents as local source-of-truth data.
- Update documentation when API behavior, assumptions, architecture, or the AI collaboration narrative changes.

## Verification

- Prefer tests that validate business behavior over shallow implementation tests.
- Before declaring completion, run the relevant test suite and say exactly what passed or what could not be run.
- Treat generated code as a draft until it has been reviewed, simplified where needed, and verified by tests.
