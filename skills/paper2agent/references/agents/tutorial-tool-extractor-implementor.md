# Tool implementer

Implement the selected tools in one assigned source module after all execution handoffs complete. Read the implementer section of [tool selection and minimal wrappers](../tool-selection-and-wrapping.md), [runtime requirements](../runtime.md), and the selected route.

## Inputs

Use the coordinator's selected tool names, concrete upstream bindings, completed execution evidence, parameter/output contracts, and exclusive ownership. Inspect the actual upstream implementation and reference call before writing code. Report an unimplemented or unverifiable operation instead of inventing it.

## Implementation

- Prefer direct public API calls. Invoke an existing script/CLI when that is the selected interface. Extract existing source sections only when no callable interface implements the task; keep attribution and scientific computation intact.
- Build minimal wrappers: accept typed inputs, check necessary contracts, call the bound implementation, and serialize useful results. Preserve identifiers, units, defaults, assumptions, and method choices. Do not duplicate algorithms for production validation or add unrelated statistics/framework code.
- Use user file paths for large scientific objects, explicit metadata/group parameters, and source-supported options needed by the task. Make required inputs required in the function signature. Defaults must be meaningful for the bound computation; never silently load demo data or manufacture groups.
- Give each tool a descriptive name, a concise scientific-use description, and documented inputs/outputs. Keep internal helpers undecorated. Do not create a tool for every section or intermediate step.
- Write output files into a fresh directory for each invocation and return absolute artifact paths plus useful concise metadata. Preserve native structures and meaningful source figures; benchmark-only outputs need not be production outputs. Keep diagnostics off protocol stdout.
- Remove notebook UI directives, empty headings, and unused helpers/imports. Retain scientific explanations and required setup. Use credentials from runtime configuration without persisting them.

For Python, place tools in `src/tools/<module>.py`, with a named `FastMCP` instance `<module>_mcp` and typed `@<module>_mcp.tool()` functions. R uses the Python/R file pair in its route; CLI uses `cli_wrapper.py`. Assign any shared helper explicitly before writing it.

## Python tool format

Every exposed tool follows this shape; verifiers check it.

```python
"""Tools extracted from <repo>/colabs/batch_variant_scoring.ipynb."""
from typing import Annotated, Literal

REFERENCE = "https://github.com/<owner>/<repo>/blob/<commit>/colabs/batch_variant_scoring.ipynb"
batch_variant_scoring_mcp = FastMCP(name="batch_variant_scoring")

@batch_variant_scoring_mcp.tool()
def alphagenome_score_variants_batch(
    data_path: Annotated[str, "CSV with variant_id, CHROM, POS (1-based), REF, ALT columns"],
    organism: Annotated[Literal["human", "mouse"], "hg38 human or mm10 mouse"] = "human",
    sequence_length: Annotated[Literal["16KB", "100KB", "500KB", "1MB"], "Prediction context"] = "1MB",
    score_rna_seq: Annotated[bool, "Include the recommended RNA_SEQ scorer"] = True,
    score_splice_sites: Annotated[bool, "Include the recommended SPLICE_SITES scorer"] = True,
    output_dir: Annotated[str | None, "Base output directory; a fresh subdirectory is created"] = None,
) -> dict:
    """Score a table of variants with the selected AlphaGenome modality scorers.
    Input is a variant CSV; output is a tidy per-gene/track score CSV.
    """
    ...
    return {"message": "...", "reference": REFERENCE,
            "artifacts": [{"description": "tidy scores", "path": str(csv_path.resolve())}],
            "num_rows": int(len(df))}
```

Rules:

- `Annotated[type, "one sentence"]` on every parameter; the description is the schema documentation. No Pydantic `BaseModel` wrappers for simple records: use flat scalars (`chromosome`, `position`, `reference_bases`, `alternate_bases`).
- `Literal[...]` for closed choices (organism, context length, output type, aggregation). Map user-facing values to upstream enums inside the function.
- One `bool` flag per named option when the source offers a fixed set of toggles (scorers, output types, plot layers); a `list[str]` only for open-ended values such as ontology terms.
- Required inputs have no default; `data_path`/`*_path` for tabular or large inputs; scalars for single records.
- Docstring is exactly two lines: task, then input → output.
- Return a JSON-serializable `dict` with `message`, `reference`, and `artifacts: [{"description", "path"}]` (absolute paths, fresh directory per call); add compact summary fields (counts, shapes, resolved settings), never full arrays.
- Add `seed` only when the bound upstream code is actually seedable.

## Handoff

Perform import/startup checks and a bounded development smoke check on real reference inputs. This does not substitute for the fresh verifier. Review up to three implementation attempts, retaining failures and changes.

Write `reports/implementation-<module>.json` or the assigned report. Map each exposed name to upstream calls or extracted source location, parameter/default choices, necessary I/O adaptations, outputs, and any scientific transformation with its source. Include actual check outcomes and hashes for every produced production file. Explain deviations; do not label a source defect as a wrapper repair.

Stop production edits at handoff. The coordinator launches independent verification only after every implementation assignment has finished.
