#!/usr/bin/env python3
"""Verify a local FastMCP server over stdio, optionally executing smoke cases."""
import argparse
import asyncio
import importlib.metadata
import json
import os
from pathlib import Path
import sys


def require(condition, message):
    if not condition:
        raise ValueError(message)


def unique_names(value):
    return (isinstance(value, list) and bool(value)
            and all(isinstance(n, str) and bool(n.strip()) for n in value)
            and len(value) == len(set(value)))


def validate_cases(cases, expected, require_all_tools=False):
    require(isinstance(cases, list) and bool(cases), "Cases must be a nonempty JSON array")
    names = []
    allowed = {"name", "tool", "arguments", "required_inputs", "expected_subset",
               "min_artifacts", "artifact_root", "unique_artifacts", "error_contains"}
    for case in cases:
        require(isinstance(case, dict), "Each case must be an object")
        require(not set(case) - allowed, "Unknown case fields")
        name = case.get("name")
        require(isinstance(name, str) and bool(name.strip()), "Each case needs a name")
        names.append(name)
        require(case.get("tool") in expected, f"Case {name}: tool absent from expected inventory")
        require(isinstance(case.get("arguments"), dict), f"Case {name}: arguments must be an object")
        if "required_inputs" in case:
            required = case["required_inputs"]
            require(required == [] or unique_names(required), f"Case {name}: invalid required_inputs")
        if "min_artifacts" in case:
            count = case["min_artifacts"]
            require(type(count) is int and count >= 0, f"Case {name}: invalid min_artifacts")
        if "artifact_root" in case:
            root = case["artifact_root"]
            require(isinstance(root, str) and Path(root).is_absolute(),
                    f"Case {name}: artifact_root must be absolute")
        if "unique_artifacts" in case:
            require(type(case["unique_artifacts"]) is bool, f"Case {name}: invalid unique_artifacts")
        if "error_contains" in case:
            require(isinstance(case["error_contains"], str) and bool(case["error_contains"].strip()),
                    f"Case {name}: error_contains must be nonempty")
            require(not {"expected_subset", "min_artifacts", "artifact_root", "unique_artifacts"} & set(case),
                    f"Case {name}: error cases cannot assert successful outputs")
    require(unique_names(names), "Case names must be unique")
    if require_all_tools:
        positive = [case for case in cases if "error_contains" not in case]
        missing = set(expected) - {case["tool"] for case in positive}
        require(not missing, f"Tools lack positive acceptance cases: {sorted(missing)}")
        for case in positive:
            has_result = "expected_subset" in case and case["expected_subset"] not in ({}, [])
            require(has_result or case.get("min_artifacts", 0) > 0,
                    f"Case {case['name']}: acceptance needs a result or artifact assertion")


def check_subset(actual, expected, location="result"):
    if isinstance(expected, dict):
        require(isinstance(actual, dict), f"{location}: expected an object")
        for key, value in expected.items():
            require(key in actual, f"{location}: missing field {key}")
            check_subset(actual[key], value, f"{location}.{key}")
    elif isinstance(expected, list):
        require(isinstance(actual, list) and len(actual) == len(expected),
                f"{location}: array length/type mismatch")
        for i, (value, reference) in enumerate(zip(actual, expected)):
            check_subset(value, reference, f"{location}[{i}]")
    else:
        require(actual == expected and (not isinstance(actual, bool) and not isinstance(expected, bool)
                                       or type(actual) is type(expected)),
                f"{location}: value mismatch")


def check_artifacts(data, case, previous):
    artifacts = data.get("artifacts", []) if isinstance(data, dict) else []
    require(isinstance(artifacts, list), "Result artifacts must be an array")
    require(len(artifacts) >= case.get("min_artifacts", 0), "Too few returned artifacts")
    root = Path(case["artifact_root"]).resolve() if "artifact_root" in case else None
    paths = []
    for artifact in artifacts:
        require(isinstance(artifact, dict) and isinstance(artifact.get("path"), str),
                "Artifact needs a path string")
        path = Path(artifact["path"])
        require(path.is_absolute() and path.exists(), "Artifact path must be absolute and exist")
        path = path.resolve()
        if root is not None:
            require(path.is_relative_to(root), "Artifact resolves outside artifact_root")
        require(str(path) not in paths, "Duplicate artifact path in one result")
        if case.get("unique_artifacts"):
            require(str(path) not in previous, "Artifact path reused across calls")
        paths.append(str(path))
    return paths


