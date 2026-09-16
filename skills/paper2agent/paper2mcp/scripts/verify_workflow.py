#!/usr/bin/env python3
"""Check recorded Paper2Agent assignments and artifacts without running agents."""
import argparse
from datetime import datetime
import hashlib
import json
import os
from pathlib import Path, PurePosixPath
import re
import sys

PHASES = ("setup", "execution", "extraction", "verification", "complete")
ROLES = {"environment": 0, "scanner": 0, "executor": 1,
         "implementer": 2, "verifier": 3}
TERMINAL = {"succeeded", "failed", "blocked", "cancelled"}
COMPLETION_FILES = {
    "reports/expected-mcp-tools.json", "reports/mcp-acceptance-cases.json",
    "reports/mcp-project-environment.json", "reports/mcp-clean-environment.json",
    "src/requirements.txt", "USAGE.md",
}
LIMIT = "Validates recorded state and artifact consistency; does not authenticate host identities or establish numerical/scientific correctness."


def require(condition, message):
    if not condition:
        raise ValueError(message)


def nonempty(value):
    return isinstance(value, str) and bool(value.strip())


def utc(value, label):
    require(isinstance(value, str) and value.endswith("Z"), f"{label}: expected UTC timestamp ending in Z")
    try:
        parsed = datetime.fromisoformat(value[:-1] + "+00:00")
    except ValueError as exc:
        raise ValueError(f"{label}: invalid timestamp") from exc
    require("T" in value and parsed.utcoffset().total_seconds() == 0,
            f"{label}: expected ISO 8601 UTC timestamp")
    return parsed


def relative(value):
    require(nonempty(value), "Artifact path must be a nonempty relative POSIX path")
    path = PurePosixPath(value)
    require(not path.is_absolute() and str(path) == value
            and not any(part in (".", "..") for part in path.parts)
            and "\\" not in value, f"Invalid project-relative path: {value!r}")
    return value


def resolve(root, value):
    path = (root / relative(value)).resolve()
    require(path.is_relative_to(root) and path != root,
            f"Artifact resolves outside project: {value}")
    return path


def digest(path):
    with path.open("rb") as handle:
        return hashlib.file_digest(handle, "sha256").hexdigest() if hasattr(hashlib, "file_digest") else _digest(handle)


def _digest(handle):
    result = hashlib.sha256()
    for block in iter(lambda: handle.read(1024 * 1024), b""):
        result.update(block)
    return result.hexdigest()


def tree_digest(directory):
    """Fingerprint files and symlink targets, excluding .git metadata; never follow links."""
    entries = []
    def fail_on_unreadable(error):
        raise error
    for current, directories, files in os.walk(directory, followlinks=False, onerror=fail_on_unreadable):
        directories[:] = [name for name in directories if name != ".git"]
        for name in directories + files:
            if name == ".git":
                continue
            path = Path(current) / name
            relative_name = path.relative_to(directory).as_posix()
            if path.is_symlink():
                entries.append([relative_name, "symlink", os.readlink(path)])
            elif path.is_file():
                entries.append([relative_name, "file", digest(path)])
            else:
                require(path.is_dir(), f"Source tree contains unsupported special file: {relative_name}")
    encoded = json.dumps(sorted(entries), ensure_ascii=True, separators=(",", ":")).encode("utf-8")
    return hashlib.sha256(encoded).hexdigest()


def valid_hash(value, label):
    require(isinstance(value, str) and re.fullmatch(r"[0-9a-f]{64}", value),
            f"{label}: expected lowercase SHA-256")


def hash_map(root, value, label, required=False):
    require(isinstance(value, dict) and (bool(value) or not required),
            f"{label}: expected {'nonempty ' if required else ''}path-to-SHA-256 object")
    for name, sha in value.items():
        resolve(root, name)
        valid_hash(sha, f"{label}/{name}")
    return value


def check_file(root, name, sha):
    path = resolve(root, name)
    require(path.is_file(), f"Missing artifact: {name}")
    require(digest(path) == sha, f"SHA-256 mismatch (changed artifact): {name}")


def names(value, label):
    require(isinstance(value, list) and bool(value) and all(nonempty(x) for x in value)
            and len(set(value)) == len(value), f"{label}: expected nonempty unique strings")
    return value


def owned(name, owners):
    return any(name == owner or name.startswith(owner + "/") for owner in owners)


def read_json(path):
    def unique_object(pairs):
        result = {}
        for key, value in pairs:
            require(key not in result, f"Duplicate JSON key: {key}")
            result[key] = value
        return result
    return json.loads(path.read_text(), object_pairs_hook=unique_object,
                      parse_constant=lambda value: (_ for _ in ()).throw(ValueError(f"Invalid JSON constant: {value}")))


