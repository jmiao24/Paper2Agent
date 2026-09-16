# Runtime requirements

Use isolated project environments, explicit interpreters, and real MCP calls. The R and CLI routes specify their native runtimes and transport. The dependency versions below are a tested baseline; resolve them against each research repository's requirements.

## Stage 1: environment and tests

Install the requested repository implementation, verifying the imported module/package origin and source version. Use a published distribution only when it is confirmed to belong to the requested project; a matching package name alone is insufficient. For a supplied local checkout or pinned commit, retain its exact source identity.

Apply [tool selection and minimal wrappers](tool-selection-and-wrapping.md) to tutorial scanning and the supplementary public-interface/example check. Existing notebooks or Markdown do not exclude Python/R source or tests from inspection. Keep exact user scope and explicit filters; never replace an excluded or unmatched request with unrelated tools. Every selected tool needs an existing implementation and a defensible verification source.

Use `fastmcp==4.0.3` as the tested core API baseline. Resolve it together with the research package's requirements before running tutorials. FastMCP 4 requires newer dependencies, including Pydantic >=2.12; do not silently upgrade incompatible research requirements or bypass the resolver. If the scientific package conflicts, report the conflict and choose a compatible, explicitly recorded FastMCP version only after verifying its API behavior with the same checks.

Install into the explicit project interpreter:

```bash
uv pip install --python "$PROJECT_PYTHON" 'fastmcp==4.0.3' pytest pytest-asyncio
uv pip check --python "$PROJECT_PYTHON"
uv pip freeze --python "$PROJECT_PYTHON" > reports/environment-requirements.txt
"$PROJECT_PYTHON" --version > reports/python-version.txt
```

For notebook evidence, also install the needed `papermill`, `nbclient`, `ipykernel`, and `jupytext` packages. Include image-comparison packages when the selected scientific checks use them. Refresh the environment snapshot after these additions.

`PROJECT_PYTHON` is the absolute `<project-root>/<github_repo_name>-env/bin/python`. Select the Python version from the scientific repository's requirements, matching its supported Python versions. Record actual resolved dependency versions; do not describe untested combinations as validated. Refresh the snapshot after any dependency changes during execution/testing. Keep this full environment snapshot separate from the runtime-only requirements generated at stage 5.

When writing `pytest.ini`, use `[pytest]`; `[tool:pytest]` belongs to `setup.cfg`. Run tests through the selected interpreter:

```bash
"$PROJECT_PYTHON" -m pytest tests/code/
```

## Stage 2: execution evidence and notebook kernels

Native scripts and commands may run directly using the selected runtime. Retain the driver, command/exit status, saved inputs, results, and runtime provenance; set `execution_path` to that actual execution file. The notebook requirements below apply when notebook evidence is used.

Preserve every figure the actual tutorial produces. For a tutorial that produces no plots, mark figure extraction/comparison not applicable and retain its numerical or structural evidence. Do not invent plots to meet a fixed count.

For Python and CLI orchestration notebooks, register and use the same kernel name. R notebooks use the IRkernel setup in the R route:

```bash
"$PROJECT_PYTHON" -m ipykernel install --prefix "$PROJECT_ENV" --name "$PROJECT_KERNEL" --display-name "Python ($PROJECT_KERNEL)"
"$PROJECT_PYTHON" -m papermill "$INPUT_NOTEBOOK" "$OUTPUT_NOTEBOOK" --kernel "$PROJECT_KERNEL"
```

`PROJECT_ENV` is the absolute project environment directory. `PROJECT_KERNEL` is the repository-specific kernel name registered under its `share/jupyter/` directory. Use the same environment to run Papermill so it discovers that kernelspec. Verify its kernelspec interpreter matches `PROJECT_PYTHON`. If another output project already uses that name with a different interpreter, choose a unique project-specific name and use it consistently. Apply this to every execution, including the benchmark-data re-execution.