async def verify(server, expected, cases, cwd, timeout, call_timeout, report):
    from fastmcp import Client

    config = {"mcpServers": {"paper2agent-check": {
        "command": sys.executable, "args": [str(server)], "cwd": str(cwd),
        "env": dict(os.environ)
    }}}
    client = Client(config)
    entered = False
    try:
        await asyncio.wait_for(client.__aenter__(), timeout)
        entered = True
        discovered = await asyncio.wait_for(client.list_tools(), timeout)
        actual = [tool.name for tool in discovered]
        report.update({"expected": sorted(expected), "actual": sorted(actual),
                       "missing": sorted(set(expected) - set(actual)),
                       "unexpected": sorted(set(actual) - set(expected)),
                       "schemas": {tool.name: {"input": schema_field(tool, "input"),
                                              "output": schema_field(tool, "output")}
                                   for tool in discovered}, "cases": []})
        require(len(actual) == len(set(actual)), "Server exposed duplicate tool names")
        require(not report["missing"] and not report["unexpected"], "Tool inventory mismatch")
        previous = set()
        for case in cases:
            outcome = {"name": case["name"], "tool": case["tool"], "success": False}
            report["cases"].append(outcome)
            try:
                if "required_inputs" in case:
                    actual_required = report["schemas"][case["tool"]]["input"].get("required", [])
                    require(set(actual_required) == set(case["required_inputs"]),
                            "Required input schema does not match contract")
                result = await asyncio.wait_for(
                    client.call_tool(case["tool"], case["arguments"], raise_on_error=False),
                    call_timeout)
                if "error_contains" in case:
                    error_text = "\n".join(getattr(block, "text", "") for block in result.content)
                    require(result.is_error and case["error_contains"] in error_text,
                            "Expected tool error response was not received")
                else:
                    require(not result.is_error, "Tool returned an unexpected error")
                    if "expected_subset" in case:
                        check_subset(result.data, case["expected_subset"])
                    paths = check_artifacts(result.data, case, previous)
                    previous.update(paths)
                    outcome["artifacts_checked"] = len(paths)
                outcome["success"] = True
            except Exception as exc:
                outcome["error"] = f"{type(exc).__name__}: {exc}"
        report["success"] = all(case["success"] for case in report["cases"])
    finally:
        if entered:
            await asyncio.wait_for(client.__aexit__(None, None, None), timeout)


def schema_field(tool, kind):
    # MCP SDK versions use snake_case or camelCase; prefer the current field.
    name = f"{kind}_schema"
    if hasattr(tool, name):
        return getattr(tool, name)
    return getattr(tool, f"{kind}Schema", None)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--server", required=True, type=Path)
    parser.add_argument("--expected", required=True, type=Path)
    parser.add_argument("--cases", type=Path, help="JSON smoke calls; omit for inventory-only verification")
    parser.add_argument("--require-all-tools", action="store_true",
                        help="Require positive cases with output assertions for every expected tool")
    parser.add_argument("--cwd", type=Path, default=Path.cwd())
    parser.add_argument("--report", required=True, type=Path)
    parser.add_argument("--timeout", type=float, default=60, help="Startup/list/close timeout in seconds")
    parser.add_argument("--call-timeout", type=float, default=300)
    args = parser.parse_args()
    inputs = [args.server.resolve(), args.expected.resolve()]
    if args.cases:
        inputs.append(args.cases.resolve())
    # Reject before the error-report writer can overwrite an input, including symlinks/hardlinks.
    require(all(args.report.resolve() != p and not (args.report.exists() and p.exists()
                and args.report.samefile(p)) for p in inputs), "Report path must differ from input paths")
    report = {"success": False, "mode": "calls" if args.cases else "inventory-only",
              "require_all_tools": args.require_all_tools,
              "server": str(args.server.resolve()), "cwd": str(args.cwd.resolve()),
              "python": sys.executable, "python_version": sys.version.split()[0]}
    try:
        require(args.timeout > 0 and args.call_timeout > 0, "Timeouts must be positive")
        require(args.server.is_file(), "Server file does not exist")
        require(args.cwd.is_dir(), "Working directory does not exist")
        expected = json.loads(args.expected.read_text())
        require(unique_names(expected), "Expected tools must be a nonempty list of unique names")
        cases = json.loads(args.cases.read_text()) if args.cases else []
        require(not args.require_all_tools or args.cases is not None,
                "--require-all-tools requires --cases")
        if args.cases:
            validate_cases(cases, expected, args.require_all_tools)
        report["fastmcp"] = importlib.metadata.version("fastmcp")
        asyncio.run(verify(args.server.resolve(), expected, cases, args.cwd.resolve(),
                           args.timeout, args.call_timeout, report))
    except Exception as exc:
        report["success"] = False
        report["error"] = f"{type(exc).__name__}: {exc}"
    args.report.parent.mkdir(parents=True, exist_ok=True)
    args.report.write_text(json.dumps(report, indent=2) + "\n")
    print(json.dumps({"success": report["success"], "mode": report["mode"],
                      "cases_checked": len(report.get("cases", [])), "report": str(args.report)}))
    return 0 if report["success"] else 1


if __name__ == "__main__":
    raise SystemExit(main())
