# Recorded workflow state

The coordinator maintains `reports/agent-runs.json` from actual host lifecycle events and specialist artifacts. Run [verify_workflow.py](../scripts/verify_workflow.py) at phase handoffs and before accepting completion:

```bash
python "$SKILL_ROOT/scripts/verify_workflow.py" \
  --project-root "$PROJECT_ROOT" --through verification \
  --report reports/workflow-validation.json
```

`--state` defaults to `reports/agent-runs.json`. Relative state and report paths resolve against the project root. `--through` accepts `setup`, `execution`, `extraction`, `verification`, or `complete` (default). JSON is always printed to stdout; `--report` additionally saves it. Exit status is 0 only when the requested gate passes. Malformed/missing JSON, missing assignments, failed current attempts, inconsistent ownership, stale artifacts, and unsafe report destinations return nonzero. The helper writes only its optional report; it does not launch agents, alter state, write markers, or repair work.

**Scope:** this validates recorded assignments and artifact consistency. It does not authenticate host agent IDs, prove when an external command actually ran, establish dependency restoration, or establish numerical/scientific correctness. Retain scientific reference comparisons, independent specialist work, and runtime checks. A hash proves agreement with the recorded bytes, not the truth of a report. Record host events honestly; do not invent identities, timestamps, outputs, or hashes to pass the gate.

## State schema, version 1

Preserve these top-level fields. Paths are project-relative POSIX paths without `..`, `.` components, or symlinks escaping the project. Hashes are lowercase SHA-256 of file bytes. IDs and module names use snake_case identifiers beginning with a letter.

```json
{
  "schema_version": 1,
  "route": "r",
  "repository": {"url": "https://github.com/owner/project", "commit": "<full lowercase Git commit>"},
  "tutorials": [
    {"id": "basic_analysis", "module": "basic_analysis", "source": "repo/project/README.md", "sha256": "<SHA-256>"}
  ],
  "runs": [],
  "exclusions": []
}
```

The example's angle-bracket values are placeholders, not valid hashes. The helper checks selected source-file hashes on every invocation. `repository.commit` must be a full 40- or 64-character lowercase Git hash. This is the recorded source identity; the helper does not query Git or authenticate that identity against a remote.

For a local source archive/directory without a Git commit, omit `commit` and record `repository.source_tree: {"path": "repo/project", "sha256": "<tree SHA-256>"}` instead; retain its local source location in `url`. Do not invent a commit. The tree fingerprint is checked on each invocation. The script's `tree_digest(Path(...))` function computes it: recursively collect regular files as `[relative_posix_path, "file", file_sha256]` and symlinks as `[relative_posix_path, "symlink", link_target]`, omit `.git` entries, sort the entries, serialize with `json.dumps(entries, ensure_ascii=True, separators=(",", ":"))`, and SHA-256 the UTF-8 bytes. Empty directories are ignored; symlinks are recorded without following them. Keep generated environments and outputs outside this source directory. A supplied `commit` must remain valid even if a `source_tree` field is also supplied.

For Python/R, module IDs identify extraction/verification assignments. Tutorial IDs identify execution assignments; multiple selected examples may map to a single source module. Every CLI tutorial must map to `cli_wrapper`, producing exactly one required implementer and one verifier regardless of example count. R implementations include **both** `src/tools/<module>.py` and `src/r_scripts/<module>.R`.

## Run records and ownership

Each actual assignment/attempt gets one run record:

| Field | Meaning |
| --- | --- |
| `id` | Unique coordinator-assigned attempt ID; distinct from the host ID. |
| `role` | `environment`, `scanner`, `executor`, `implementer`, or `verifier`. |
| `task` | `project` for environment/scanner; selected tutorial `id` for executor; selected `module` for implementer/verifier. |
| `agent_id` | Actual host agent/context ID. The coordinator can occupy the CLI environment role where its route explicitly permits that. |
| `status` | `running`, `succeeded`, `failed`, `blocked`, or `cancelled`. A returned agent is not automatically successful. |
| `started_at` | Actual start timestamp in ISO 8601 UTC ending in `Z`, e.g. `2026-09-15T12:34:56.123Z`. |
| `finished_at` | Actual terminal timestamp ending in `Z`; required for terminal statuses, absent/null for `running`. |
| `owned_paths` | Nonempty array of exclusive file paths or directory namespaces. Include the report and produced files. |
| `report`, `report_sha256` | Required for every terminal attempt, including failed/blocked/cancelled attempts. |
| `produced_files` | Object mapping output file paths to hashes; nonempty for successful executors and implementers. Optional for other roles. |
| `implementation_run_id` | Required for verifiers; references a successful implementer of the same module. |
| `tested_files` | Nonempty path-to-hash object for successful verifiers, covering every file in the referenced implementer's `produced_files`. Include the entire Python/R implementation pair. These files must be in the verifier's ownership. |

