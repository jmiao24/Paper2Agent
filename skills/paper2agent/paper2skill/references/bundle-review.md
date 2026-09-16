# Reviewing and routing a paper bundle

## External review directory

`originals/` contains byte-for-byte source snapshots. `inventory.json` records their names, hashes and extracted artifacts. `extracted/` contains frozen CSV/text exports and workbook cell metadata. `documents/<source-id>/` contains each document PDF's working copy, page JSON, raw evidence, previews and verification records. `renders/` contains verified intermediate PDF outputs. `build.json` maps final assets and document items back to these sources; `verification.json` reports the latest package checks.

Keep this directory outside the reading package and inputs. Do not edit original snapshots, frozen exports or evidence to make checks pass. Fix extraction code and prepare a new review directory when the extractor itself is wrong. Keep the review directory available for verification; the final reading folder itself is portable.

The compact workflow uses bundle schema version 2 and raw numeric exports. Prepare older bundles again, then use `reuse-review` to import decisions for byte-identical sources. This preserves the new raw exports while avoiding repeated PDF review.

## Editable bundle.json

Keep every inventoried source ID exactly once. Source ordering determines document/asset ordering; at most one source is the main document. Source roles are:

| Input | Role | Final destination |
| --- | --- | --- |
| Main document PDF or supplied text | `main` | `references/paper.md` |
| Supplement document PDF | `supplement` | `references/supplement.md` |
| Standalone figure PDF or raster image | `figure` | `assets/figure/`; link/caption in paper.md |
| Supplementary/extended-data figure PDF or raster image | `supp_figs` | `assets/supp_figs/`; link/caption in supplement.md |
| Workbook/CSV/TSV | `table` | `assets/table/`; description in paper.md |
| Workbook/CSV/TSV | `supp_table` | `assets/supp_table/`; description in supplement.md |
| Supplied UTF-8 text | `text` or `supplement` | Verbatim content in supplement.md |
| Unsupported input | `attachment` | Original stays external; unconverted-material note in supplement.md |

`workbook` is also accepted for older plans and routes to supplementary tables. A neutral `pdf` role must be resolved before building. When exactly one document PDF is supplied, prepare selects it as main; otherwise use `--main` or edit the role. Review suggestions for all remaining sources, especially figure-only PDFs. Do not fold unrelated papers into supplementary material without a content-based reason.

Example source record for a supplied figure PDF or raster image:

```json
{
  "id": "s003-figure-file",
  "role": "figure",
  "title": "Figure 1",
  "asset_name": "figure-1",
  "caption": "Caption transcribed from the supplied source, if present.",
  "reviewed": false,
  "review_notes": ""
}
```

Replace example IDs and text with actual source information. `asset_name` is a lowercase hyphenated basename without extension. Multi-page figure PDFs or multi-frame images receive `-1`, `-2`, etc. Preserve every page/frame. Distinct assets in a category need distinct names; collisions stop the build, never overwrite another source. Do not claim a caption was supplied when it was not.

For a document PDF, figure/table names and categories live on individual PDF items instead; see [review-plan.md](review-plan.md).

## Workbook routing

All worksheets are retained, including Index, hidden and empty sheets. Use the original Index worksheet to identify table titles; truncated sheet names do not establish a table's identity. Defaults retain worksheet names. To assign printed table numbers or mix main and supplementary sheets, add a `tables` object to that workbook's source record, keyed by one-based worksheet ordinal:

```json
{
  "tables": {
    "1": {
      "category": "table",
      "asset_name": "table-1",
      "title": "Table 1",
      "caption": "Source caption, if supplied.",
      "notes": "Header/data/caption row ranges established by review."
    },
    "2": {
      "category": "supp_table",
      "asset_name": "supplementary-table-1",
      "title": "Supplementary Table 1"
    }
  }
}
```

These fields route/describe the original table; they do not edit exported cells. Unlisted sheets still export using unique source/worksheet names. `tables` also accepts ordinal `1` for a standalone CSV/TSV.

