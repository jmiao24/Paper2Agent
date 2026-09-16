# Runtime dependencies and installation validation

Read [runtime requirements](../runtime.md), [acceptance cases](../runtime-verification.md), and the selected R/CLI route when applicable.

Identify the dependencies actually used by all generated modules and scientific child processes. Produce `src/requirements.txt` with tested resolved versions and the pinned research-package source/install location. Keep the full development environment snapshot separately. Do not list only FastMCP when wrappers or subprocesses need additional packages.

Retain required native binaries, model/data prerequisites, and source provenance. R needs its lock/bootstrap files and restoration instructions. A local checkout path is an intermediate portability limitation; final [ZIP delivery](../output-delivery.md) must include the needed implementation or a tested pinned installation method and resolve paths from the installed package or user configuration.

Create a fresh temporary runtime using the project Python version. Install the generated requirements and run dependency checks. For R restore into a separate project/library; for CLI recreate the scientific executable and its dependencies. Do not point clean validation back at development libraries or binaries without documenting that the dependency was not independently restored.

Run the same strict real-stdio cases in the fresh runtime and save `reports/mcp-clean-environment.json`. Validate scientific output contents against the saved upstream evidence. Preserve reports before removing only the temporary environment created for this check.

Record the new runtime identity, installation commands/exits, package/source identity, actual scientific checks, and unresolved external requirements. Write `.pipeline/runtime_validation_done` only after installation and runtime acceptance pass. Missing credentials/data/GPU/native dependencies remain unvalidated; tool listing does not resolve them.

Stage 6 also validates the actual extracted ZIP. The current stage's success does not establish that a later archive contains all runtime files or is relocatable.
