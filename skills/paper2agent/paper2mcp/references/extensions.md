# Optional extensions

Read only the section relevant to the requested deliverable. The default conversion ends with the tested ZIP and usage documentation defined by [output delivery](output-delivery.md). These extensions use the same verified inventory and do not replace scientific tests or add automatic extra stages.

## MCP resources and workflow prompts

Use when the server should expose reference material or guide a workflow involving several tools.

- **Resources** supply stable context: input schemas, package-method documentation, reference-data metadata, and links to larger artifacts. Select relevant material from the repository, retain source attribution, and define stable URIs and MIME types. Expose only intended files; do not turn a resource template into arbitrary filesystem access.
- **Prompts** provide a reusable user workflow: required inputs, tool order, dependent outputs, and interpretation limits. Reference actual exposed tool names and schemas. A prompt returns instructions; it does not itself execute the analysis or establish that it ran.
- Add registrations to the generated server using the installed FastMCP version's `resource` and `prompt` APIs. Keep runtime dependencies and startup behavior consistent with the tested server.
- Verify advertised resources can be read and templates reject invalid parameters. Render each prompt with representative arguments, inspect its tool names and artifact references, and run its underlying workflow when validating execution claims. Test from both the project and clean runtime using the MCP client.

The tool verifier in `scripts/verify_mcp_server.py` checks tools only. Add separate client checks for resources/prompts and record their results; listing them does not validate their content. See the official [resources](https://gofastmcp.com/servers/resources) and [prompts](https://gofastmcp.com/servers/prompts) documentation for the installed API.

## User-query evaluation

Use when assessing whether an agent can solve user tasks with the converted server, beyond whether each function reproduces a tutorial.

Build a small benchmark from repository-supported tasks and held-out tutorial inputs. For each case record the user question, available input artifacts, expected scientific outcome, source of that expectation, and numerical/structural acceptance criteria. Include a dependent multi-tool workflow if the server supports one, and a request with missing required inputs to check that the agent does not invent them.

Give a fresh evaluation agent the question, inputs, and MCP server access, without the expected answer or implementer's reasoning. Keep the oracle with the evaluator/coordinator. Record actual tool calls, output artifacts, execution errors, and final answer; score correctness separately from successful completion and any observed runtime/cost. Do not equate a plausible written answer with successful execution.

Write cases and outcomes under the generated project's `benchmarks/`. Use a documented output comparator for structured data and a concise rubric for interpretation. Report denominators and failed cases, and identify whether the model/agent, wrapper, or scientific method caused each failure when evidence supports that distinction. Describe a small evaluation as such; do not claim general scientific validity from it.

## Containers and remote deployment

Use when a container or remote deployment is requested. First choose the target's actual constraints: stdio versus HTTP, Python/R/native runtime, GPU access if required, persistent outputs, and data/model availability.

Prepare only the needed package: a container/build definition or host launch configuration, pinned tested requirements, any R lock/bootstrap files or CLI binaries, and installation/launch instructions. Preserve required source/license notices. Supply credentials at runtime and mount large/private inputs rather than embedding them in an image. HTTP deployment needs the target's authentication and network configuration.

Build and launch in an isolated test environment when available, then execute the same acceptance cases using that deployment's transport. For HTTP, use an HTTP MCP client check; the bundled stdio verifier does not validate a remote endpoint. Check output persistence and repeated calls in the deployment filesystem. Record any platform/GPU dependency not exercised.

Creating a deployment package does not publish it. Perform registry pushes, remote provisioning, or client registration only when included in the user's authorization; when approval is needed, present the completed package and validation result first.