def validate(root, state, through="complete"):
    """Return a report; all failures, including malformed input, fail closed."""
    result = {"validator": "paper2agent-workflow", "schema_version": 1,
              "success": False, "through": through, "errors": [],
              "passed_assignments": [], "exclusions": [], "scope": LIMIT}
    try:
        _validate(root.resolve(), state, through, result)
        result["success"] = True
    except (ValueError, TypeError, KeyError, OSError, AttributeError) as exc:
        result["errors"].append(f"{type(exc).__name__}: {exc}")
    return result


def _validate(root, state, through, result):
    require(root.is_dir(), "Project root does not exist")
    require(through in PHASES, "Unknown --through phase")
    level = PHASES.index(through)
    require(isinstance(state, dict), "State must be a JSON object")
    require(type(state.get("schema_version")) is int and state["schema_version"] == 1,
            "Expected schema_version 1")
    route = state.get("route")
    require(route in {"python", "r", "cli"}, "route must be python, r, or cli")
    repository = state.get("repository")
    require(isinstance(repository, dict) and nonempty(repository.get("url")),
            "repository requires its source URL or local location in url")
    if "commit" in repository:
        require(isinstance(repository["commit"], str)
                and re.fullmatch(r"[0-9a-f]{40}|[0-9a-f]{64}", repository["commit"]),
                "repository commit must be a full lowercase commit hash")
    else:
        tree = repository.get("source_tree")
        require(isinstance(tree, dict), "repository requires a pinned commit or source_tree fingerprint")
        directory = resolve(root, tree.get("path"))
        require(directory.is_dir(), "repository source_tree path must be a directory")
        valid_hash(tree.get("sha256"), "repository source_tree sha256")
        require(tree_digest(directory) == tree["sha256"], "repository source_tree SHA-256 mismatch")
    tutorials = state.get("tutorials")
    require(isinstance(tutorials, list) and bool(tutorials), "tutorials must be a nonempty array")
    tutorial_map = {}
    for tutorial in tutorials:
        require(isinstance(tutorial, dict), "Tutorial must be an object")
        for field in ("id", "module"):
            require(isinstance(tutorial.get(field), str)
                    and re.fullmatch(r"[a-z][a-z0-9_]*", tutorial[field]),
                    f"Tutorial {field} must be a snake_case identifier")
        require(tutorial["id"] not in tutorial_map, f"Duplicate tutorial: {tutorial['id']}")
        require(route != "cli" or tutorial["module"] == "cli_wrapper",
                "Every CLI tutorial must map to the shared cli_wrapper module")
        valid_hash(tutorial.get("sha256"), "Tutorial sha256")
        check_file(root, tutorial.get("source"), tutorial["sha256"])
        tutorial_map[tutorial["id"]] = tutorial
    exclusions = state.get("exclusions")
    require(isinstance(exclusions, list), "exclusions must be an array")
    exclusion_ids = set()
    excluded_tutorials = set()
    excluded_tools = set()
    for item in exclusions:
        require(isinstance(item, dict) and item.get("kind") in {"tutorial", "tool"}
                and nonempty(item.get("id")) and nonempty(item.get("reason")),
                "Exclusion requires kind tutorial|tool, id, and reason")
        key = (item["kind"], item["id"])
        require(key not in exclusion_ids, f"Duplicate exclusion: {key}")
        exclusion_ids.add(key)
        utc(item.get("at"), "Exclusion at")
        valid_hash(item.get("report_sha256"), "Exclusion report_sha256")
        check_file(root, item.get("report"), item["report_sha256"])
        if item["kind"] == "tutorial":
            require(item["id"] in tutorial_map, f"Excluded tutorial is not selected: {item['id']}")
            excluded_tutorials.add(item["id"])
        else:
            excluded_tools.add(item["id"])
        result["exclusions"].append(item.copy())
    active = {key: value for key, value in tutorial_map.items() if key not in excluded_tutorials}
    modules = {value["module"] for value in active.values()}
    all_modules = {value["module"] for value in tutorials}
    expected = {("environment", "project"), ("scanner", "project")}
    expected.update(("executor", key) for key in active)
    expected.update((role, module) for role in ("implementer", "verifier") for module in modules)
    result["expected_assignments"] = [dict(role=role, task=task) for role, task in sorted(expected)
                                      if ROLES[role] <= level]
    result["active_tutorials"] = sorted(active)
    result["active_modules"] = sorted(modules)
    runs = state.get("runs")
    require(isinstance(runs, list), "runs must be an array")
    by_id, latest, intervals = {}, {}, []
    attempt_starts = set()
    report_paths = set()
    for run in runs:
        require(isinstance(run, dict), "Run must be an object")
        require(nonempty(run.get("id")) and run["id"] not in by_id, "Run IDs must be nonempty and unique")
        label = run["id"]
        role, task = run.get("role"), run.get("task")
        require(role in ROLES and nonempty(task), f"{label}: invalid role/task")
        allowed = {"project"} if role in {"environment", "scanner"} else set(tutorial_map) if role == "executor" else all_modules
        require(task in allowed, f"{label}: unexpected {role} assignment {task!r}")
        require(nonempty(run.get("agent_id")), f"{label}: actual agent_id is required")
        require(run.get("status") in TERMINAL | {"running"}, f"{label}: invalid status")
        start = utc(run.get("started_at"), f"{label} started_at")
        finish = utc(run.get("finished_at"), f"{label} finished_at") if run["status"] in TERMINAL else None
        require(finish is None or finish >= start, f"{label}: finish precedes start")
        require(run["status"] != "running" or run.get("finished_at") is None,
                f"{label}: running attempt cannot have finished_at")
        owners = names(run.get("owned_paths"), f"{label} owned_paths")
        for name in owners:
            resolve(root, name)
        if run["status"] in TERMINAL:
            report = run.get("report")
            path = resolve(root, report)
            require(path not in report_paths, "Terminal run reports must have unique immutable paths")
            report_paths.add(path)
            require(owned(report, owners), f"{label}: report is outside owned_paths")
            valid_hash(run.get("report_sha256"), f"{label} report_sha256")
            check_file(root, report, run["report_sha256"])
        produced = hash_map(root, run.get("produced_files", {}), f"{label} produced_files",
                            run["status"] == "succeeded" and role in {"executor", "implementer"})
        for name in produced:
            require(owned(name, owners), f"{label}: produced file is outside owned_paths: {name}")
        if role == "verifier":
            require(nonempty(run.get("implementation_run_id")), f"{label}: implementation_run_id required")
            tested = hash_map(root, run.get("tested_files", {}), f"{label} tested_files", run["status"] == "succeeded")
            for name in tested:
                require(owned(name, owners), f"{label}: tested file is outside owned_paths: {name}")
        key = (role, task)
        require((role, task, start) not in attempt_starts, f"{label}: ambiguous retry started_at")
        attempt_starts.add((role, task, start))
        if key not in latest or start > latest[key][0]:
            latest[key] = (start, run)
        by_id[label] = run
        intervals.append((start, finish, run))
    implementer_agents = {run["agent_id"] for run in runs if run["role"] == "implementer"}
    for run in runs:
        if run["role"] == "verifier":
            require(run["agent_id"] not in implementer_agents,
                    f"{run['id']}: verifier agent_id was used by an implementer")
            implementation = by_id.get(run["implementation_run_id"])
            require(implementation is not None and implementation["role"] == "implementer"
                    and implementation["task"] == run["task"] and implementation["status"] == "succeeded",
                    f"{run['id']}: invalid implementation_run_id")
            require(utc(implementation["finished_at"], "Implementation finish") <= utc(run["started_at"], "Verifier start"),
                    f"{run['id']}: verifier started before its implementation finished")
            if run["status"] == "succeeded":
                require(set(implementation["produced_files"]) <= set(run["tested_files"]),
                        f"{run['id']}: tested_files must cover every implementation produced file")
    for i, (start, finish, run) in enumerate(intervals):
        for other_start, other_finish, other in intervals[:i]:
            overlaps = (finish is None or other_start < finish) and (other_finish is None or start < other_finish)
            if not overlaps:
                continue
            require((run["role"], run["task"]) != (other["role"], other["task"]),
                    f"Overlapping retries: {run['id']} and {other['id']}")
            require(run["agent_id"] != other["agent_id"],
                    f"Concurrent assignments reuse agent_id: {run['id']} and {other['id']}")
            for name in run["owned_paths"]:
                path = resolve(root, name)
                for other_name in other["owned_paths"]:
                    other_path = resolve(root, other_name)
                    conflict = (path.is_relative_to(other_path) or other_path.is_relative_to(path)
                                or (path.exists() and other_path.exists() and path.samefile(other_path)))
                    require(not conflict, f"Concurrent write ownership conflict: {run['id']} and {other['id']}: {name}")
    current = {}
    for key in sorted(expected):
        role, task = key
        if ROLES[role] > level:
            continue
        require(key in latest, f"Missing required assignment: {role}/{task}")
        run = latest[key][1]
        require(run["status"] == "succeeded", f"Latest attempt {run['id']} is {run['status']}: {role}/{task}")
        current[key] = run
    for (role, task), run in current.items():
        previous_phase = ROLES[role] - 1
        if previous_phase >= 0:
            for (other_role, _), previous in current.items():
                if ROLES[other_role] == previous_phase:
                    require(utc(previous["finished_at"], "Previous finish") <= utc(run["started_at"], "Current start"),
                            f"Phase barrier violation: {run['id']} started before {previous['id']} finished")
        produced = run.get("produced_files", {})
        if role == "implementer":
            required = {f"src/tools/{task}.py"}
            if route == "r":
                required.add(f"src/r_scripts/{task}.R")
            require(required <= set(produced), f"{run['id']}: missing required implementation files {sorted(required - set(produced))}")
            verifier = current.get(("verifier", task))
            if verifier:
                require(verifier["implementation_run_id"] == run["id"],
                        f"{verifier['id']}: verification refers to an older implementation attempt")
                produced = {}  # A verifier may repair implementation files; its tested hashes are authoritative.
        for name, sha in produced.items():
            check_file(root, name, sha)
        if role == "verifier":
            for name, sha in run["tested_files"].items():
                check_file(root, name, sha)
        result["passed_assignments"].append({"role": role, "task": task, "run_id": run["id"]})
    if level == 4:
        require(bool(active), "complete requires at least one active tutorial and verified module")
        _complete(root, state, current, excluded_tools, result)


