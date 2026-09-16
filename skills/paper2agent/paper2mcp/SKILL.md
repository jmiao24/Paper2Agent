---
name: paper2mcp
description: Convert Python, R, or command-line research repositories into tested MCP tools through useful tool selection, minimal wrappers around existing code, parallel specialists, and independent verification. Use for repository-to-MCP conversions and resumes; requires a host with agent spawning.
---

# Paper2MCP

Build a tested MCP server from a research repository. Select useful operations, bind each to an existing implementation, and expose it through a minimal wrapper. Scientific computation stays in the repository's code; the skill coordinates selection, execution, implementation, and verification.

## Start here

1. Obtain the repository URL or local checkout, output project directory, and any requested tasks, source/tutorial filter, or resource limits. Ask only for missing required inputs.
2. Read [orchestration](references/orchestration.md) for workspace setup, agent assignments, handoffs, and resume behavior.
3. Read [language and hardware routing](references/language-routing.md). Choose Python, R, or CLI by the interface being converted. Use the Python stages below or the [R](references/routes/r.md) / [CLI](references/routes/cli.md) route.
4. Apply [tool selection and minimal wrappers](references/tool-selection-and-wrapping.md) during scanning, implementation, and independent verification. Read [runtime requirements](references/runtime.md) when preparing environments and validating the server. Load only the current stage and relevant role instructions.

## Workflow

| Stage | Coordinator | Python specialists | Completion marker |
| --- | --- | --- | --- |
| 1. Environment and tool selection | [Setup and selection](references/prompts/setup-and-discovery.md) | [Environment manager](references/agents/environment-python-manager.md) and [scanner](references/agents/tutorial-scanner.md), concurrently | `environment_and_selection_done` |
| 2. Source execution and reference results | [Execution](references/prompts/tutorial-execution.md) | Parallel [executors](references/agents/tutorial-executor.md) | `reference_execution_done` |
| 3. Implementation, then independent verification | [Implementation and testing](references/prompts/tool-extraction-and-testing.md) | Parallel [implementers](references/agents/tutorial-tool-extractor-implementor.md), then fresh [verifiers](references/agents/test-verifier-improver.md) | `implementation_and_verification_done` |
| 4. MCP integration | [Integration](references/prompts/mcp-integration.md) | Coordinator | `mcp_integration_done` |
| 5. Runtime installation validation | [Requirements](references/prompts/runtime-requirements.md) | Coordinator | `runtime_validation_done` |
| 6. Documentation and ZIP delivery | [Documentation](references/prompts/usage-documentation.md) and [output delivery](references/output-delivery.md) | Coordinator and independent delivery verifier | `delivery_done` |

R and CLI have their own environment and transport instructions. They share selection, source reuse, agent independence, and completion requirements.

## Essential requirements

- Choose tools by independently useful tasks on new inputs. Check public interfaces and official examples/tests for gaps in tutorials. Merge duplicates and keep incidental steps internal; headings do not determine tool boundaries.
- Bind every tool to concrete source code. Prefer direct API/script/CLI calls; extract existing tutorial code only when no callable implementation exists. Do not invent scientific algorithms to fill repository gaps.
- Run the bound upstream code with traceable inputs before implementation. Preserve native results, relevant figures, metadata, and reproducibility settings for comparison.
- Keep generated code focused on necessary input checks, upstream calls, and useful output serialization. Expose needed source-supported parameters and test them. Keep benchmark recomputation out of production wrappers.
- Finish all implementation assignments before launching verifiers. Every verifier must be a fresh agent distinct from every implementer. Verification checks source reuse, code quality, reference agreement, changed inputs, and relevant failures.
- Record blocked, merged, deferred, and excluded work with reasons. Never weaken scientific assertions or silently drop a requested tool to report success.

## Helpers and completion

- [verify_workflow.py](scripts/verify_workflow.py) checks recorded assignments, agent separation, phase order, and artifact hashes. Follow the [workflow-state contract](references/workflow-state.md) at each handoff.
- [verify_mcp_server.py](scripts/verify_mcp_server.py) launches the server over stdio and checks inventory, input schemas, and saved acceptance calls. Run it in the project and a fresh runtime using the [acceptance contract](references/runtime-verification.md).
- For notebook evidence, use [extract_notebook_images.py](scripts/extract_notebook_images.py) before creating a separate compact view with [preprocess_notebook.py](scripts/preprocess_notebook.py). Preserve the full executed notebook for scientific checks.

Write stage success markers only after their evidence and workflow gate pass. Worker completion alone does not establish success. Final delivery requires runtime validation, recipient-facing `USAGE.md`, and a ZIP that passes installation and real calls after extraction at a new location. Follow the [output contract](references/output-delivery.md); keep examples and intermediate artifacts outside the default ZIP.

Lead the final response with `dist/<repo-name>-mcp.zip`, then the delivered tools, installation/startup directions or usage link, actual validation scope, and external requirements. Keep detailed selection and validation evidence in the working project. State important deferred/excluded work and limits; selected-tool verification does not establish whole-repository correctness. Client registration is performed only when requested.

Read [optional extensions](references/extensions.md) only for requested resources/prompts, user-query evaluations, containers, or remote deployment.
