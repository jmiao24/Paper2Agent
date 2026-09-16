# R route

Read only for `language=r`, or the environment/runtime sections for an R-backed CLI. The MCP server remains Python/FastMCP; scientific computation calls the original R package through `Rscript`.

## Stage routing

| Stage | Coordinator | Specialists |
| --- | --- | --- |
| 1. Setup and discovery | [setup-and-discovery](../prompts/r/setup-and-discovery.md) | [environment-r-manager](../agents/r/environment-r-manager.md) and [tutorial-scanner-r](../agents/r/tutorial-scanner-r.md) concurrently |
| 2. Execute tutorials | [tutorial-execution](../prompts/r/tutorial-execution.md) | [tutorial-executor-r](../agents/r/tutorial-executor-r.md), one per tutorial |
| 3A. Extract | [tool-extraction-and-testing](../prompts/r/tool-extraction-and-testing.md) | [tutorial-tool-extractor-r](../agents/r/tutorial-tool-extractor-r.md), one per source file |
| 3B. Verify and improve | Same stage 3 coordinator, after all extraction completes | Fresh [test-verifier-r](../agents/r/test-verifier-r.md) instances, one per source file |
| 4. Integrate | [mcp-integration](../prompts/r/mcp-integration.md) | Coordinator |
| 5–6. Requirements, usage, and ZIP delivery | Shared prompts linked in [SKILL.md](../../SKILL.md) | Coordinator and independent delivery verifier |

Use the completion markers and agent handoffs in [orchestration](../orchestration.md), together with shared [runtime requirements](../runtime.md).

Use the shared [selection and minimal-wrapper rules](../tool-selection-and-wrapping.md) for scanning, extraction, and independent verification. Inspect public exports and official examples/tests for missed useful operations; each exposed tool must call existing R code. This route specifies the R runtime and Python–R transport.

## Environment and dependency ownership

- Bind the actual R package name from `DESCRIPTION` or tutorial `library()` calls; it need not equal the repository basename. Discover explicit R and Rscript executables and record their versions and system-library requirements. Select an R version supported by the scientific package and its dependencies.
- Keep the Python MCP environment at `<project-root>/<repo-name>-env`. Select its interpreter to satisfy the scientific dependencies and shared runtime requirements.
- Use a dedicated `<project-root>/r-runtime/` renv project and its isolated package library. Bootstrap renv into a project-owned library if needed. Restore a supplied repository lockfile before adding the selected tutorials' dependencies; otherwise initialize an empty renv project, install actual dependencies and the source package, then snapshot the tested library. Keep the upstream checkout's lockfile unchanged.
- `pak` may assist installation into the selected library, but must not bypass its lock/provenance. Serialize dependency changes through the environment manager.
- Record the R version, renv version, repositories (including Bioconductor release when used), installed package versions, library paths, system dependencies, and research-package source commit. Include dynamically loaded/runtime-only packages when snapshotting; source scanning alone can miss them.
- If a package is installed from a local path, retain the source checkout or source archive and its hash with documented restore instructions. Do not call it portable merely because a lockfile exists.

renv's [restore API](https://rstudio.github.io/renv/reference/restore.html) accepts explicit project, library, and lockfile locations. Its [path settings](https://rstudio.github.io/renv/reference/paths.html) allow project-owned caches and libraries. Read the installed version's help before generating exact setup commands.

## Tutorial execution and fixtures

Use vignettes, R Markdown/Quarto, scripts, documented package examples, or tests that exercise the selected API. Execute native R scripts directly when appropriate. For notebook evidence, retain relevant chunk options, ordering, the complete executed notebook, and scientific figures.

For notebook execution, register a project-specific IRkernel with the selected R executable and library. Use that exact name in notebook metadata, every Papermill command, and execution reports. Verify `R.version.string` and `.libPaths()` inside the running kernel. Activate the same renv project there that runtime wrappers use.

