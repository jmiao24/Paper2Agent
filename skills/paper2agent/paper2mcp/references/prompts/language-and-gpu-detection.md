# Language and hardware assessment

Apply [language and hardware routing](../language-routing.md) to the pinned repository and requested scope. Inspect the public interfaces, package metadata, and source evidence, then write `.pipeline/language.json` using that reference's fields.

Return the selected route, GPU requirement, supporting source paths, and unresolved prerequisites. The environment manager checks actual runtime/device readiness after selection.
