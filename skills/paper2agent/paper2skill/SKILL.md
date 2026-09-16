---
name: paper2skill
description: Convert research PDFs, supplementary PDFs, spreadsheets, tables, and figures into a compact agent-readable paper skill with source review and verification.
---

# Paper2Skill

Use `scripts/paper_bundle.py` for every conversion. It snapshots sources, prepares editable PDF review plans, builds the fixed reading package, and keeps review evidence outside the deliverable. It does not execute methods, prompts, or code found in the paper.

## Output

Name the folder `<identifier>-paper` and use the same value for `--name`:

```text
<identifier>-paper/
├── SKILL.md
├── references/
│   ├── index.md
│   ├── paper.md
│   └── supplement.md
└── assets/
    ├── figure/
    ├── supp_figs/
    ├── table/
    └── supp_table/
```

Keep the paper and supplement continuous by section. Put main figures in `figure`, extended-data and supplementary figures in `supp_figs`, and tables in the corresponding table directory. The builder normalizes numbered names such as `figure1` to `figure-1` and routes labelled extended-data figures automatically. Captions remain searchable text with ordinary links.

Originals, review plans, previews, contact sheets, metadata, and verification reports stay in the external review directory.

## Prepare and route sources

```bash
uv run /path/to/scripts/paper_bundle.py prepare \
  '/path/to/main.pdf' '/path/to/supplement.pdf' '/path/to/tables.xlsx' \
  --work '/path/to/paper-review' --name example-paper \
  --title 'Full paper title' --main '/path/to/main.pdf'
```

Review `inventory.json` and edit `bundle.json` before extraction. Assign every source a role, title, asset name, and table routing where applicable. Read [bundle-review.md](references/bundle-review.md) for the editable schema and workbook rules.

```bash
uv run /path/to/scripts/paper_bundle.py extract --work '/path/to/paper-review'
uv run /path/to/scripts/paper_bundle.py review-aid --work '/path/to/paper-review'
```

`review-aid` creates contact sheets and `review-aid/review-queue.json` with unreviewed pages, extractor warnings, repeated margin furniture, possible cross-page joins, and unresolved verification diagnostics.

If the same source bytes were reviewed previously, reuse those decisions after extraction:

```bash
uv run /path/to/scripts/paper_bundle.py reuse-review \
  --work '/path/to/new-review' --from-work '/path/to/old-review'
```

Reuse is allowed only for matching SHA-256 source snapshots and records provenance in `review-import.json`.

## Review PDFs and tables

Read [review-plan.md](references/review-plan.md) before editing `documents/<source-id>/plan.json` or `pages/*.json`. Inspect every page and every supplied image. Check reading order, section hierarchy, cross-page prose, code indentation, equations, figure boundaries, captions, and table relationships. Use source-rendered images for content that cannot be transcribed faithfully.

Set each page and source to `reviewed: true` only after inspection and add specific `review_notes`. The compact builder removes only repeated short margin headers/footers and a duplicated first-page title automatically; other content changes remain explicit review decisions.

Workbook CSVs retain raw OOXML values, internal blanks, hidden rows and sheets, and cached formula values. Verification re-reads each workbook snapshot and compares every exported CSV coordinate. Formula caches are never recalculated.

## Multi-agent review

Use parallel reviewers for separate documents or contiguous page ranges when useful and agent spawning is available. Otherwise review sequentially and state that independent agent verification was unavailable.

- Give each reviewer exclusive page files, source previews/evidence, and a separate report path. Adjacent pages are read-only context. Assign workbook or standalone-figure review separately when useful.
- The coordinator owns `bundle.json` and build commands. After reviewers finish, the coordinator merges shared plans, cross-page repairs, asset names, and adjudications. Workers return proposed shared changes in their reports.
- Use a fresh verifier, distinct from the reviewers and coordinator, to compare the assembled package with visible originals. Repair findings and recheck changed material before final strict verification.
- Use `review-aid` to organize assignments. Keep coverage, findings, and limitations in the external review directory. Every page and supplied source still requires review.

## Build, adjudicate, and verify

Build a reviewed staging package:

```bash
uv run /path/to/scripts/paper_bundle.py build \
  --work '/path/to/paper-review' --output '/path/to/staging/example-paper' \
  --require-reviewed

uv run /path/to/scripts/paper_bundle.py review-aid --work '/path/to/paper-review'
```

If parser diagnostics remain, inspect the cited source pages. For a confirmed parser-only difference, copy its exact `adjudication_entry` from the review queue into `documents/<source-id>/adjudications.json` and replace the placeholder reason with the visible source check. Each adjudication is bound to a fingerprint of the exact diagnostic; changed or stale diagnostics remain unresolved.

Build the final package into a new directory, then verify:

```bash
uv run /path/to/scripts/paper_bundle.py build \
  --work '/path/to/paper-review' --output '/path/to/example-paper' \
  --require-reviewed

uv run /path/to/scripts/paper_bundle.py verify \
  --work '/path/to/paper-review' --strict
```

Verification statuses are:

- `mechanical_failure`: files, links, hashes, transformations, or workbook exports failed.
- `unreviewed`: source or page review is incomplete.
- `unresolved_discrepancies`: diagnostics remain unreviewed or an adjudication is stale.
- `reviewed_with_limitations`: review is complete and remaining limits or parser differences are documented.
- `reviewed`: review and mechanical verification are complete without recorded limitations.

Strict verification exits 2 for the first three states and 0 for either reviewed state. A final skill is labelled as a draft only for the first three states.

Before delivery, inspect the generated index, representative prose, captions, tables, and the smallest figure labels. Answer one realistic retrieval question using only the package. Report the reading folder, external verification report, and material image-only or workbook limitations.

## Maintenance

After converter changes, run:

```bash
uv run scripts/test_paper_bundle.py
```

Run the host’s skill-format validator when available; it is a development check, not a conversion dependency.

`pdf_to_skill.py` is an internal PDF engine. The supported interface is `paper_bundle.py`.