CSV bounds extend from A1 to the last populated cell or formula. Trailing style-only cells are trimmed; internal empty rows/columns, zero values, blank merged cells, multiline strings and leading-zero strings remain. **Numeric cells retain their raw XML strings**, avoiding binary-float conversion and display rounding. Source number formats and supported display approximations remain in external cell metadata. A numeric percentage such as stored `0.12` remains `0.12`; review and explain percentage/date/custom-format semantics in table notes. Never silently reinterpret units.

Formula cells use saved caches, which may be stale. A missing cache produces formula text and a warning. Shared/array formula attributes remain in metadata. No formulas, macros or external connections are evaluated. Merges retain the top-left value and blank covered cells; do not forward-fill observations. Document complex header relationships in source-derived captions/notes.

CSV cannot carry comments, charts, hyperlink targets or full display formatting. Keep originals and detailed metadata external, with relevant limitations next to the final table link. Tables of at most 50 rows, 20 columns and 20,000 rendered characters also appear in Markdown. Larger tables remain complete as CSV; add a useful title, description and row interpretation so agents can search them selectively. No rows are truncated from the CSV.

Compare sheet counts, cell coordinates and values against the original workbook, preferably with an independent XML reader across all cells. Inspect visual formatting when it changes meaning. The supplied workbook may disagree with a rounded PDF table: record the source distinction rather than silently reconciling it. CSV consumers may infer types on opening; stored strings are the fidelity target.

## Navigation

The automatic index uses actual level-2/3 headings outside code fences. For a more useful, smaller index, add a top-level `navigation` list:

```json
{
  "navigation": [
    {
      "file": "references/paper.md",
      "heading": "Results",
      "purpose": "Reported findings and comparisons"
    },
    {
      "file": "references/supplement.md",
      "heading": "Benchmark details",
      "purpose": "Setup, baselines and evaluation criteria"
    }
  ]
}
```

Use exact real headings. Missing headings or invalid document paths stop the build. Describe where information is, not what the findings are. For repeated headings, identify the parent section in `purpose`. Include useful subsections of long prompt/benchmark sections without indexing headings inside quoted code as document structure. Omit fixed line numbers; retrieve current positions with search. An empty list suppresses section rows, so use it only when no meaningful headings exist.

## Review and verification

Set a source's `reviewed` flag only after examining it, and provide specific `review_notes`. Document PDF pages have separate review flags, which are also required for `--require-reviewed`. For figure PDFs and raster images, source review must cover every page/frame and final JPEG readability. Unconverted attachments can be acknowledged as preserved, but their contents remain unverified.

Run `review-aid` after extraction for contact sheets and again after a staging build for diagnostic fingerprints. Confirmed parser-only differences may be recorded in each document's `adjudications.json`:

```json
{
  "schema_version": 1,
  "entries": [
    {
      "page": 18,
      "check": "number_differences",
      "fingerprint": "64-lowercase-hex-characters-from-review-queue",
      "reason": "Visible source uses 10 with superscript 4; the parser flattened it to 104."
    }
  ]
}
```

Copy the page, check, and fingerprint from `review-aid/review-queue.json`; write the reason after inspecting the visible source. The verifier applies only exact fingerprints on reviewed pages. A stale or unmatched adjudication remains unresolved.

`build --require-reviewed` enforces review flags, not correctness by declaration. Use `verify --strict` and read the report; do not treat marked checkboxes or hashes as an accuracy percentage.

Verification checks the exact template, output inventory/hashes, review-input changes, local links, every asset's source transformation, workbook CSV coordinates, and the underlying PDF review outputs. JPEG checks compare against the same recorded source conversion; they do not assert losslessness or correct crop selection. The PDF engine checks original crop pixels before JPEG export and text/numbers with two parsers. Source interpretation still requires host-agent review.

`reviewed_with_limitations` is a successful reviewed state. It records image-only pages, source limitations, or exact adjudications without calling completed review a draft. Mechanical failures, unreviewed sources, and unresolved discrepancies remain strict failures.

A failed build before publication restores the previous build's records. Rebuild into a new output directory after correcting review inputs. Do not hand-edit delivered documents to bypass the reviewed build. Keep scripts and audit artifacts outside the reading folder.
