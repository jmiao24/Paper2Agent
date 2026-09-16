# Command-line route

Read only for `language=cli`. Select this route by the documented user interface, even when the executable is implemented in Python or R. Python/FastMCP wraps bounded, documented commands.

## Stage routing

| Stage | Coordinator | Specialists |
| --- | --- | --- |
| 1. Setup and discovery | [setup-and-discovery](../prompts/cli/setup-and-discovery.md) | Environment role below and [tutorial-scanner-cli](../agents/cli/tutorial-scanner-cli.md) concurrently |
| 2. Execute examples | [tutorial-execution](../prompts/cli/tutorial-execution.md) | [tutorial-executor-cli](../agents/cli/tutorial-executor-cli.md), one per selected command/example |
| 3A. Extract | [tool-extraction-and-testing](../prompts/cli/tool-extraction-and-testing.md) | One [tutorial-tool-extractor-cli](../agents/cli/tutorial-tool-extractor-cli.md) owns `src/tools/cli_wrapper.py` |
| 3B. Verify and improve | Same stage 3 coordinator, after extraction completes | One fresh [test-verifier-cli](../agents/cli/test-verifier-cli.md) owns verification of that module |
| 4. Integrate | [mcp-integration](../prompts/cli/mcp-integration.md) | Coordinator |
| 5–6. Requirements, usage, and ZIP delivery | Shared prompts linked in [SKILL.md](../../SKILL.md) | Coordinator and independent delivery verifier |

Run environment preparation and scanning in parallel. After both finish, run independent example executions in parallel; after all executions finish, assign one shared wrapper implementer and then a distinct verifier. Do not launch concurrent writers of `cli_wrapper.py`. Use shared markers, handoff records, and [runtime requirements](../runtime.md).

Apply the shared [selection and minimal-wrapper rules](../tool-selection-and-wrapping.md) to documented commands, examples, and tests. Select independently useful commands or documented command sequences, merge duplicate demonstrations, and keep setup/internal steps out of the tool inventory. Implement by invoking the original executable; the verifier also checks that its scientific logic has not been recreated in the wrapper.

## Environment

- Python backend: use [environment-python-manager](../agents/environment-python-manager.md) and the project interpreter for scripts. Install console entry points in that environment and resolve them there.
- R backend: use [environment-r-manager](../agents/r/environment-r-manager.md) with the environment and runtime isolation requirements in the [R route](r.md). Execute the original CLI with that R runtime; do not extract its internals into an R-library workflow.
- Other backend: the coordinator prepares the Python wrapper environment while the scanner runs, and follows the repository's documented binary/build setup. Record executable version, build/source identity, and system dependencies. The route supports runnable documented commands; discovering a C++ or Java file alone is insufficient.

Use README/wiki examples and source argument definitions as the primary contract. Once the environment is ready, check the supported help/version invocation; do not invent `--help` for a program without that flag. Resolve documentation/code disagreement against the pinned version and record it.

## Real execution and reference outputs

Retain the executed command/driver, documentation, inputs, outputs, and logs. A notebook is optional; an unexecuted script or documentation is not reference evidence. Every selected command needs real execution, captured exit status, and preserved outputs before extraction/testing.

When using a notebook, use the project's Python kernel for orchestration and explicit executables inside command cells. A `%%bash` cell must propagate the command's failure (`set -e`/appropriate pipeline handling or an explicit status check); a trailing successful command must not hide a nonzero exit. Do not search for the word “error” in arbitrary output as a substitute for checking status and notebook error outputs. Use distinct Papermill input/output files per shared runtime requirements.

Use repository-provided data, documented downloadable data, or the tutorial's actual generator. Do not substitute arbitrary random tables for required domain data. If suitable data or required services are unavailable, record `documented`/blocked status and exclude the command from the verified inventory. Do not report successful scientific execution. Preserve native input formats; a CLI using BAM, HDF5, or another format does not need fabricated CSV fixtures.

Keep each executor's inputs, outputs, commands, reports, and completion markers in its assigned namespace. Preserve original data and expected outputs; wrappers write separate results. Record executable identity, working directory, supported arguments, exit code, and output paths, excluding credential values. Expose a reproducibility seed only when supported; do not invent a CLI flag or assume all random generators share a seed implementation.

## Wrapper implementation

- For the `src/tools/cli_wrapper.py` layout, the generated project root is `Path(__file__).resolve().parents[2]`; `parent.parent / "repo"` incorrectly points under `src/`. Resolve the original checkout and executables from the documented installation layout.
- Use argument lists with `shell=False`. Keep executable/subcommand selection in code; expose typed scientific parameters rather than a free-form shell command. Pass Python scripts with `sys.executable`, R scripts with the recorded Rscript/library configuration, and other binaries through their validated executable paths.
- If an environment variable or installation setting overrides the executable, check its identity/version using the recorded supported invocation. An executable bit and exit code zero alone are insufficient: an unrelated program can return empty output that looks like a valid empty scientific result. Report incompatible runtime overrides as tool errors.
- Resolve user input paths before changing subprocess `cwd`. Put each call's results in its own directory and return the real absolute artifact paths. Preserve the CLI's required working-directory behavior; do not assume every CLI accepts an output-directory flag.
- Capture stdout/stderr and check exit status and timeout. A failed process must become a clear MCP tool error; a successful transport with an error-shaped dictionary is insufficient. Retain useful bounded diagnostics without printing them on the server's protocol stdout.
- Expose the CLI's declared output contract. A stdout-oriented command may return parsed text/data; file-producing tools must return validated artifacts. Do not invent output filenames or numerical summaries from documentation alone.

## Testing and packaging

The fresh verifier executes the real subprocess through MCP using the saved examples. Compare returned values and output contents against the standalone command's reference outputs. Use the shared client pattern instead of direct calls to decorated tools. Keep one test file per tool and the bounded repair/exclusion policy.

Include failures for invalid required inputs or nonzero exit, a timeout where practical, repeated calls, and supported paths containing spaces. Tests must detect swallowed subprocess failures and wrong-runtime execution. Expected-error tests require MCP error responses, not a successful transport containing an error-shaped dictionary.

Stage 5 must include dependencies used **inside** child processes, even if Python wrappers import only `subprocess`. Pin the scientific CLI package or document a pinned checkout/build; retain external binary, model, and data prerequisites. R-backed commands also need the R lock/restore procedure.

Recreate those dependencies in the validation runtime and run the shared stdio acceptance cases. `--help` and tool listing alone do not establish a working CLI conversion. Document runtime paths and portability limits in `USAGE.md`.