def _complete(root, state, current, excluded_tools, result):
    completion = state.get("completion")
    require(isinstance(completion, dict), "complete requires a completion record")
    finished = utc(completion.get("finished_at"), "completion finished_at")
    require(all(utc(run["finished_at"], "Run finish") <= finished for run in current.values()),
            "Completion precedes required assignments")
    files = hash_map(root, completion.get("files"), "completion files", required=True)
    require(COMPLETION_FILES <= set(files), f"Missing completion files: {sorted(COMPLETION_FILES - set(files))}")
    for name, sha in files.items():
        check_file(root, name, sha)
    for name in ("src/requirements.txt", "USAGE.md"):
        require(bool(resolve(root, name).read_text().strip()), f"Empty required file: {name}")
    expected = names(read_json(resolve(root, "reports/expected-mcp-tools.json")), "Expected MCP inventory")
    require(not set(expected) & excluded_tools, "Excluded tools remain in the expected MCP inventory")
    cases = read_json(resolve(root, "reports/mcp-acceptance-cases.json"))
    require(isinstance(cases, list) and bool(cases), "Acceptance cases must be a nonempty array")
    contracts, positive = {}, set()
    for case in cases:
        require(isinstance(case, dict) and nonempty(case.get("name"))
                and case["name"] not in contracts and case.get("tool") in expected
                and isinstance(case.get("arguments"), dict), "Malformed/duplicate MCP acceptance case")
        contracts[case["name"]] = case["tool"]
        if "error_contains" not in case:
            result_assertion = "expected_subset" in case and case["expected_subset"] not in ({}, [])
            artifact_assertion = type(case.get("min_artifacts")) is int and case["min_artifacts"] > 0
            require(result_assertion or artifact_assertion, f"Case {case['name']}: positive call lacks output assertion")
            positive.add(case["tool"])
        else:
            require(nonempty(case["error_contains"]), "Malformed expected error assertion")
    require(positive == set(expected), "Acceptance cases lack positive coverage of every expected tool")
    servers, interpreters = set(), set()
    for name in ("reports/mcp-project-environment.json", "reports/mcp-clean-environment.json"):
        report = read_json(resolve(root, name))
        require(isinstance(report, dict) and report.get("success") is True
                and report.get("mode") == "calls" and report.get("require_all_tools") is True,
                f"{name}: requires successful strict real-call validation")
        for field in ("expected", "actual"):
            require(set(names(report.get(field), f"{name} {field}")) == set(expected),
                    f"{name}: {field} differs from expected inventory")
        require(report.get("missing") == [] and report.get("unexpected") == [], f"{name}: inventory discrepancies")
        outcomes = report.get("cases")
        require(isinstance(outcomes, list) and len(outcomes) == len(contracts), f"{name}: incomplete acceptance results")
        seen = set()
        for outcome in outcomes:
            require(isinstance(outcome, dict) and nonempty(outcome.get("name")), f"{name}: malformed case outcome")
            case_name = outcome["name"]
            require(case_name not in seen and case_name in contracts
                    and outcome.get("tool") == contracts[case_name] and outcome.get("success") is True,
                    f"{name}: failed, duplicate, or unmatched acceptance outcome")
            seen.add(case_name)
        require(nonempty(report.get("server")), f"{name}: missing server path")
        server = Path(report["server"])
        server = server.resolve() if server.is_absolute() else resolve(root, report["server"])
        require(server.is_relative_to(root), f"{name}: server outside project")
        server_name = server.relative_to(root).as_posix()
        require(server_name in files, f"{name}: server must be pinned in completion.files")
        servers.add(server_name)
        require(nonempty(report.get("python")), f"{name}: missing Python interpreter")
        interpreters.add(report["python"])
    require(len(servers) == 1, "Runtime reports refer to different servers")
    require(len(interpreters) == 2, "Project and clean runtime reports reuse the same Python interpreter")
    result["exposed_tools"] = sorted(expected)
    result["completion_files_checked"] = len(files)


