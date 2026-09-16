# CLI implementation and independent verification

Follow the [shared stage](../tool-extraction-and-testing.md), [CLI route](../../routes/cli.md), and [orchestration](../../orchestration.md). Use the specialists linked by the route and its native runtime/transport requirements.

Use route-specific implementers and fresh verifiers. Finish every implementation handoff before verification; record both scientific results and faithful source reuse under the shared selection rules.

All command tools share one cli_wrapper module with one implementer and one separate verifier. Invoke the configured scientific executable with bounded arguments.
