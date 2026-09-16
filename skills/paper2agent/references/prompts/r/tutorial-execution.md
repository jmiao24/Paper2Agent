# R source execution

Follow the [shared stage](../tutorial-execution.md), [R route](../../routes/r.md), and [orchestration](../../orchestration.md). Use the specialists linked by the route and its native runtime/transport requirements.

Use the route-specific executor for each selected source. Execute the actual native implementation, preserve formats/runtime identity, and merge only current individual evidence reports after every worker finishes.

R implementations own a Python wrapper and R script as a pair. Activate the chosen renv project in every R entry script.
