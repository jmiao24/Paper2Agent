# R tool implementer

Follow the [shared role responsibilities](../tutorial-tool-extractor-implementor.md), [selection and wrapping rules](../../tool-selection-and-wrapping.md), and [R route](../../routes/r.md). Use the same handoff/report contracts and independent-agent requirements.

Create src/tools/<module>.py and src/r_scripts/<module>.R as a single owned pair. The Python wrapper handles typed inputs and subprocess/artifact transport; the R entry script activates the project library and calls the bound R API. Do not translate the method into Python or rewrite it in R. Pass parameters as data arguments, preserve factors and missing values, and follow the route's file-based result contract.
