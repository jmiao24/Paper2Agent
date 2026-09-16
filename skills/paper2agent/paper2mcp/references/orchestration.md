# Multi-agent orchestration

The host provides agent spawning, execution tools, concurrency limits, and lifecycle events. Role instructions live in `references/agents/`; `agents/openai.yaml` supplies skill UI metadata. A role description alone is not a running agent.

Use [selection and wrapping](tool-selection-and-wrapping.md) for tool decisions and source reuse, [runtime requirements](runtime.md) for execution and packaging, and the chosen language route for native dependencies and transport.

## Inputs and workspace

Bind template values before passing work to specialists:

| Value | Meaning |
| --- | --- |
| `PROJECT_ROOT` | Absolute output project directory |
| `REPO_NAME` | Repository basename without `.git`, retaining case |
| `SKILL_ROOT` | Absolute Paper2MCP skill directory; helpers are under `scripts/` |
| `PROJECT_ENV`, `PROJECT_PYTHON` | Absolute project environment directory and its interpreter |

Pass the actual source path, stable execution/module IDs, selected language route, and user filter directly in each assignment. In documentation, `<repo-name>`, `<module>`, and similar angle-bracket terms stand for task-specific values; replace them before running commands.

Create the requested project and `.pipeline/`; write `project_setup_done` after successful creation/reuse. Place the source at `repo/<repo-name>/`. Clone with submodules when required, using a shallow or plain clone if appropriate; inspect incomplete clones before retrying. A local copy/clone must retain its source identity. Verify the requested identity before reusing an existing checkout. An optional `.wiki.git` clone may supply documentation; its absence is nonfatal. Write `source_setup_done` after successful source setup.

Record route/hardware evidence in `.pipeline/language.json`. Create `notebooks/`, `src/tools/`, `tests/{code,data,results,logs,summary}/`, `reports/`, and `tmp/{inputs,outputs}/`; write `workspace_setup_done` when prepared. Run commands from the project root with explicit project interpreters. Generated environments and results stay outside the scientific source tree.

Pass credentials through process environment or a secret mechanism. Do not embed keys in source, notebooks, reports, test cases, or generated tools. Quote command arguments as data rather than interpolating user input as shell code.

## Assignments and phase barriers

1. Run the environment manager and scanner concurrently. Review the scanner's selected tools, source bindings, evidence feasibility, and deferred work against the environment result.
2. Launch one executor per selected tutorial/example/test with exclusive output paths. Queue excess work within host and machine limits. Wait for all execution results before implementation.
3. Launch one implementer per owning source module in parallel. Assign selected tools, completed reference evidence, and concrete source bindings. The CLI route has one shared `cli_wrapper` implementer. Wait for all implementation handoffs.
4. Launch fresh verifier agents for the completed modules. Their agent IDs must differ from every implementer's ID, including retries and other modules. Verifiers work in parallel on separate modules and process dependent tools in a deliberate order within each module. They may repair code within their exclusive ownership and bounded retry policy.
5. Integrate only verified tools, validate runtime installation, write recipient-facing usage documentation, and complete [ZIP delivery](output-delivery.md). Assign extraction acceptance to an independent verifier distinct from every implementer; a prior independent verifier may continue this work.

Give each worker its stage prompt, role instructions, relevant selection/runtime sections, bound inputs, ownership, and report path. Use the host's actual tools for reads, edits, commands, agent launch, and lifecycle collection. Do not substitute a changed role prompt in the same agent context for independent verification. If agent spawning is unavailable, report the limitation and last completed phase; a different workflow requires an explicit user request.

The environment manager owns dependency changes. A worker needing a package requests a serialized installation through the coordinator before resuming. Shared production helpers need an explicit owner and coordinated verification of every affected module. Workers must not race installations or edit each other's artifacts.

## Records, retries, and completion

Maintain `reports/agent-runs.json` from actual host events using [workflow state](workflow-state.md), schema 1. Record agent IDs, UTC times, ownership, terminal status, immutable report hashes, produced files, and implementation/verifier links. Pin source identity and tested production files, including R scripts.

At handoffs run `"$PROJECT_PYTHON" "$SKILL_ROOT/scripts/verify_workflow.py" --project-root "$PROJECT_ROOT" --through PHASE` for `setup`, `execution`, `extraction`, and `verification`; run `complete` after installation validation, documentation, and ZIP delivery acceptance. The helper checks records and hashes. The coordinator still reviews substantive scientific and delivery results and collects real lifecycle outcomes. Retain the final delivery verifier's identity and outcomes in `reports/delivery-validation.json` alongside the existing phase records.

Use at most three environment/scanner/implementation review attempts, five execution attempts per source, and six verification repair attempts per tool, unless task constraints require stopping earlier. Do not retry an unchanged missing credential, dataset, or hardware condition indefinitely. Retain failed attempts and reasons. Archive a fixed-path report before replacing it so historical run hashes still match; do not rewrite old report hashes to conceal failures.

Wait for actual worker completion and inspect its assigned report and tests. A `.done_*` file signals that work ended, not that it passed. Merge only the expected current per-source reports; stale markers and other phases must not satisfy completion. Return short worker summaries with paths to detailed artifacts.

Use the stage markers in `SKILL.md`. Before resuming a marked phase, check source identity, selection, prerequisites, and artifact hashes. Changed inputs or code require affected downstream execution/verification. Never refresh hashes alone to make stale evidence current. Preserve successful history and explain any new selection or exclusion.

## Evidence handling

Retain full executed notebooks when used. Extract images before making compact inspection copies. `preprocess_notebook.py` rejects output aliases of its input, including hard/symbolic links. Never base numerical comparisons on truncated output.

`extract_notebook_images.py` supports PNG/JPEG/SVG payloads and records an image manifest. Reruns replace only unchanged helper-owned files; use a separate directory for conflicts. Run one extractor per directory and verify image/notebook hashes when using that evidence. Separately saved plots need their own provenance.

Expected values come from real upstream execution, with exact integer/identifier checks and justified floating-point tolerances. Data preparation must use the selected source's actual loader/generator and supported seed mechanism. Do not fabricate replacement data or provenance. Preserve figures belonging to selected scientific tasks; tutorial-only benchmark figures can remain verification evidence without becoming production outputs.
