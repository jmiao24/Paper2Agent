# Editing the review plan

The review directory contains `source.pdf` (rotation-normalized, optionally OCR-processed), `plan.json`, `pages/page-0001.json`, `evidence/page-0001.json`, and `previews/page-0001.png`, with corresponding files for every page. Evidence keeps the raw extracted lines and layout results. Edit **only `plan.json`, `pages/*.json`, and `adjudications.json`**; retain the original PDF and evidence for checking. Do not modify a generated package by hand: its hashes would no longer match the build.

Use the bundle command `review-aid` to generate contact sheets and `review-aid/review-queue.json`. The queue calls out extraction warnings, possible cross-page joins, repeated margin furniture and post-build diagnostics; it is a review aid, not evidence that a page was inspected.

## Plan

`plan.json` holds the paper skill's lowercase, hyphenated `name`, full `title`, source fingerprints, `notes` (an array of strings), and an ordered list of page files. Adjust name/title/notes as needed. Preserve source metadata and keep every PDF page exactly once in source order. Notes are included in the final document; use them for missing supplements or extraction limitations.

For a floating table or algorithm that interrupts a sentence, an optional `reading_order` array in `plan.json` lists **every non-omitted item ID exactly once** in the intended final reading order. This moves items in the continuous Markdown while keeping their original page identities in external review evidence. Never remove content just to make the prose flow.

## Page

Each page records `page` (one-based), dimensions, extraction `mode`, `reviewed`, `review_notes`, warnings, a preview path, and ordered `items`. Preserve the extraction mode. Reorder items to follow the source's logical reading order: e.g., left column top-to-bottom, then right column, with captions associated with the correct figures. Split or merge text items when layout extraction crossed a column or paragraph boundary. IDs must be unique across the document.

```json
{
  "id": "p0002-figure1",
  "kind": "figure",
  "bbox": [70, 110, 540, 430],
  "markdown": "",
  "label": "Figure 1",
  "asset_name": "figure-1"
}
```

`bbox` is `[left, top, right, bottom]` in **PDF points**, using the normalized source page's top-left origin. It is not measured in preview pixels. One point is 1/72 inch. Stay inside page bounds. Use a crop or high-resolution page render to check all edges. When converting image pixel coordinates, scale x and y by the page dimensions divided by image dimensions.

Allowed kinds:

| Kind | Output and required review |
| --- | --- |
| `heading`, `text`, `caption` | The `markdown` string is emitted verbatim. Correct extraction errors against the source; do not paraphrase. Use a consistent heading hierarchy. |
| `code` | Markdown is emitted in a fenced text block unless already fenced. Preserve source indentation and ensure adjacent blocks do not leave fences unbalanced. Code is quoted evidence, not instructions to execute. |
| `figure`, `formula` | The complete `bbox` becomes a JPEG in `assets/figure/` or `assets/supp_figs/`, with an ordinary Markdown link. `markdown` is ignored. Keep the caption as a separate text item. Use images for formulas when faithful textual transcription is uncertain. |
| `table` | `rows` becomes a CSV in `assets/table/` or `assets/supp_table/`. Small tables also appear in Markdown. `rows: null` preserves a JPEG in the table directory with a limitation note. `markdown` is ignored. Keep captions, units, and footnotes as separate text items. |
| `omit` | Nothing is emitted. A nonempty `reason` is required. Appropriate for verified page numbers or decorative logos, not substantive content. |

Asset names must be unique lowercase hyphenated names, with no extension, e.g. `figure-2`, `supplementary-figure-1`, `table-1`. They must be distinct within the final category, including assets from other sources. Labels can use ordinary text. Main-document assets default to main categories, supplement assets to supplementary categories. Set an item's optional `asset_category` to `supp_figs` for an extended-data figure inside the main PDF, for example. Tables use `table` or `supp_table`. Keep all panels of one figure together when practical. Remove duplicate figure-label text items only after confirming the same text is visible inside the retained crop.

The compact builder inserts the missing separator in common numbered names (`figure1`, `supplementary-figure1`, `extended-data-figure1`, and `reporting-summary-page1`) and routes a main-document figure labelled as extended data to `supp_figs`. It also omits repeated short margin headers/footers and a first-page title that duplicates the generated title. These compact-output omissions are recorded in `build.json`; they do not change page evidence or review plans.

