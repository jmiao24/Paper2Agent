# Language and hardware routing

Read after repository setup and before environment setup. Use the [language/GPU assessment](prompts/language-and-gpu-detection.md) with inspected repository content and the requested scope.

## Select by the public interface

| Intended use in the selected tutorials | Route | Instructions |
| --- | --- | --- |
| Import and call a Python library | `python` | Python table in [SKILL.md](../SKILL.md) |
| Load an R package and call its functions | `r` | [R route](routes/r.md) |
| Run commands, including `python script.py`, `Rscript script.R`, shell scripts, or installed binaries | `cli` | [CLI route](routes/cli.md) |

Honor an explicit user route and exact tutorial filter, verifying that the requested interface exists. A setup command such as `pip install` is not a CLI interface. Inspect README usage, packaging metadata, actual entry points, and tutorials; file-extension counts do not decide the route.

For mixed repositories, select the route for the requested capability. If multiple requested capabilities need different routes, use separate conversion output directories and inventories, then integrate only after each is verified. Avoid a repository-wide guess that silently drops requested capabilities.

## GPU requirement

Classify the **selected computation** as `required`, `optional`, `none`, or `unknown`. A CUDA-capable dependency or `--gpu` option alone does not establish that a GPU is required. Check documented CPU paths, device defaults, and unconditional GPU operations. An API client may run locally on CPU while computation happens remotely.

Record `requires_gpu` as true only for `required`, and use `gpu_requirement` to distinguish optional, absent, and unknown device needs. An `unknown` assessment must be resolved or reported as blocked before running an affected tutorial. Check actual device/runtime availability during environment setup; do not silently replace the tutorial's method with an easier CPU computation.

## Persist and recheck

Write `.pipeline/language.json` with:

- `language`, `requires_gpu`, `language_reason`, `gpu_reason` with evidence-backed values;
- `gpu_requirement`, `cli_backend` (`python`, `r`, or `other`, when applicable);
- repository identity and commit, relevant dirty-file hashes for local changes, requested filter, route override, and evidence paths.

After discovery, confirm the route and hardware requirements against the selected tutorials. On resume, reuse the decision only while these inputs still match. If they change, revisit the decision and affected downstream artifacts through the [orchestration resume rules](orchestration.md).
