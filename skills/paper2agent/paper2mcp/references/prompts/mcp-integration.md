# MCP integration

Integrate the independently verified tool modules into `src/<github_repo_name>_mcp.py`. Read [runtime requirements](../runtime.md), [runtime acceptance](../runtime-verification.md), and the selected route's integration requirements.

1. Confirm successful verification records and unchanged tested production hashes. Inspect all generated modules for import/startup failures, including unmounted modules. Resolve the verified inventory from scanner decisions, test reports, and explicit exclusions.
2. Create a small FastMCP entry point that imports and mounts the module servers. Account for mount prefixes and prevent duplicate names. Configure process start methods or numerical thread limits only where the tested scientific runtime requires them; keep diagnostics off protocol stdout.
3. Write `reports/expected-mcp-tools.json` as the intended nonempty list of unique final names, independently of the server's discovery response. Merge verifier cases into `reports/mcp-acceptance-cases.json` with positive coverage of every tool, schema checks, relevant errors, and repeated artifact calls.
4. Run `scripts/verify_mcp_server.py` from the installed skill using the project interpreter, real stdio, `--cases`, and `--require-all-tools`. Save `reports/mcp-project-environment.json`. A successful import or inventory-only run does not satisfy acceptance.
5. Inspect returned native artifact contents with the scientific comparisons, including dependent workflows where appropriate. Inventory/schema/existence checks alone do not establish scientific correctness.

Retain actual command outcomes and failures. Any production repair requires affected independent verification before accepting the new server revision. Write `.pipeline/mcp_integration_done` only when project-runtime acceptance and scientific artifact checks pass.
