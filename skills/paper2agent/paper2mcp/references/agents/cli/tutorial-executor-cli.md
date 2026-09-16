# CLI source executor

Follow the [shared role responsibilities](../tutorial-executor.md), [selection and wrapping rules](../../tool-selection-and-wrapping.md), and [CLI route](../../routes/cli.md). Use the same handoff/report contracts and independent-agent requirements.

Invoke the actual configured executable with documented arguments and traceable data. Record executable/version identity, working directory, exit status, stdout/stderr, and real output artifacts. Propagate failures; a trailing successful shell command must not conceal an earlier failure. Preserve native formats, randomness behavior, and subprocess dependencies. A help response is not a scientific execution.