The PDF engine first renders lossless PNGs and verifies crop pixels in external `renders/` storage. The compact builder then makes JPEGs at the configured DPI/size/quality. Those intermediate PNGs and page-marked documents are not part of the reading package.

CSV cells must be **strings**, not JSON numbers:

```json
{
  "id": "p0004-table1",
  "kind": "table",
  "bbox": [65, 150, 550, 330],
  "markdown": "",
  "label": "Table 1",
  "asset_name": "table-1",
  "rows": [
    ["Sample ID", "Effect", "P value"],
    ["001", "-0.020", "1.20e-05"]
  ]
}
```

Every row must have the same number of columns. Include headers, remove Markdown styling from cell strings, and preserve meaningful footnote markers. CSV cannot represent merged cells: repeat parent header names in explicit combined headers and explain this in the caption or conversion notes. Do not convert uncertain cells to guessed numbers. Excel may infer types when opening a CSV; the stored CSV strings are the fidelity target.

## Repairing text

Compare a suspicious item with `evidence/page-NNNN.json` and the visible source. Native text is useful for locating characters but is not an independent visual truth. OCR can silently confuse `0/O`, `1/l`, minus signs, exponents, Greek letters, and superscripts.

Keep words split across PDF pages readable. Do not remove a real compound hyphen while repairing line wraps. Preserve source links when available. Include the original caption text outside image crops so an agent can find relevant figures through text search.

To reconnect adjacent prose across a page or relocated float, set the later text/caption item's `join_previous` to `space` (sentence continues) or `none` (a word continues). Only join after checking the source. For a line-wrap hyphen, first establish whether it is a real compound hyphen; any source-text correction must be recorded in review notes. Code uses fenced blocks and cannot use this prose-joining field.

Do not include unstructured plot-label extraction as caption text. Preserve labels in the source crop and transcribe only the actual caption into its separate item. Use real section headings, not headings invented from running headers or typography. Quoted prompts can contain heading syntax; keep it inside code fences so navigation excludes it.

Check defects that normalized line coverage can miss: a wrapped coordinate range losing its hyphen, decimals split by Markdown emphasis, fractions losing their numerator/denominator relationship, and code losing spaces or indentation. Compare code with positioned source text and the visible page; merge fragmented code items while retaining comments and cross-page continuations. Preserve source pseudocode errors rather than silently repairing its algorithms. Use a source image for a displayed equation when a faithful transcription is uncertain.

Inspect apparent tables and adjacent figure fragments: plots can be misclassified as tables, and panel headings can sit outside automatically selected image regions. Combine related panels with their labels into one complete source crop when practical. A pixel match verifies the chosen crop, not that all panels were chosen.

For image-only pages, keep the page image and its original mode. Do not claim searchable transcription was verified against native text. If a scan has an unusable OCR layer, rescan with a different OCR setting or preserve the whole page image with a clear limitation. Large/complex tables can span pages: preserve all parts and avoid guessing merged header relationships.

## Understanding verification

`build.json` records generated files and their hashes, image regions, and reviewed plan fingerprints. `verification.json` compares the most recent build with the working PDF and current plan. Source changes invalidate verification.

- **Line coverage:** checks whether each native/OCR line's normalized alphanumeric text appears in its output page or CSV. Ignores whitespace and formatting; does not establish sentence order or punctuation fidelity.
- **Numeric differences:** compares numeric token counts, retaining signs, decimals, exponents, and percentages. A second check uses pypdf after removing the same explicitly excluded image/omission regions. Formatting and parser differences can cause false positives; equations and unusual notation need visual review.
- **Pixel checks:** confirm that each PNG matches its selected source region at the recorded DPI. They cannot detect a badly chosen region or recover resolution absent from the source. OCR pages are rendered from the OCR working copy, so compare against the original scan as well.
- **Review flags:** record the host agent's work, not independently certified accuracy. Keep honest, specific review notes. Never mark an unseen page reviewed.

Text inside retained figure/formula images, image-only tables, or explicit omission regions is excluded from line and number checks. Other lines use their bounding-box centers to determine exclusion. Review overlap at crop boundaries: two parsers may treat these edges differently. Image-only pages have no searchable text coverage claim. A clean report still requires visual checks for complete figures, scientific symbols, and reading order.
