# Implementation and independent verification coordinator

Read [orchestration](../orchestration.md), [selection and minimal wrappers](../tool-selection-and-wrapping.md), and the selected route. Start only after all required source executions finish successfully or are explicitly excluded with retained evidence.

## Implementation phase

Launch one [implementer](../agents/tutorial-tool-extractor-implementor.md) per owning source module, in parallel where ownership/resources allow. Give each worker the selected tool names, concrete upstream bindings, full reference evidence, required I/O, and exclusive production/report paths. R assigns a Python/R pair per module; CLI assigns one `cli_wrapper` module.

Review handoffs for real source reuse and minimal wrappers. Scientific computation must call existing APIs/scripts or faithfully extracted source code. Check that incidental steps remain internal, useful tools are not missing, default/parameter changes are justified, and production code does not repeat algorithms for benchmarking.

Record actual implementation reports and produced-file hashes. Run the `extraction` gate after all implementation assignments finish. Stop implementation edits before verification.

## Verification phase

Launch fresh [verifier](../agents/test-verifier-improver.md) agents for the modules, distinct from every implementer in the run. Use the selected route's verifier for R/CLI. Supply source bindings and independent upstream execution evidence as well as the implementation; generated wrapper output alone cannot define expected correctness.

Verifiers test every exposed tool through MCP, compare scientific results and meaningful changed inputs, review source reuse and code quality, and perform at most six repair attempts per tool. Give them exclusive module ownership while repairing. Coordinate changes to shared production files and reverify all affected tools.

Collect reports, actual test outcomes, tested-file hashes, and per-module runtime acceptance cases. Preserve unresolved failures and explicit exclusions; no silent disappearance or weakened assertion is permitted. Final expected names must reconcile with scanner decisions and documented changes.

Run the `verification` gate and inspect substantive outcomes before writing `.pipeline/implementation_and_verification_done`. Report the verified remaining scope and failures separately. Coordinator integration begins only after all required verifier handoffs.