Generate fixtures with the selected source's actual R data-generation/loading code and retain `data.R` for preparation. Equal seed numbers in different languages do not imply identical random values. Replay the upstream R computation with saved inputs and compare against its reference results.

Use CSV/TSV for suitable tables and RDS for R objects that would lose class, attributes, dimensions, or sparse structure in a table. Document sample/feature orientation, identifiers, factor levels, and missing-value handling. Do not flatten a model object to CSV just to fit a template.

## Extraction and the Python–R contract

Judge an R tool by its independently useful scientific operation. One public function call can be sufficient; do not pad the analysis with extra operations.

Choose useful task boundaries under the shared selection rules and keep one pair of files per owning tutorial/example source module (duplicates share an owner):

- `src/r_scripts/<tutorial>.R`: original package calls and function dispatcher;
- `src/tools/<tutorial>.py`: typed MCP wrappers and subprocess handling.

Wrap the actual R public API; do not reimplement its mathematics in Python. Match scalar/vector parameters to that API, and document file inputs for large matrices or complex objects. Read demonstration-independent group labels from explicit user metadata as specified in the shared runtime requirements.

Resolve R scripts relative to the generated module's location. Bind an explicit Rscript executable and an absolute renv project path in the launcher; allow documented `P2A_RSCRIPT` and `P2A_R_PROJECT` overrides so clean-environment validation and relocation can select their own runtime. Default the R project to the generated project's `r-runtime/`. Never silently fall back to an untracked user library.

Use subprocess argument lists with explicit `cwd`, captured output, and a bounded timeout. Pass values as data arguments, not interpolated R expressions. Each R entry script must activate the chosen renv project before loading packages. If using `--vanilla`, explicitly source that project's `renv/activate.R`; do not assume `.Rprofile` ran. Report startup/library failures clearly.

Use a small fixed argument, JSON, or optparse dispatcher suited to the contract; pass user values as data. Include whichever parser dependencies the implementation actually uses in the runtime lockfile.

**Use a file-based result contract:** R writes declared CSV/TSV/RDS/figure artifacts; Python checks successful exit, reads appropriate result summaries, and returns MCP-serializable metadata and absolute artifact paths. R stdout/stderr are captured diagnostics. Do not force an existing documented machine-readable CLI to change its output format; that belongs to the CLI route.

Specify conversions for missing/non-finite values, vector lengths, identifiers, and factors. Return large or opaque objects as artifacts rather than oversized JSON. Validate actual file contents, not just existence. Raise clear tool errors for unsuccessful R execution; keep subprocess diagnostics off the MCP server's stdout. Use a fresh output directory per invocation.

## Verification and runtime packaging

The separate verifier must execute Python MCP → Rscript → original R package → result artifacts with actual tutorial data. Use the shared FastMCP client pattern for decorated tools. Compare values, dimensions, identifiers, and relevant plots against the executed R tutorial. Include input-contract failures and repeated-call artifact checks.

At stage 5, generate Python runtime requirements from actual imports, including pandas if used. Include all actual Python dependencies. Also ship `r-runtime/renv.lock`, activation/bootstrap files, research-package provenance, and native-runtime setup instructions.

Validate with **both** a fresh Python environment and a separate R project/library restored from the recorded lockfile. Override the launcher to use the restored R project, check the active library paths, and rerun real MCP acceptance calls. Reusing the development R library establishes only Python installation success. Record restoration failures and missing system dependencies explicitly; do not mark stage 5 complete until both runtimes pass.

A separate runtime lockfile may omit notebook and test packages when it retains every dependency used by the MCP-to-R computation. Keep the full development lockfile for tutorial replay, identify which lockfile was restored, and retain sources/provenance for both. A documented package cache may accelerate restoration into the separate library; do not point validation back at the development library.

Document Rscript selection, R/OS compatibility, lockfile restoration, source-package availability, inputs/outputs, and the tested launch command in `USAGE.md`. R scientific support is validated per converted repository; adding this route alone does not establish it for every R package.
