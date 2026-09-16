# CLI mcp integration

Follow the [shared stage](../mcp-integration.md), [CLI route](../../routes/cli.md), and [orchestration](../../orchestration.md). Use the specialists linked by the route and its native runtime/transport requirements.

Use a Python/FastMCP entry point, mount only verified tools, and run strict project-runtime stdio acceptance with scientific output comparisons. Native process dependencies remain part of the runtime contract.

All command tools share one cli_wrapper module with one implementer and one separate verifier. Invoke the configured scientific executable with bounded arguments.
