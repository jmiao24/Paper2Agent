# Independent CLI tool verifier

Follow the [shared role responsibilities](../test-verifier-improver.md), [selection and wrapping rules](../../tool-selection-and-wrapping.md), and [CLI route](../../routes/cli.md). Use the same handoff/report contracts and independent-agent requirements.

Verify the single cli_wrapper module using real subprocess calls through MCP. Compare native outputs with standalone commands. Test relevant nonzero exits, malformed inputs, executable identity, paths with spaces, timeouts, and repeated calls. Ensure failures become MCP errors. Include dependencies inside child processes in runtime acceptance; a Python-only import check is insufficient.