An executor's produced files should include its full executed notebook or native driver, saved inputs, and retained reference outputs. An implementer's produced files should cover the production module/scripts and any additional implementation files that the verifier must test. Do not put its report in `produced_files`: the report has its own immutable hash and must survive verifier repairs. Verifiers may also record their test files, result logs, and acceptance cases as `produced_files`. Report files need not have a specific extension or internal schema; the gate checks their presence and hashes, while the coordinator interprets their substantive results.

Example verifier record (replace placeholders with observed values):

```json
{
  "id": "verify-basic-analysis-attempt-1",
  "role": "verifier",
  "task": "basic_analysis",
  "agent_id": "<actual fresh host agent ID>",
  "status": "succeeded",
  "started_at": "2026-09-15T12:40:00Z",
  "finished_at": "2026-09-15T12:45:00Z",
  "owned_paths": ["src/tools/basic_analysis.py", "src/r_scripts/basic_analysis.R", "reports/verify-basic-analysis-attempt-1.json"],
  "report": "reports/verify-basic-analysis-attempt-1.json",
  "report_sha256": "<SHA-256>",
  "implementation_run_id": "extract-basic-analysis-attempt-1",
  "tested_files": {
    "src/tools/basic_analysis.py": "<SHA-256 after any repairs and final tests>",
    "src/r_scripts/basic_analysis.R": "<SHA-256 after any repairs and final tests>"
  }
}
```

Ownership is exclusive during overlapping attempt intervals, including a directory's descendants and resolved path/hardlink aliases. Concurrent assignments cannot reuse the same host agent ID or overlap retries of the same assignment. Sequential ownership transfers are allowed. Give workers individual report files/namespaces; the coordinator owns shared merged reports and the workflow-validation output. The checker does not require simultaneous starts or unlimited host capacity; queue assignments as described in [orchestration](orchestration.md).

Every verifier's `agent_id` must differ from **every** implementer's ID anywhere in the recorded run, including retries and other modules. A new role prompt in an implementer's existing context is insufficient. A verifier may perform the bounded repair loop while owning its module; its final `tested_files` hashes then supersede the implementer's earlier output hashes. Mutations after that final hash snapshot fail verification.

## Attempts, exclusions, and phase gates

Append retries with new attempt IDs, real timestamps, and new retained report paths. The attempt with the latest `started_at` for a role/task is authoritative, independent of array order. A failed, blocked, cancelled, or running latest attempt overrides an earlier success. Tied start times and overlapping attempts are invalid. Preserve historical run records and immutable reports; old output hashes may differ after a later attempt or verifier repair, but historical reports must still match.

Some role reports use fixed canonical filenames. **Before a retry overwrites one, archive its current report under a unique attempt path, verify that the archived bytes match the old hash, and update the old record's report path and owned paths to that archive.** Record the new attempt's canonical report separately. Alternatively, archive each completed report immediately and use only immutable archive paths in state. Do not retroactively replace an old report's hash with the retry's contents.

| Gate | Required latest successful assignments and checks |
| --- | --- |
| `setup` | Environment + scanner, selected source hashes, retained terminal reports, structural/ownership/identity validity of all recorded attempts. |
| `execution` | Setup plus one executor per active tutorial and current execution artifact hashes. Every executor starts after both setup assignments finish. |
| `extraction` | Execution plus one implementer per active module. All execution assignments finish before any extraction starts. Required module files and produced-file hashes match. |
| `verification` | Extraction plus one fresh verifier per active module. All extraction assignments finish before any verification starts. Each verifier refers to the latest implementation, covers its files, and has hashes matching current files. Verifier repairs are permitted. |
| `complete` | Verification plus the completion evidence below. |

