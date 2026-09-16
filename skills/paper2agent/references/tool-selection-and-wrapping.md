# Tool selection and minimal wrappers

Read the scanner section at stage 1; give implementers and fresh verifiers their sections at stage 3. The coordinator applies the handoff checks. These selection, tool-boundary, parameter, and implementation requirements apply to Python, R, and CLI. Each route specifies its runtime and transport.

Every exposed tool must be traceable to an existing implementation in the pinned repository. Select and combine useful existing operations; keep generated scientific computation tied to those operations.

## Scanner: useful operations with concrete sources

Start with the tutorials, then check the README, public API/CLI entry points, and official examples/tests for relevant operations the tutorials miss. Inspect the implementation behind each candidate. A Markdown file or notebook must not prevent reading Python/R scripts or tests. Match an explicit source/tutorial filter by case-insensitive path substring or exact case-insensitive title: supporting source may be read outside it, but additional tools outside that scope must not be selected. Report an unmatched filter instead of broadening it.

Choose tool boundaries by user tasks:

- Expose an operation when it has a distinct use on new inputs and meaningful outputs. One upstream call can implement a valuable tool; code length and call count are not selection criteria.
- Treat headings as navigation. Several sections can support one tool; one section can contain several independently useful operations. Cover the selected tasks and their prerequisites, rather than requiring one tool per section or per analytical step.
- Keep loading, format conversion, saving, and demonstration setup internal unless independently useful for the requested work. A reusable intermediate operation or scientific visualization can be a tool when its separate use is justified.
- Merge duplicate operations across tutorials. Assign one owning source module and reference supporting examples; do not generate a wrapper for every repeated demonstration. Group tools by their owning source module; CLI has one `cli_wrapper` owner.
- Review the repository's main relevant operations, without cataloguing every private helper or imposing a tool quota. Retain useful but blocked work with the missing data, dependency, implementation, or verification evidence identified. Do not fill the inventory with easier, less relevant operations.

For each candidate, keep a short table or list in the scanner's handoff report:

| Record | Required substance |
| --- | --- |
| Task and I/O | What the user accomplishes, required inputs, and useful outputs. |
| Implementation | Actual repository path plus callable symbol, bounded command, or existing code section; use the run's pinned source revision. |
| Verification source | Existing example/test or documented call with traceable input data, and what result will be compared. |
| Decision and reason | Expose, keep internal, merge into a named tool, defer with a blocker, or omit with a reason. |
| Ownership | For exposed tools, one intended MCP name and source module; supporting execution sources may be shared. |

Use the scanner inventory filenames and fields defined in the [scanner role](agents/tutorial-scanner.md). If the scanner's handoff is its JSON inventory, add this review as a `tool_review` field in the full inventory; do not duplicate it in the filtered inventory. The filtered inventory's `suggested_tools` contains only tools assigned to that source. For an API example or test, `source_section` can identify the real symbol/test name instead of a heading. Record execution/module assignments in workflow schema 1.

An official example/test outside a tutorial may become an execution assignment in the `tutorials` collection: record its actual source path/hash and use the selected route's source-execution evidence and reporting contract. A documented API can use a small driver that loads traceable inputs and calls that API directly. The executor must retain the upstream source mapping and real results; a proposed call or passing import is insufficient. If no defensible runnable reference exists, defer the candidate. Never invent a tutorial, data provenance, algorithm, or expected result to fill that gap.

## Implementer: reuse first, then adapt I/O

Read the selected source and execution evidence before writing the wrapper. Use this implementation order:

1. Call an existing public Python/R API directly.
2. Invoke an existing script or bounded CLI command when that is its intended interface; preserve the selected route.
3. If the operation exists only as tutorial/script code without a callable interface, extract the necessary code and prerequisites with source attribution. Preserve its computation while adapting input/output handling. Do not copy an available package implementation into the wrapper.
4. If implementing the operation would require inventing scientific computation, report the gap and defer it. Paper-to-code implementation is outside this conversion task.

The usual wrapper is: parse inputs, perform necessary contract checks, call upstream code, and serialize useful results. In particular:

