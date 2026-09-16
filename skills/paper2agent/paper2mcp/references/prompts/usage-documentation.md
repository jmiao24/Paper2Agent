# Usage documentation and ZIP delivery

Write project-root `USAGE.md` from the verified tool inventory and tested runtime. Read [runtime requirements](../runtime.md), [output delivery](../output-delivery.md), and the selected route's packaging instructions. This stage produces the final tested ZIP.

Include:

- Scientific purpose and actual supported scope, including important deferred/excluded operations and required assumptions.
- Tested Python/R/native versions, pinned source, dependencies, data/model prerequisites, and runtime credentials supplied without revealing secrets.
- Installation/restoration commands runnable from the extracted package, working directory, interpreter/executable configuration, and a direct server launch command. Include any permission-restoration step needed after extraction.
- Each final MCP tool name, when to use it, required inputs, meaningful parameters/defaults, and output artifacts. Describe composition through explicit artifacts where supported. Do not require a separate examples directory or reference fixtures omitted from the package.
- Actual test/runtime outcomes and their limits, including required external services or hardware not exercised.

If documenting client registration, derive the syntax from the tested environment's `fastmcp install <client> --help`. Writing the command does not execute registration.

Check documented names, required parameters, paths, installation commands, and prerequisites against the final server and runtime. Assemble `dist/<repo-name>-mcp.zip` from explicit runtime files. Apply the output contract's extraction, clean installation, and independent real-call checks; retain `reports/delivery-validation.json` and detailed evidence outside the ZIP. An independent delivery verifier must be distinct from all implementers; a prior independent verifier may continue this work.

After successful delivery acceptance, add completion hashes for server, requirements, inventory, acceptance cases, both runtime reports, `USAGE.md`, the final ZIP, and its delivery report to workflow state. Inspect the delivery report, run the `complete` gate, and inspect its assessed scope before writing `.pipeline/delivery_done`. Package changes require renewed delivery checks.

Return the ZIP link first, delivered tools, concise installation/startup directions or usage link, actual validation scope, and external requirements. Keep intermediate artifacts in the workspace. Separate selected-tool correctness from whole-repository or paper-result claims.