def _protect_report(root, state_path, state, destination):
    """Protect recorded artifacts and reject replacement of unrelated existing files."""
    target = destination.resolve()
    protected = {state_path.resolve()}
    namespaces = []
    if isinstance(state, dict):
        repository = state.get("repository", {})
        tree = repository.get("source_tree", {}) if isinstance(repository, dict) else {}
        if isinstance(tree, dict) and isinstance(tree.get("path"), str):
            namespaces.append((root / tree["path"]).resolve())
        for tutorial in state.get("tutorials", []) if isinstance(state.get("tutorials"), list) else []:
            if isinstance(tutorial, dict) and isinstance(tutorial.get("source"), str):
                protected.add((root / tutorial["source"]).resolve())
        for item in sum([state.get(key, []) if isinstance(state.get(key), list) else [] for key in ("runs", "exclusions")], []):
            if not isinstance(item, dict):
                continue
            if isinstance(item.get("report"), str):
                protected.add((root / item["report"]).resolve())
            for field in ("produced_files", "tested_files"):
                if isinstance(item.get(field), dict):
                    protected.update((root / value).resolve() for value in item[field] if isinstance(value, str))
            if isinstance(item.get("owned_paths"), list):
                namespaces.extend((root / value).resolve() for value in item["owned_paths"] if isinstance(value, str))
        completion = state.get("completion", {})
        if isinstance(completion, dict) and isinstance(completion.get("files"), dict):
            protected.update((root / value).resolve() for value in completion["files"] if isinstance(value, str))
    require(not any(target == path or (target.exists() and path.exists() and target.samefile(path)) for path in protected),
            "Report path would overwrite a workflow input or implementation artifact")
    # Exact files are protected; active directory namespaces are also reserved for specialists.
    require(not any(path.is_dir() and target.is_relative_to(path) for path in namespaces),
            "Report path is inside an agent-owned directory")
    if destination.exists():
        previous = read_json(destination)
        require(isinstance(previous, dict) and previous.get("validator") == "paper2agent-workflow",
                "Report path already contains an unrelated file")


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--project-root", required=True, type=Path)
    parser.add_argument("--state", type=Path, default=Path("reports/agent-runs.json"), help="Relative paths use project root")
    parser.add_argument("--through", choices=PHASES, default="complete")
    parser.add_argument("--report", type=Path, help="Optional JSON output; always prints JSON to stdout")
    args = parser.parse_args(argv)
    root = args.project_root.resolve()
    state_path = args.state if args.state.is_absolute() else root / args.state
    state = None
    try:
        state = read_json(state_path)
        result = validate(root, state, args.through)
    except (ValueError, OSError) as exc:
        result = {"validator": "paper2agent-workflow", "schema_version": 1, "success": False,
                  "through": args.through, "errors": [f"{type(exc).__name__}: {exc}"], "scope": LIMIT}
    result["project_root"] = str(root)
    result["state"] = str(state_path.resolve())
    if args.report:
        destination = args.report if args.report.is_absolute() else root / args.report
        try:
            _protect_report(root, state_path, state, destination)
            destination.parent.mkdir(parents=True, exist_ok=True)
            destination.write_text(json.dumps(result, indent=2) + "\n")
        except (ValueError, TypeError, OSError) as exc:
            result["success"] = False
            result["errors"].append(f"Report not written: {type(exc).__name__}: {exc}")
    print(json.dumps(result, indent=2))
    return 0 if result["success"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
