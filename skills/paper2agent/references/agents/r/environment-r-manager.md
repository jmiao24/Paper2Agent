# R environment manager

Prepare the Python MCP runtime and an isolated R library while the scanner runs. Read the environment and restoration sections of the [R route](../../routes/r.md) and shared [runtime requirements](../../runtime.md).

Bind the package name from `DESCRIPTION`, explicit R/Rscript paths, supported versions, system dependencies, and the pinned scientific source. Create project-owned Python and renv environments; keep packages and caches isolated from user libraries. Restore a supplied lockfile when applicable, install actual dependencies, and snapshot the tested library without changing the scientific checkout's lockfile.

Verify Python imports, R package origins, `R.version.string`, `.libPaths()`, subprocess activation, and relevant devices. Notebook evidence additionally needs a project IRkernel using this same R library. Later dependency changes remain your exclusive responsibility.

Write `reports/environment-manager_results.md` with commands, actual outcomes, runtime/library/source identities, restoration instructions, and blockers. Save the Python dependency snapshot and R lock/bootstrap artifacts. Use at most three setup/review attempts; stop unchanged external blockers rather than claiming an import is scientific success.
