# Source execution coordinator

Establish reference results for selected tools using parallel execution specialists. Read [orchestration](../orchestration.md), [runtime requirements](../runtime.md), and the selected route. Begin after setup succeeds.

Use the scanner's selected source entries, concrete tool bindings, source/module IDs, data requirements, and supported project runtime. Assign one [executor](../agents/tutorial-executor.md) per selected source (use the R/CLI role when applicable), with exclusive evidence/report paths. Provide runtime credentials through the process environment, never by inserting literal keys into source or reports.

Each executor runs the bound upstream implementation, saves traceable inputs and native outputs, and checks replay from saved inputs. It retains full executed notebooks when notebooks are used; scripts or commands may retain native execution evidence. Relevant scientific figures are part of the reference; benchmark-only plots do not automatically become production outputs.

Wait for every worker result. Collect actual lifecycle outcomes, commands, exit statuses, comparisons, and blockers. Use at most five attempts per source within resource limits; do not poll forever for a failed worker or repeat an unchanged external blocker. Serialize package additions through the environment manager.

Merge only the assigned current `reports/executed_notebook_<id>.json` reports into `reports/executed_notebooks.json`, keyed by source ID. Verify that each successful entry points to retained execution code, inputs, full results, runtime/source provenance, and actual replay checks. Preserve failed attempts and record justified exclusions; workers must not rewrite the shared index or scanner selection.

Update workflow run records and hashes. Run the `execution` gate and inspect scientific evidence before writing `.pipeline/reference_execution_done`. All required execution handoffs must finish before any implementation begins.
