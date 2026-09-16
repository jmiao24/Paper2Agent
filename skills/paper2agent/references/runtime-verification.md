# Runtime acceptance cases

Read during independent verification and final integration. The scientific tests establish agreement with direct upstream reference results; these cases check that the packaged server can expose and execute those functions in each runtime.

## Prepare the contract independently

After exclusions, the coordinator writes `reports/expected-mcp-tools.json` from the independently tested inventories. Account for mount prefixes when naming exposed tools. Do not derive the expected list from the server's own discovery response.

Each verifier writes cases to its owned `reports/mcp-acceptance-<module>.json`; the coordinator merges them into the nonempty JSON array `reports/mcp-acceptance-cases.json` after verification finishes. Use actual source-backed fixtures and expected results established by the independent verifier. Example shape only:

```json
[
  {
    "name": "tutorial-reference",
    "tool": "analyze",
    "arguments": {"data_path": "/project/tests/data/input.csv", "output_dir": "/project/tmp/outputs/acceptance"},
    "required_inputs": ["data_path", "output_dir"],
    "expected_subset": {"summary": {"sample_count": 12}},
    "min_artifacts": 1,
    "artifact_root": "/project/tmp/outputs/acceptance",
    "unique_artifacts": true
  }
]
```

Replace illustrative names, paths, and numbers with independently verified values. Keep credentials in the process environment; cases and reports must not contain secrets.

## Case fields

| Field | Check |
| --- | --- |
| `name`, `tool`, `arguments` | Unique case name, expected exposed tool, JSON arguments |
| `required_inputs` | Exact set of schema-required input names, including an empty set when appropriate |
| `expected_subset` | Recursive subset for objects; exact values and lengths for arrays/scalars |
| `min_artifacts` | Minimum number of returned `artifacts` entries with absolute, existing paths |
| `artifact_root` | Absolute allowed output root; resolved paths must stay within it |
| `unique_artifacts` | Reject repeated artifact paths within this verification run |
| `error_contains` | Require an MCP tool error whose text contains this stable fragment; incompatible with successful-output assertions |

Choose stable summaries or integer/shape fields for exact JSON comparisons. Use the scientific tests for floating-point tolerances, full matrix comparisons, and figure content; the helper does not open files to compare their scientific values. Do not relax a scientific comparator to fit an exact JSON field check.

Include at least one successful case per exposed tool, schema expectations for each tool, negative input cases where applicable, and repeated calls for tools producing new files. An expected error or timeout does not count as a successful execution case. Use fresh outputs for each runtime run and make any dependent inputs explicit.

## Execute and assess

Run `scripts/verify_mcp_server.py` with the selected runtime's Python, `--cases`, and `--require-all-tools`, using the command in [runtime requirements](runtime.md). The strict flag requires positive cases with a result/artifact assertion for every expected tool. Omitting `--cases` performs inventory-only diagnostics and cannot satisfy final acceptance.

The helper records interpreter, FastMCP version, inventory differences, schemas, and per-case results in its JSON report. Inspect failures and verify artifact contents with the scientific test suite. `min_artifacts` checks existence, not correctness. Output schemas are recorded, not independently compared against an oracle by this helper; test actual return values against the documented contract.

Validate once in the development environment and again after fresh runtime installation. Preserve the clean-runtime report before removing only the temporary environment created for validation. An unresolved credential, dataset, GPU, R, or native-binary dependency means the affected execution is unvalidated, even when tool listing succeeds.
