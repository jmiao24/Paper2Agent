# Environment setup and tool selection

Read [orchestration](../orchestration.md), [selection rules](../tool-selection-and-wrapping.md), and the selected route. Source setup and language/hardware routing must be recorded before this stage.

Launch the environment manager and scanner concurrently. For Python use [environment manager](../agents/environment-python-manager.md) and [scanner](../agents/tutorial-scanner.md); R/CLI use their route's roles. Give both the pinned repository, project paths, scope/filter, resource limits, and exclusive ownership. Environment changes and scanner reports have separate owners.

The scanner starts with tutorials and checks public interfaces and official examples/tests for missed useful operations. Review its concrete implementation bindings, verification sources, intended tool names, module ownership, merge/internal decisions, and blockers. The environment manager checks actual dependency/runtime readiness. Do not substitute easy demonstrations for requested operations or silently broaden a filter.

Wait for both actual lifecycle results. Inspect `reports/environment-manager_results.md`, `reports/tutorial-scanner.json`, and `reports/tutorial-scanner-include-in-tools.json`. Reconcile selection with feasible execution. Missing data/credentials/hardware remain visible, and an entirely blocked selection must not produce filler tools.

Record actual assignments, source identities/hashes, and selected execution/module IDs in schema-1 `reports/agent-runs.json` according to [workflow state](../workflow-state.md). Proposed assignments are not completed runs. A planning-only request ends with the requested plan and known limitations; it does not authorize provisioning or later execution.

Run the `setup` workflow gate and review substantive selection/environment evidence before writing `.pipeline/environment_and_selection_done`. Return selected scope, report paths, and blockers; no scientist/tool correctness claim follows from setup alone.
