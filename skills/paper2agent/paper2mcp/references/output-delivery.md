# MCP output and delivery

Read when preparing the final deliverable. A completed conversion provides `dist/<repo-name>-mcp.zip`: a usable MCP server project for the selected, verified tools. Keep development evidence in the working project. Do not publish or register the server unless requested.

## Package contents

Build an explicit staging directory with one top-level `<repo-name>-mcp/` folder. Include:

- `USAGE.md` with supported scope, tested platforms, installation/restoration, startup and client configuration, tool parameters and outputs, prerequisites, and validation limits.
- The server entry point, all required tool modules and runtime helpers, and pinned Python runtime requirements.
- The original scientific implementation: include the required source, package, or native executable with provenance and relevant notices, or document and test installation from a fixed version/commit. Runtime imports and subprocesses must not depend on the build workspace.
- Route-specific runtime material: R scripts and lock/bootstrap files, or required CLI executables/build instructions with version, platform, and shared-library requirements. Retain relevant source/license notices.
- Configuration templates only when required. Supply credentials at runtime. Large models or reference data may remain external when their identity, location/acquisition, and configuration are documented and tested.

Keep the package as small as the actual runtime allows. Do not add `examples/`, test fixtures, test suites, notebooks, reports, agent records, environments, caches, `.git`, secrets, or intermediate outputs by default. Files genuinely needed at runtime must be included or installed explicitly even if upstream stores them in a directory named `data` or `examples`.

Use paths relative to the installed package or explicit user configuration. Installation and usage must not contain developer-machine paths, missing workspace references, or editable installs pointing outside the package. The runtime creates its output directories when called. Document supported platforms; including a native binary does not establish cross-platform portability.

## Validate the ZIP itself

1. Assemble the package from the verified production revision. Pin its Python runtime dependency closure or tested lockfile, and write recipient-facing instructions before archiving. Record the ZIP SHA-256 and a file/hash inventory outside the package. Check archive integrity and exclude unintended files and external symlink targets.
2. Extract the actual ZIP into a different directory, including a path containing spaces when supported. Verify its extracted runtime files match the archive. Use the documented installation commands to create a fresh Python environment there. Restore an independent R library or the declared CLI dependencies when relevant; check actual import/executable origins.
3. Check executable permissions after extraction. ZIP extractors may remove executable bits; document and test any required permission-restoration step. Start the server using the documented interpreter and working directory, with build-specific environment overrides removed.
4. Give an independent verifier the extracted package, final expected tool inventory, and existing source-backed acceptance evidence kept outside the ZIP. Run real MCP calls for every delivered tool, check input schemas, compare scientific results/artifact contents, and exercise changed inputs, applicable errors, and repeated file-producing calls. Resolve inputs and outputs to the new test location. Runtime code and dependencies must come from the extracted package or its documented installation, not the original workspace.
5. Retain `reports/delivery-validation.json` in the working project with the archive path/SHA-256, packaged file hashes, extraction location, interpreter/native-runtime identities, installation results, actual call/comparison outcomes, success status, and remaining platform/external limits. Retain detailed logs separately. Do not ship this development evidence by default.

If an existing clean-runtime check already satisfies these conditions for the identical ZIP, reuse its evidence. Otherwise perform relocation acceptance in addition to the existing project and clean-runtime checks. Preserve those existing reports; the workflow helper expects their original pinned server paths. Any package change invalidates its delivery result and requires rebuilding and rechecking the changed archive. Wrapper changes also require the affected independent scientific verification.

## Completion and user-facing output

Review a successful delivery report tied to the exact final ZIP. Add the archive and delivery-report hashes to `completion.files` alongside the existing completion evidence, then run the workflow `complete` gate. The helper checks recorded file/hash consistency; the coordinator must review the delivery report's contents and real execution evidence. Write `.pipeline/delivery_done` only after both checks pass.

An unresolved installation, credential, data/model, GPU, or native-runtime requirement means the affected delivery remains incomplete. Preserve the candidate ZIP and explain the blocker without presenting it as a fully validated release.

The final response leads with the ZIP link, followed by the delivered tools, short installation/startup directions or a `USAGE.md` link, actual validation scope, and required external conditions. Link detailed workspace evidence only as useful supporting material. A complete delivery covers the selected tools; it does not claim the whole repository or paper has been reproduced.