Phase timing is checked against the latest applicable attempts. An upstream retry therefore requires downstream attempts after its completion; an old successful verifier cannot validate a new implementation. Historical failed attempts remain visible without permanently preventing a valid later retry. For a project with verifier repairs, use `verification` or `complete` to validate the repaired revision; the earlier `extraction` gate checks the pre-verification handoff snapshot.

Explicit exclusions have this shape:

```json
{"kind": "tutorial", "id": "unavailable_example", "reason": "Required dataset unavailable", "at": "2026-09-15T12:00:00Z", "report": "reports/exclusions/unavailable-example.json", "report_sha256": "<SHA-256>"}
```

`kind` is `tutorial` or `tool`. Tutorial IDs must be in the selected tutorials; tool IDs are final exposed names including mount prefixes. Exclusions need nonempty reasons and a retained hashed report. Excluded tutorials stay in state and source checks but leave required execution assignments; a module remains required while any active tutorial maps to it. Tool exclusions do not waive a module's verifier. An excluded tool cannot remain in the final expected inventory. The JSON output lists exclusions separately and never places excluded assignments in `passed_assignments`. A successful gate means the remaining recorded scope passed, not that excluded work succeeded. The `complete` gate explicitly requires at least one active tutorial and its verified module, as well as a nonempty final tool inventory.

## Completion evidence

After real runtime acceptance, usage documentation, and [ZIP delivery acceptance](output-delivery.md), add:

```json
{
  "completion": {
    "finished_at": "2026-09-15T13:00:00Z",
    "files": {
      "reports/expected-mcp-tools.json": "<SHA-256>",
      "reports/mcp-acceptance-cases.json": "<SHA-256>",
      "reports/mcp-project-environment.json": "<SHA-256>",
      "reports/mcp-clean-environment.json": "<SHA-256>",
      "src/project_mcp.py": "<SHA-256>",
      "src/requirements.txt": "<SHA-256>",
      "USAGE.md": "<SHA-256>",
      "dist/project-mcp.zip": "<SHA-256>",
      "reports/delivery-validation.json": "<SHA-256>"
    }
  }
}
```

The helper requires the six fixed runtime/documentation paths above and the actual server path declared by both MCP reports. The final delivery instructions additionally require the actual ZIP path and delivery report in this hash map. Additional hashed files are allowed. `finished_at` must follow every required assignment's finish. Requirements and usage must be nonempty. Every listed file must exist and match its hash. A later change requires the relevant checks and a new honest completion snapshot.

Use the existing [runtime acceptance workflow](runtime-verification.md). Both JSON reports must contain `success: true`, `mode: "calls"`, `require_all_tools: true`, `expected` and `actual` matching the saved nonempty unique inventory, and empty `missing` and `unexpected` arrays. Their `cases` arrays must exactly account for saved acceptance-case names/tools, with each outcome's `success: true`. Saved cases require a positive result/artifact assertion covering every tool; expected-error cases do not provide positive coverage. Both reports name the same pinned `server` and different nonempty `python` interpreter paths. Different interpreter paths are recorded evidence, not proof that a clean environment was created or its R/native dependencies were independently restored.

The workflow helper does not re-execute runtime cases, infer scientific expectations from tool discovery, inspect numerical contents of output artifacts, or replace the route-specific runtime requirements. These remain the specialists' and coordinator's work.

Keep extraction acceptance in `reports/delivery-validation.json`, including the independent verifier's identity and the exact archive hash. Its actual server path will be in the extracted package; do not rewrite existing project/clean reports to conceal a different execution path. The helper checks additional completion files' hashes but does not interpret the delivery report. The coordinator reviews its successful real-call and installation evidence before writing `delivery_done`.

## Safe output and report interpretation

`--report` cannot overwrite the state, a source, a recorded report, produced/tested files, or a completion artifact, including symlink/hardlink aliases. It cannot write inside an existing agent-owned directory or replace an unrelated existing file. A prior report identifying itself with `validator: "paper2agent-workflow"` can be refreshed when it does not overlap protected inputs. Unsafe destinations leave those files unchanged, return failure, and report the error in stdout JSON.

`success` applies only to the requested `through` gate. `expected_assignments`, `passed_assignments`, `active_tutorials`, `active_modules`, `exclusions`, and `errors` expose the assessed scope; on failure the passed list may be partial. `complete` also reports `exposed_tools` and the number of completion files checked. A zero exit code alone is not permission to claim scientific success beyond the recorded evidence.