Keep `<tutorial_name>_execution_final.ipynb` complete. Extract figures from it and create `<tutorial_name>_inspection.ipynb` with the preprocessing helper for agent reading. Apply any additional large-output stripping only to the inspection copy. Set `execution_path` to the complete final notebook. After benchmark data changes, re-execute to a temporary output notebook, verify success, then replace the final notebook and regenerate figures/inspection copy. Never run Papermill with identical input and output paths.

## Stage 3: extraction and test execution

Load the extractor reference for extraction, then the verifier reference for testing. Both phases remain mandatory. Use the full executed reference and saved scientific artifacts for expected results. Exercise decorated tools using `Client(server)`, `await client.call_tool(...)`, and successful `result.data`. Match assertions to the actual declared return structure.

Apply the implementer and independent-verifier sections of [tool selection and minimal wrappers](tool-selection-and-wrapping.md). Direct upstream calls take priority over copying package internals or automatic notebook-to-module conversion. Keep required input/metadata checks, but place benchmark recomputation in tests. Cover selected tasks and their necessary internal prerequisites; each tutorial step does not need a separate tool. Code review and changed-input comparisons are required alongside the original tutorial results.

Generate a fresh output directory or collision-resistant identifier inside each tool invocation. A timestamp computed once at import cannot distinguish repeated requests to a persistent MCP server. Preserve the tool's documented return schema and report actual output paths.

### Replace demonstration labels with user metadata

Preserve the scientific analysis, but distinguish its inputs from labels or groups constructed solely to demonstrate it. When a tutorial assigns arbitrary conditions (for example, first-half/second-half groups by row index or random treatment labels), the generated analysis tool must read those conditions from user-provided metadata instead of recreating them.

- Expose the metadata column and comparison groups as parameters, such as `condition_key`, `group1`, and `group2`. Read the existing column from the supplied data file; do not infer conditions from row order or create or overwrite that column as a fallback.
- Check that the required metadata column and requested groups exist. Report a clear input error if they are missing. Validate scientific input contracts as well as file existence.
- Keep the original scientific library calls, statistical settings, and associated visualizations, using the supplied groups. Preserve grouping that is itself the scientific method (for example, clustering); this rule applies to demonstration-only input construction.
- Move the tutorial's exact demonstration-label construction into benchmark/test data preparation. Save the labeled input fixture, then compare the extracted analysis with the original tutorial computation using those same labels. Record this boundary change in the implementation report.

Document the metadata input contract; an arbitrary row-order grouping is not a valid production default.

Include these checks in extraction and testing:

- [ ] Demonstration-only groups are supplied as metadata; the tool does not manufacture or overwrite them.
- [ ] Tests verify that user-supplied labels drive the analysis and remain unchanged, and that missing columns or groups fail clearly. Use labels that differ from the tutorial's row-order split so accidental regrouping is detectable.
- [ ] Original tutorial numerical and figure comparisons still pass with its demonstration labels prepared outside the tool.

### Clean notebook-specific scaffolding

Apply this cleanup after converting notebook cells and extracting tool parameters, before scientific testing. `nbconvert --TemplateExporter.exclude_markdown=True` excludes Markdown cells but leaves Colab directives inside code cells.

- Remove Colab UI directives such as `# @title`, `# @markdown`, and `# @param`. For inline directives, remove only the comment and preserve the executable assignment unless parameter extraction has already replaced it.
- Remove empty headings left after moving notebook settings into function parameters.
- Remove unused imports and helper functions after checking their references and any required import side effects, such as backend setup or registration.
- Preserve comments explaining scientific methods, assumptions, and units. Preserve scientific computations, explicit library arguments, data structures, and figure content.

Include this check in the extraction completion review:

- [ ] Generated tool modules contain no Colab UI directives, orphaned headings, or unused imports/helpers; required setup and scientific explanatory comments are retained.

Run the existing import/startup checks and tutorial-derived scientific tests on the cleaned modules. Passing numerical tests alone does not establish that notebook scaffolding has been removed.

## Stages 4–5: validate the server and its runtime environment

Use server composition (`FastMCP`, `@mcp.tool()`, `mount`, and `run`). Record the intended exposed tool names after scientific tests and exclusions in `reports/expected-mcp-tools.json`, a nonempty JSON list of unique strings. Derive it from the tested tool inventory, not from whatever the server happens to expose. Record excluded tools and their reasons separately in the verification reports.

