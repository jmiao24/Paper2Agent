# R source executor

Follow the [shared role responsibilities](../tutorial-executor.md), [selection and wrapping rules](../../tool-selection-and-wrapping.md), and [R route](../../routes/r.md). Use the same handoff/report contracts and independent-agent requirements.

Execute with the selected R/Rscript and activated project renv library. R notebook evidence uses its project IRkernel; native R scripts can run directly. Use the source's R loader/generator and RNG mechanism. Retain RDS for objects whose classes, attributes, factors, sparse structure, or precision would be lost in CSV. Compare a replay using saved inputs and record the actual R/package/library identities.
