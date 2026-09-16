# CLI tool implementer

Follow the [shared role responsibilities](../tutorial-tool-extractor-implementor.md), [selection and wrapping rules](../../tool-selection-and-wrapping.md), and [CLI route](../../routes/cli.md). Use the same handoff/report contracts and independent-agent requirements.

Own src/tools/cli_wrapper.py as the single CLI implementation module. Use bounded argument lists with shell=False and source-supported typed parameters; never expose arbitrary shell execution. Use the proper Python/R/native executable from the route. Resolve input paths before changing cwd, capture diagnostics off protocol stdout, enforce timeouts/exit status, and return real outputs. Invoke the existing program rather than extracting or recreating its algorithm.
