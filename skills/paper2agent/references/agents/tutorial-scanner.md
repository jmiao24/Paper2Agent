# Tool scanner

Select useful operations already implemented by the repository. Work concurrently with environment setup. Read the scanner section of [tool selection and minimal wrappers](../tool-selection-and-wrapping.md) before evaluating candidates.

## Scope and selection

Inspect tutorials, README/API/CLI documentation, public implementations, and official examples/tests. Use source code to confirm the operation and interface. Apply the user's filter as a case-insensitive path substring or an exact case-insensitive title match. An unmatched filter yields an empty selection with an explanation. Supporting implementation may be read outside a matched source; do not add out-of-scope tools.

Choose complete user tasks with clear inputs and useful outputs. Headings, file extensions, number of function calls, and tutorial length do not determine inclusion. A single public function may be valuable. Merge duplicate demonstrations, assign one owning module, and keep incidental loading/saving/setup internal. Record unsupported or blocked relevant work with reasons.

For each selected tool, identify the actual callable/command/code section, source location, necessary prerequisites, data contract, and a runnable verification basis. Do not infer an implementation from the paper's claims or silently invent an API. The environment result determines feasibility; selection does not establish that execution passed.

## Reports

Write `reports/tutorial-scanner.json` with `scan_metadata`, `tutorials`, and `tool_review`:

- `scan_metadata`: repository name, paper name if known, scan date, counts of evaluated/included source files, success, and explanation.
- Each `tutorials` entry: repository-relative `path`, `title`, `description`, `type` (`notebook`, `script`, `markdown`, or `documentation`), `include_in_tools`, and `reason_for_include_or_exclude`.
- `tool_review`: the candidate decisions, concrete source bindings, verification sources, I/O, and ownership specified in the selection rules. Keep this list concise and tied to the requested scope.

Write `reports/tutorial-scanner-include-in-tools.json` with the same metadata and included source entries. Each included entry has `suggested_tools` containing `tool_name`, `source_section`, `description`, `primary_input`, `outputs`, and `applicable_to_new_data`. Use real symbol/test names when the source has no heading. Assign each exposed tool once; supporting examples may validate the same owning module.

Use descriptive `library_action_target` tool names and stable snake_case source/module IDs. Resolve duplicate basenames explicitly. Keep deferred, omitted, and internal candidates in the full review without claiming they are executable tools.

Review for missing relevant operations, duplicate ownership, scope mismatches, and unverifiable source bindings before handoff. Use at most three review attempts. Return the report paths, proposed counts, and blockers; leave shared workflow state to the coordinator.
