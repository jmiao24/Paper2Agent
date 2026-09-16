---
name: paper2agent
description: Convert research papers and associated files, research code, or both into a reviewed paper skill and tested MCP server. Use for paper-only, code-only, or combined conversions and resumes.
---

# Paper2Agent

Route by the supplied inputs and requested outcome:

- For paper PDFs and associated files, follow [Paper2Skill](paper2skill/SKILL.md).
- For a research code repository, follow [Paper2MCP](paper2mcp/SKILL.md).
- When both outputs are requested, follow both workflows.

Resolve each component's scripts and references relative to its own directory; bind `SKILL_ROOT` to that component. Keep their work directories separate. Independent paper and code tasks may run concurrently within host limits. Every MCP tool must bind to existing repository code.

Combined output:

```text
dist/<project>-agent/
├── skill/<paper-name>/
└── mcp/<repository-name>-mcp/
```

Build the paper skill at its final component path and pass its strict verification. Complete Paper2MCP's existing runtime and ZIP delivery checks, then stage the verified archive contents under `mcp/` and confirm the files are unchanged. Keep review and development evidence outside the delivery.

Single-mode runs retain their component's output contract. Report delivery paths, verification results and limitations. If either component is blocked, report the combined result as partial.