Each separate verifier prepares `reports/mcp-acceptance-<module>.json` from independently checked tutorial fixtures in its assigned namespace. After all verifiers finish, the coordinator merges these into `reports/mcp-acceptance-cases.json`, using the final exposed tool names. Workers do not write that shared file. Include a successful call with result/artifact assertions for every exposed tool, input-error cases, and repeated calls for file-producing tools. Use fresh output directories in each environment and verify resulting scientific artifacts through the original comparison tests. Inventory-only checks cannot complete stages 4–5.

Stage 5 produces `src/requirements.txt`. Pin the tested versions of its runtime dependencies, including FastMCP. Include the actual research package with its installation provenance (published version, immutable Git commit, or documented local package installation). Import-name matching alone is insufficient for local/editable packages. Never reduce the requirements to just FastMCP when tool imports require more. Include subprocess dependencies even when they are not imported by wrappers. Follow the R/CLI routes for restoring their native runtimes; a fresh Python environment alone cannot validate them.

Use a new temporary validation environment and the same Python version as the project. Run:

```bash
uv venv "$VALIDATION_ENV" --python "$PROJECT_PYTHON"
uv pip install --python "$VALIDATION_ENV/bin/python" -r src/requirements.txt
uv pip check --python "$VALIDATION_ENV/bin/python"
"$VALIDATION_ENV/bin/python" "$SKILL_ROOT/scripts/verify_mcp_server.py" \
  --server "src/${REPO_NAME}_mcp.py" \
  --expected reports/expected-mcp-tools.json \
  --cases reports/mcp-acceptance-cases.json --require-all-tools \
  --report reports/mcp-clean-environment.json
```

Choose `VALIDATION_ENV` as a fresh temporary path, not a preexisting user directory. Use the same verifier in the project environment at stage 4, writing `reports/mcp-project-environment.json`. The helper launches the server with its own Python interpreter and inherited runtime environment, checks the real MCP handshake, inventory and declared schemas, then executes the saved acceptance cases. It exits nonzero on failed calls, output checks, or missing tool coverage. Keep the scientific test suite for full numerical/figure comparisons. See [runtime acceptance cases](runtime-verification.md) for case construction and validation scope. Verify startup and imports for every generated module, including modules not mounted in the final server.

If runtime requirements need a local package path, test that documented path. Before final delivery, include the required implementation in the package with relative installation paths or replace it with a tested pinned installation method. Record the validation result before cleaning up only the temporary environment created for this check. Preserve reports, inventory, acceptance cases, requirements, and server hashes for the completion record; stage 6 adds usage and ZIP delivery evidence before running the [workflow checker](workflow-state.md) through `complete`. Write stage success markers only after required checks pass.

## Stage 6: installation documentation and ZIP delivery

Generate installation commands from the tested environment's `fastmcp install <client> --help`. Client names, naming flags, and dependency options may vary; use the syntax supported by that installed version. Record the tested interpreter, runtime requirements, working directory, and R/CLI configuration. Provide a direct launch command using the project interpreter and server path. Writing these commands does not execute client registration.

Follow [output delivery](output-delivery.md) to create `dist/<repo-name>-mcp.zip`, test the actual extracted package, and present it to the user. Installation paths must be resolved on the recipient's machine. Keep development evidence outside the archive; do not include examples by default. Containers and remote deployment remain optional extensions.

## Runtime sources

- [FastMCP installation CLI](https://gofastmcp.com/cli/install-mcp)
- [FastMCP migration requirements](https://gofastmcp.com/getting-started/upgrading/from-fastmcp-3)
- [pytest configuration](https://docs.pytest.org/en/stable/reference/customize.html)
- [uv environments](https://docs.astral.sh/uv/pip/environments/)
- [uv locking](https://docs.astral.sh/uv/pip/compile/)
- [IPython kernels](https://ipython.readthedocs.io/en/stable/install/kernel_install.html)
