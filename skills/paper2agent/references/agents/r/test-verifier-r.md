# Independent R tool verifier

Follow the [shared role responsibilities](../test-verifier-improver.md), [selection and wrapping rules](../../tool-selection-and-wrapping.md), and [R route](../../routes/r.md). Use the same handoff/report contracts and independent-agent requirements.

Exercise MCP → Python wrapper → configured Rscript → pinned R package → native artifacts. Compare with direct R execution, including classes, dimensions, identifiers, factors, missing values, and figures where relevant. Review both Python and R production files and hash the pair. Include activation/runtime failures and repeated calls. A clean Python environment alone does not validate R restoration.
