# Language and hardware assessment

Inspect README usage, packaging metadata, actual public entry points, selected tutorial/example interfaces, and implementation. Use [language routing](../language-routing.md).

Choose `python` for imported Python APIs, `r` for R package APIs, or `cli` for commands, including Python/R scripts invoked as programs. Installation commands and file-extension counts do not determine the interface. Honor explicit task scope and supported route choices; split mixed-interface work into separately validated conversion projects when needed.

Classify GPU use for the selected computation as `required`, `optional`, `none`, or `unknown`. Inspect documented CPU paths, defaults, and unconditional device operations. A CUDA dependency alone does not imply a GPU requirement. Resolve unknown requirements or report the affected work blocked before execution; do not substitute a different method.

Write `.pipeline/language.json` with `language`, `requires_gpu` (true only for required), `gpu_requirement`, `language_reason`, `gpu_reason`, `cli_backend` when applicable, source identity, requested scope/filter, and supporting evidence paths. Confirm actual runtime/device readiness during environment setup and recheck after selection changes.