- Keep checks for valid input structure, identifier alignment, required metadata, supported parameters, and errors that would otherwise produce misleading results. Preserve upstream assumptions, defaults, units, and error meaning. Do not silently repair scientific inputs or impose stricter admissibility rules without source-backed justification.
- Do not duplicate an algorithm or run it a second time merely to validate the first call. Full recomputation, weight previews, and benchmark comparisons belong in tests. Keep necessary cheap precondition checks or source-backed guards where they prevent invalid results; do not remove them just to shorten code.
- Expose the parameters needed for the chosen task. A parameter absent from a tutorial may be added when it exists in the pinned API/CLI, has a clear user need, and is tested. Do not expose every upstream option by default or invent scientific parameters. Use a seed only when the actual runtime supports the promised behavior.
- Move example-only paths, labels, downloads, and benchmark preparation out of production computation. Follow the metadata-input and notebook-cleanup requirements in [runtime requirements](runtime.md).
- Return the useful native result/artifacts and a concise summary where helpful. Avoid duplicate tables, intermediate dumps, extra plots, and unused generic helpers unless needed by users, downstream tools, or an explicit requirement. Generate shared helpers only for actual reuse; do not build an additional framework around a few calls. Figures belonging to the selected scientific task remain outputs; held-out-truth or benchmark-only figures remain reference evidence unless evaluation itself is a selected task.

In the implementation report, map each exposed tool to its upstream calls or extracted code location, record the I/O adaptations, and explain any added scientific transformation or parameter/default change. A transformation must be present in the selected upstream workflow or explicitly requested and separately validated. An upstream defect is not permission to write a replacement method during wrapper repair.

## Independent verifier: results and implementation fidelity

Use a fresh agent distinct from every implementer, after all implementation handoffs. In addition to the scientific and runtime checks:

1. Trace every exposed tool through the actual code to its bound upstream implementation. An import or source URL alone does not establish reuse. For extracted code, compare the calculation and prerequisites with the original section.
2. Obtain expected results from direct upstream execution on the same inputs, independently of the generated wrapper. Preserve tutorial comparisons and add meaningful changed inputs/parameters and relevant failures. Establish changed-input expectations through independent direct upstream calls or justified scientific properties. Test composition when tools exchange artifacts.
3. Review the wrapper for duplicated formulas, unnecessary recomputation, ignored parameters, altered defaults, unjustified input restrictions, and avoidable output/helper code. Distinguish required scientific checks from diagnostic or benchmark work. Numerical agreement on one example does not waive this review.
4. Repair within the assigned module and the bounded retry policy. Preserve upstream behavior and rerun affected tests after repairs, including dependent tools when shared code changes. If faithful reuse cannot be established, retain the failure and exclude/defer the tool explicitly.

Record source reuse, necessary adaptations, remaining deviations, and actual test outcomes in the verification report. Do not impose a line-count limit or treat the mere presence of a function call as proof of a faithful wrapper.

## Coordinator handoffs

- Before execution, review usefulness, concrete implementation bindings, duplicate ownership, and verification feasibility; keep blocked or omitted relevant work visible.
- Before implementation, supply each worker its selected tools, source bindings, completed evidence, and exclusive module ownership. All execution assignments finish first.
- Before mounting tools, reconcile the scanner's selected names with verified tools and explicit merges/exclusions. A tool must not disappear silently or be added merely because it was easy to implement. Coverage means the selected useful tasks, not every tutorial section or repository function.
- Keep environment/scanner concurrency, parallel executors and implementers, and fresh independent verifiers. Use workflow schema 1 and the report/marker paths and runtime checks defined by orchestration. The workflow helper checks recorded assignments and hashes; the coordinator and verifier perform the selection and code review above. Do not claim the helper automatically enforces those judgments.
- For resumes, preserve successful history. If selection or code changes, record the revised decision and rerun affected phases under the [orchestration handoff rules](orchestration.md). Summarize merged, internal, deferred, and excluded work in the final report and `USAGE.md` where it affects supported scope.
