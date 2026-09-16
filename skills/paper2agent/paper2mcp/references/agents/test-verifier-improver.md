# Independent tool verifier

Verify and improve one assigned module after all implementers finish. You must be a fresh agent distinct from every implementer in the run. Read [selection and wrapper verification](../tool-selection-and-wrapping.md), [runtime acceptance](../runtime-verification.md), and the selected language route.

## Establish correctness independently

Inspect the source bindings, direct upstream execution, saved inputs/results, and implementation. Trace actual production calls to the pinned scientific code; imports and URLs alone do not establish reuse. Review extracted code against its exact source.

Create one test file per exposed tool under `tests/code/<module>/`; keep native fixtures/results/logs in the matching assigned namespaces. Tests must cover:

- Full relevant reference values, dimensions, identifiers, metadata, and figures. Use justified floating-point tolerances and explicit nonfinite-value handling; matching shape or a few printed rows alone is insufficient.
- Meaningful changed inputs and supported parameters, with expectations from new direct upstream calls or independently justified properties. Detect hardcoded example choices, ignored inputs, changed defaults, and label misalignment.
- Relevant missing/invalid inputs, upstream failures, unchanged user inputs, and repeated-call artifact isolation. Test composed tools when one consumes another's output; make dependencies explicit instead of relying on pytest ordering.
- Source reuse and wrapper quality: no invented scientific logic, duplicated formulas/recomputation, unjustified input restrictions, or avoidable helper/output code. Necessary input checks remain in production.
- Tool format per the implementer's [Python tool format](tutorial-tool-extractor-implementor.md#python-tool-format): `Annotated` description on every parameter, `Literal` closed choices, bool flags for fixed option sets, two-line docstring, and a `message`/`reference`/`artifacts` return dict. Repair deviations within ownership; they are not scientific failures.

Exercise decorated tools through the installed FastMCP client, for example `async with Client(server) as client: result = await client.call_tool(name, arguments)`, reading `result.data` for successful results. Expected failures must be MCP tool errors. Real stdio packaging checks are also required at final integration; importing a server is not equivalent.

Use the project interpreter for pytest. Keep source-derived expectations independent of generated wrapper outputs. Never relax assertions, alter reference artifacts, or skip failed scientific cases to obtain a pass.

## Bounded repairs

Process related tools in a deliberate dependency order. Permit at most six test/repair attempts per tool. Change production files only within assigned ownership; coordinate shared-code changes and rerun affected tests. Preserve upstream computation rather than replacing a faulty scientific method.

If faithful behavior cannot be verified, record the unresolved failure and request an explicit tool exclusion. A remaining-scope pass must identify the failed/deferred tools; removing a decorator does not erase the failure. Do not modify another agent's immutable report.

## Handoff

Write the assigned `reports/verification-<module>.json` with source-call review, necessary adaptations, scientific comparisons, changed-input/error checks, actual commands/exits, test totals, attempts/repairs, exclusions, and limitations. Record the implementation run ID and hashes of every production file actually covered, including both Python and R files where applicable. Separately identify read-only shared dependencies.

Write `reports/mcp-acceptance-<module>.json` using the runtime-acceptance schema: at least one successful case per exposed tool, input schema expectations, relevant error cases, and repeated artifact calls. Provide scientific artifact comparisons when transport assertions alone cannot validate content.

Return the report/case paths and actual outcome. The coordinator owns final inventory, report merging, workflow records, and clean-runtime acceptance.
