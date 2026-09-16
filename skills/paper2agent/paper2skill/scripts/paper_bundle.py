#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf==1.28.2", "pymupdf4llm==1.28.2", "pypdf==6.18.1", "pillow==12.2.0"]
# ///
"""Agentify a collection of paper PDFs, spreadsheets, text, and other attachments."""

from __future__ import annotations

import argparse
import csv
from decimal import Decimal, InvalidOperation, ROUND_HALF_UP, localcontext
import io
import json
from pathlib import Path, PurePosixPath
import posixpath
import re
import shutil
import sys
import tempfile
import xml.etree.ElementTree as ET
import zipfile

import pdf_to_skill as pdf

NS = {"s": "http://schemas.openxmlformats.org/spreadsheetml/2006/main"}
REL = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
MAX_CELLS = 2_000_000
IMAGE_SUFFIXES = {".jpg", ".jpeg", ".png", ".tif", ".tiff", ".webp", ".bmp"}
TEXT_SUFFIXES = {".txt", ".md", ".json", ".yaml", ".yml", ".xml", ".bib", ".rst"}
BUILTIN_FORMATS = {0: "General", 1: "0", 2: "0.00", 9: "0%", 10: "0.00%", 11: "0.00E+00", 49: "@"}


def csv_bytes(rows):
    stream = io.StringIO(newline="")
    csv.writer(stream).writerows(rows)
    return stream.getvalue().encode("utf-8")


def cell_position(address):
    match = re.fullmatch(r"([A-Z]+)([1-9][0-9]*)", address)
    if not match:
        raise ValueError(f"Invalid spreadsheet cell address: {address}")
    col = 0
    for char in match[1]:
        col = col * 26 + ord(char) - 64
    return int(match[2]), col


def display_number(raw, number_format):
    """Handle a narrow, explicit subset; never guess complex Excel formatting."""
    if number_format in {"General", "@"}:
        return raw, True
    try:
        with localcontext() as context:
            context.rounding = ROUND_HALF_UP
            context.prec = max(50, len(raw) + 20)
            value = Decimal(raw)
            if re.fullmatch(r"0+", number_format):
                rounded = format(value, ".0f")
                sign = "-" if rounded.startswith("-") else ""
                return sign + rounded.lstrip("-").zfill(len(number_format)), True
            if re.fullmatch(r"0(?:\.0+)?%?", number_format):
                percent = number_format.endswith("%")
                fmt = number_format.rstrip("%")
                places = len(fmt.split(".")[1]) if "." in fmt else 0
                return format(value * (100 if percent else 1), f".{places}f") + ("%" if percent else ""), True
            if re.fullmatch(r"0\.0+E\+00", number_format):
                places = len(number_format.split(".")[1].split("E")[0])
                if value == 0:
                    return format(value, f".{places}f") + "E+00", True
                mantissa, exponent = format(value, f".{places}E").split("E")
                return f"{mantissa}E{int(exponent):+03d}", True
    except (InvalidOperation, ValueError):
        pass
    return raw, False


def xml_text(element, ns=None):
    return "" if element is None else "".join(t.text or "" for t in element.findall(".//s:t", ns or NS))


def workbook_tables(path):
    """Export raw XML values; retain source formats/display approximations as evidence.

    Formulas, formatting, merges and cached values remain in metadata and the
    original workbook. No formulas/macros/external connections are executed.
    """
    tables = []
    with zipfile.ZipFile(path) as archive:
        workbook = ET.fromstring(archive.read("xl/workbook.xml"))
        ns = {"s": workbook.tag.split("}")[0].lstrip("{")}
        if ns["s"] not in {NS["s"], "http://purl.oclc.org/ooxml/spreadsheetml/main"}:
            raise ValueError("Unsupported workbook XML namespace")
        rels = ET.fromstring(archive.read("xl/_rels/workbook.xml.rels"))
        targets = {r.attrib["Id"]: r.attrib for r in rels}
        shared = []
        if "xl/sharedStrings.xml" in archive.namelist():
            shared = [xml_text(si, ns) for si in ET.fromstring(archive.read("xl/sharedStrings.xml"))]
        formats, styles = dict(BUILTIN_FORMATS), [0]
        if "xl/styles.xml" in archive.namelist():
            root = ET.fromstring(archive.read("xl/styles.xml"))
            for element in root.findall("s:numFmts/s:numFmt", ns):
                formats[int(element.attrib["numFmtId"])] = element.attrib["formatCode"]
            styles = [int(x.attrib.get("numFmtId", 0)) for x in root.findall("s:cellXfs/s:xf", ns)] or [0]
        for ordinal, sheet in enumerate(workbook.findall("s:sheets/s:sheet", ns), 1):
            rid = next(v for k, v in sheet.attrib.items() if k.endswith("}id"))
            relation = targets[rid]
            if relation.get("TargetMode") == "External":
                raise ValueError("External worksheet is not a local table")
            target = relation["Target"]
            member = target.lstrip("/") if target.startswith("/") else posixpath.normpath("xl/" + target)
            if not member.startswith("xl/") or ".." in PurePosixPath(member).parts:
                raise ValueError("Worksheet path leaves workbook")
            root = ET.fromstring(archive.read(member))
            cells, evidence, warnings = {}, [], set()
            for c in root.findall("s:sheetData/s:row/s:c", ns):
                value_node, formula = c.find("s:v", ns), c.find("s:f", ns)
                raw = value_node.text or "" if value_node is not None else ""
                kind = c.attrib.get("t", "n")
                if kind == "s":
                    value = shared[int(raw)]
                elif kind == "inlineStr":
                    value = xml_text(c.find("s:is", ns), ns)
                elif kind == "b":
                    value = {"1": "TRUE", "0": "FALSE"}.get(raw, raw)
                else:
                    value = raw
                # Ignore style-only cells when finding bounds; retain metadata
                # on populated cells and retain all styles in the original XLSX.
                if value == "" and formula is None:
                    continue
                address = c.attrib["r"]
                number_format_id = styles[int(c.attrib.get("s", 0))]
                number_format = formats.get(number_format_id, f"builtin:{number_format_id}")
                if kind == "n" and value:
                    _, supported = display_number(value, number_format)
                    if number_format not in {"General", "@"}:
                        warnings.add("CSV retains raw numeric values, not Excel display formatting (including percentages, dates and zero-padding); inspect source formats when interpreting units.")
                    if not supported:
                        warnings.add("Unsupported number formats retain raw XML values; consult cell metadata and the original workbook for display formatting/dates.")
                record = {"cell": address, "type": kind, "raw": raw, "text": value, "number_format": number_format,
                          "display": display_number(value, number_format)[0] if kind == "n" and value else value}
                if formula is not None:
                    record["formula"] = formula.text or ""
                    record["formula_attributes"] = formula.attrib
                    cached = value_node is not None and (value_node.text is not None or kind == "str")
                    record["cached_value_present"] = cached
                    warnings.add("Formula cells use saved cached values, which may be stale; formulas are preserved in metadata and are never evaluated.")
                    if not cached:
                        value = "=" + (formula.text or "[formula without cached value]")
                        record["text"] = value
                        warnings.add("Some formulas lack cached values; CSV cells contain the formula text, not a computed result.")
                cells[cell_position(address)] = value
                evidence.append(record)
            max_row = max((r for r, c in cells), default=0)
            max_col = max((c for r, c in cells), default=0)
            if max_row * max_col > MAX_CELLS:
                raise ValueError(f"Worksheet {sheet.attrib['name']} exceeds {MAX_CELLS} rectangular cells; retain as attachment or split explicitly")
            rows = [[cells.get((r, c), "") for c in range(1, max_col + 1)] for r in range(1, max_row + 1)]
            merges = [m.attrib["ref"] for m in root.findall("s:mergeCells/s:mergeCell", ns)]
            if merges:
                warnings.add("Merged cells retain their top-left value and blank covered cells; use merge ranges in metadata to interpret headers.")
            hidden_rows = [r.attrib["r"] for r in root.findall("s:sheetData/s:row", ns) if r.attrib.get("hidden") == "1"]
            hidden_columns = [c.attrib for c in root.findall("s:cols/s:col", ns) if c.attrib.get("hidden") == "1"]
            metadata = {"sheet": sheet.attrib["name"], "ordinal": ordinal, "state": sheet.attrib.get("state", "visible"),
                        "rows": max_row, "columns": max_col, "merged_ranges": merges, "hidden_rows": hidden_rows,
                        "hidden_columns": hidden_columns, "workbook_properties": dict(workbook.find("s:workbookPr", ns).attrib) if workbook.find("s:workbookPr", ns) is not None else {},
                        "warnings": sorted(warnings), "cells": evidence,
                        "limitations": "CSV omits visual layout, comments, charts and hyperlink targets; the original workbook preserves these. No workbook calculation was performed."}
            tables.append((rows, metadata))
    return tables


def verify_workbook_exports(work, sources):
    """Re-read each workbook snapshot and compare every exported CSV coordinate."""
    checks = []
    for source in sources:
        if source['kind'] != 'workbook':
            continue
        result = {'source': source['id'], 'sheets': 0, 'coordinates_compared': 0, 'mismatches': [], 'ok': True}
        current = workbook_tables(work / source['snapshot'])
        recorded = source.get('sheets', [])
        if len(current) != len(recorded):
            result['mismatches'].append({'kind': 'sheet_count', 'source': len(current), 'export': len(recorded)})
        for index, ((rows, metadata), sheet) in enumerate(zip(current, recorded), 1):
            result['sheets'] += 1
            export = list(csv.reader(io.StringIO((work / 'extracted' / sheet['csv']).read_text(encoding='utf-8-sig'), newline='')))
            width = max([len(row) for row in rows] + [len(row) for row in export] + [0])
            height = max(len(rows), len(export))
            result['coordinates_compared'] += height * width
            mismatch = None
            for row_index in range(height):
                for col_index in range(width):
                    expected = rows[row_index][col_index] if row_index < len(rows) and col_index < len(rows[row_index]) else ''
                    actual = export[row_index][col_index] if row_index < len(export) and col_index < len(export[row_index]) else ''
                    if expected != actual:
                        mismatch = {'kind': 'cell', 'sheet': index, 'name': metadata['sheet'],
                                    'row': row_index + 1, 'column': col_index + 1, 'source_value': expected, 'export_value': actual}
                        break
                if mismatch:
                    break
            if mismatch:
                result['mismatches'].append(mismatch)
        result['ok'] = not result['mismatches']
        checks.append(result)
    return checks


def discover(inputs):
    files = []
    for value in inputs:
        path = Path(value).expanduser().resolve()
        if path.is_dir():
            files.extend(p.resolve() for p in sorted(path.rglob("*")) if p.is_file() and not p.is_symlink())
        elif path.is_file():
            files.append(path)
        else:
            raise ValueError(f"Input does not exist: {path}")
    result = list(dict.fromkeys(files))
    if not result:
        raise ValueError("No input files found")
    return result


def prepare(args):
    work = Path(args.work).expanduser().resolve()
    if work.exists():
        raise ValueError("Review directory exists; use extract/build to resume, or choose a new --work")
    if not pdf.valid_name(args.name):
        raise ValueError("Invalid skill name; use lowercase words separated by hyphens, at most 63 characters")
    inputs = discover(args.inputs)
    opaque = {Path(p).expanduser().resolve() for p in getattr(args, "attachment", [])}
    if not opaque.issubset(set(inputs)):
        raise ValueError("Every --attachment must also be included among the inputs")
    for value in args.inputs:
        directory = Path(value).expanduser().resolve()
        if directory.is_dir() and work.is_relative_to(directory):
            raise ValueError("Keep review outputs outside input directories")
    main = Path(args.main).expanduser().resolve() if args.main else None
    if main and (main not in inputs or main.suffix.lower() != ".pdf"):
        raise ValueError("--main must identify one of the supplied PDFs")
    if main in opaque:
        raise ValueError("The main PDF cannot also be an opaque attachment")
    parsed_pdfs = [p for p in inputs if p.suffix.lower() == ".pdf" and p not in opaque]
    if main is None and len(parsed_pdfs) == 1:
        main = parsed_pdfs[0]
    work.parent.mkdir(parents=True, exist_ok=True)
    with tempfile.TemporaryDirectory(prefix=".paper-bundle-", dir=work.parent) as temporary:
        stage = Path(temporary)
        originals = stage / "originals"
        originals.mkdir()
        inventory, reviews = [], []
        for ordinal, source in enumerate(inputs, 1):
            sid = f"s{ordinal:03d}-" + pdf.slug(source.stem)[:48].rstrip("-")
            ext = source.suffix.lower()
            safe_extension = ext if re.fullmatch(r"\.[a-z0-9]{1,12}", ext) else ".bin"
            snapshot = f"originals/{sid}{safe_extension}"
            shutil.copyfile(source, stage / snapshot)
            kind = "pdf" if ext == ".pdf" else "workbook" if ext == ".xlsx" else "image" if ext in IMAGE_SUFFIXES else "table" if ext in {".csv", ".tsv"} else "text" if ext in TEXT_SUFFIXES else "attachment"
            if source in opaque:
                kind = "attachment"
            record = {"id": sid, "filename": source.name, "original_path": str(source), "snapshot": snapshot,
                      "sha256": pdf.sha(stage / snapshot), "kind": kind, "artifacts": [], "warnings": []}
            def artifact(relative, data):
                path = stage / "extracted" / relative
                path.parent.mkdir(parents=True, exist_ok=True)
                path.write_bytes(data)
                record["artifacts"].append({"path": relative, "sha256": pdf.sha(path)})
            if kind == "workbook":
                record["sheets"] = []
                for rows, metadata in workbook_tables(stage / snapshot):
                    base = f"references/{sid}/sheet-{metadata['ordinal']:02d}-{pdf.slug(metadata['sheet'])[:40]}"
                    artifact(base + ".csv", csv_bytes(rows))
                    artifact(base + ".json", (json.dumps(metadata, ensure_ascii=False, indent=2) + "\n").encode())
                    record["sheets"].append({k: metadata[k] for k in ["sheet", "ordinal", "state", "rows", "columns", "warnings"]} | {"csv": base + ".csv", "metadata": base + ".json"})
            elif kind == "table":
                raw = (stage / snapshot).read_bytes()
                rows = list(csv.reader(io.StringIO(raw.decode("utf-8-sig"), newline=""), delimiter="\t" if ext == ".tsv" else ","))
                if not rows or not rows[0] or any(len(r) != len(rows[0]) for r in rows):
                    raise ValueError(f"Non-rectangular or empty table: {source}; use --attachment '{source}' to retain it without table extraction")
                relative = f"references/{sid}.csv"
                artifact(relative, raw if ext == ".csv" else csv_bytes(rows))
                record.update(rows=len(rows), columns=len(rows[0]), table=relative)
            elif kind == "text":
                raw = (stage / snapshot).read_bytes()
                raw.decode("utf-8-sig")
                # Keep verbatim text as data, not generated skill instructions.
                artifact(f"references/{sid}{ext}", raw)
            elif kind == "image":
                from PIL import Image
                with Image.open(stage / snapshot) as image:
                    record["image_frames"] = getattr(image, "n_frames", 1)
                    for frame in range(record["image_frames"]):
                        image.seek(frame)
                        image.load()
            elif kind == "attachment":
                record["warnings"].append("Preserved original attachment; its contents have not been extracted or validated.")
            inventory.append(record)
            reviews.append({"id": sid, "role": "main" if source == main else "supplement" if kind == "pdf" and main else "supp_figs" if kind == "image" else "supp_table" if kind in {"table", "workbook"} else kind,
                            "title": source.stem, "reviewed": False, "review_notes": "", "asset_name": pdf.slug(source.stem)[:55].rstrip("-")})
        pdf.write_json(stage / "inventory.json", {"schema_version": 2, "sources": inventory})
        pdf.write_json(stage / "bundle.json", {"schema_version": 2, "name": args.name, "title": args.title or args.name, "notes": [], "sources": reviews})
        # TemporaryDirectory itself is moved; its cleanup tolerates the missing path.
        stage.rename(work)
    return {"work": str(work), "sources": len(inventory), "status": "prepared", "next": "Edit bundle.json roles/titles, then extract PDFs and review all sources."}


def load_bundle(work):
    work = Path(work).expanduser().resolve()
    plan, inventory = pdf.read_json(work / "bundle.json"), pdf.read_json(work / "inventory.json")
    if plan.get("schema_version") == 1 or inventory.get("schema_version") == 1:
        raise ValueError("Older bundle export policy: prepare a new review directory for the compact/raw-value template; keep previous evidence unchanged")
    if plan.get("schema_version") != 2 or inventory.get("schema_version") != 2 or not pdf.valid_name(plan.get("name")):
        raise ValueError("Invalid bundle schema or name")
    originals = inventory["sources"]
    ids = [s["id"] for s in originals]
    review_ids = [s["id"] for s in plan["sources"]]
    if len(set(ids)) != len(ids) or len(review_ids) != len(ids) or set(review_ids) != set(ids):
        raise ValueError("Bundle must include each inventoried source exactly once")
    by_id = {s["id"]: s for s in originals}
    sources = []
    for review in plan["sources"]:
        source = by_id[review["id"]]
        if not pdf.valid_name(source["id"]) or source["id"] == "sources":
            raise ValueError("Invalid source ID")
        if not isinstance(review.get("reviewed"), bool) or (review["reviewed"] and not review.get("review_notes", "").strip()):
            raise ValueError("Reviewed sources need specific review notes")
        if pdf.sha(pdf.contained(work, source["snapshot"])) != source["sha256"]:
            raise ValueError(f"Original snapshot changed: {source['filename']}")
        for artifact in source["artifacts"]:
            if pdf.sha(pdf.contained(work / "extracted", artifact["path"])) != artifact["sha256"]:
                raise ValueError(f"Extracted artifact changed: {artifact['path']}")
        editable = {"role", "title", "reviewed", "review_notes", "asset_name", "caption", "tables"}
        sources.append(source | {k: v for k, v in review.items() if k in editable})
    if sum(s["role"] == "main" for s in sources) > 1:
        raise ValueError("Choose at most one main document; explicitly route supplementary documents and figure PDFs")
    return work, plan, sources


def extract(args):
    work, plan, sources = load_bundle(args.work)
    completed = []
    for source in sources:
        if source["kind"] != "pdf" or source["role"] in {"figure", "supp_figs"}:
            continue
        destination = work / "documents" / source["id"]
        if destination.exists():
            _, child_plan, _, document = pdf.load_plan(destination)
            document.close()
            if child_plan["source"]["sha256"] != source["sha256"]:
                raise ValueError("Existing PDF extraction belongs to a different source")
        else:
            pdf.scan(argparse.Namespace(pdf=str(work / source["snapshot"]), work=str(destination), name=plan["name"],
                                        title=source["title"], ocr=args.ocr, language=args.language, tessdata=args.tessdata,
                                        password_env=args.password_env, preview_dpi=args.preview_dpi))
        completed.append(source["id"])
    return {"documents": completed, "status": "needs_agent_review", "next": "Review each PDF page and the other source records before a reviewed build."}


def reuse_review(args):
    """Import editable review decisions only when source bytes match exactly."""
    work = Path(args.work).expanduser().resolve()
    previous = Path(args.from_work).expanduser().resolve()
    target_inventory = pdf.read_json(work / 'inventory.json')['sources']
    old_inventory = pdf.read_json(previous / 'inventory.json')['sources']
    target_bundle = pdf.read_json(work / 'bundle.json')
    old_bundle = pdf.read_json(previous / 'bundle.json')
    old_by_hash = {source['sha256']: source for source in old_inventory}
    old_reviews = {source['id']: source for source in old_bundle['sources']}
    imported = []
    for target in target_inventory:
        old = old_by_hash.get(target['sha256'])
        if not old or old['kind'] != target['kind']:
            continue
        target_review = next(source for source in target_bundle['sources'] if source['id'] == target['id'])
        old_review = old_reviews[old['id']]
        if target_review.get('reviewed'):
            raise ValueError(f"Target source already has review decisions: {target['id']}")
        for key in ('role', 'title', 'reviewed', 'review_notes', 'asset_name', 'caption', 'tables'):
            if key in old_review:
                target_review[key] = old_review[key]
        if target['kind'] == 'pdf' and old_review.get('role') not in {'figure', 'supp_figs'}:
            target_doc, old_doc = work / 'documents' / target['id'], previous / 'documents' / old['id']
            if not target_doc.is_dir() or not old_doc.is_dir():
                raise ValueError('Run extract in the target review directory before reusing PDF review decisions')
            target_plan, old_plan = pdf.read_json(target_doc/'plan.json'), pdf.read_json(old_doc/'plan.json')
            if target_plan['source']['sha256'] != old_plan['source']['sha256'] or len(target_plan['pages']) != len(old_plan['pages']):
                raise ValueError('Matching input hash has incompatible PDF review plans')
            if any(pdf.read_json(target_doc/entry['file']).get('reviewed') for entry in target_plan['pages']):
                raise ValueError(f"Target PDF already has reviewed pages: {target['id']}")
            for target_entry, old_entry in zip(target_plan['pages'], old_plan['pages']):
                target_page = pdf.read_json(target_doc/target_entry['file'])
                old_page = pdf.read_json(old_doc/old_entry['file'])
                for key in ('items', 'reviewed', 'review_notes'):
                    target_page[key] = old_page[key]
                target_page['imported_review_notes'] = old_page.get('review_notes', '')
                pdf.write_json(target_doc/target_entry['file'], target_page)
            for key in ('notes', 'reading_order'):
                if key in old_plan:
                    target_plan[key] = old_plan[key]
            pdf.write_json(target_doc/'plan.json', target_plan)
            if (old_doc/'adjudications.json').is_file():
                shutil.copyfile(old_doc/'adjudications.json', target_doc/'adjudications.json')
        imported.append({'target': target['id'], 'source': old['id'], 'sha256': target['sha256']})
    if not imported:
        raise ValueError('No byte-identical sources with reusable review decisions were found')
    pdf.write_json(work/'bundle.json', target_bundle)
    pdf.write_json(work/'review-import.json', {'schema_version': 1, 'from_work': str(previous), 'sources': imported})
    return {'status': 'review_reused', 'sources': len(imported), 'provenance': str(work/'review-import.json')}


def review_aid(args):
    """Create contact sheets and a compact queue of source-review decisions."""
    from PIL import Image, ImageDraw, ImageOps
    import reading_package
    work, plan, sources = load_bundle(args.work)
    root = work / 'review-aid'
    if root.exists():
        shutil.rmtree(root)
    root.mkdir()
    queue = {'schema_version': 1, 'sources': []}
    total_pages = total_items = 0
    for source in sources:
        if source['kind'] != 'pdf' or source['role'] in {'figure', 'supp_figs'}:
            continue
        doc = work / 'documents' / source['id']
        _, child_plan, states, opened = pdf.load_plan(doc)
        opened.close()
        destination = root / source['id']
        destination.mkdir()
        per_sheet = args.columns * args.rows
        sheet_files = []
        for offset in range(0, len(states), per_sheet):
            selected = states[offset:offset + per_sheet]
            canvas = Image.new('RGB', (args.columns * args.cell_width, args.rows * args.cell_height), '#d0d0d0')
            draw = ImageDraw.Draw(canvas)
            for index, state in enumerate(selected):
                preview = Image.open(pdf.contained(doc, state['preview'])).convert('RGB')
                preview = ImageOps.contain(preview, (args.cell_width - 16, args.cell_height - 38))
                x = (index % args.columns) * args.cell_width + (args.cell_width - preview.width)//2
                y = (index // args.columns) * args.cell_height + 28
                canvas.paste(preview, (x, y))
                draw.text((index % args.columns * args.cell_width + 8, index // args.columns * args.cell_height + 7),
                          f"PDF page {state['page']}", fill='black')
            first, last = selected[0]['page'], selected[-1]['page']
            filename = f'pages-{first:04d}-{last:04d}.jpg'
            canvas.save(destination/filename, quality=88, optimize=True)
            sheet_files.append(str((destination/filename).relative_to(work)))
        omissions = reading_package.compact_omission_reasons(states, plan['title'] if source['role'] == 'main' else source['title'])
        items = []
        for state in states:
            if not state['reviewed']:
                items.append({'page': state['page'], 'kind': 'unreviewed_page'})
            items.extend({'page': state['page'], 'kind': 'extractor_warning', 'detail': warning} for warning in state.get('warnings', []))
            items.extend({'page': state['page'], 'kind': 'suggested_compact_omission', 'item': item_id, 'reason': reason}
                         for item_id, reason in omissions.items() if any(i['id'] == item_id for i in state['items']))
        for previous_state, next_state in zip(states, states[1:]):
            previous_items = [item for item in previous_state['items'] if item['kind'] in {'text', 'caption'} and item.get('markdown', '').strip()]
            next_items = [item for item in next_state['items'] if item['kind'] in {'text', 'caption'} and item.get('markdown', '').strip()]
            if previous_items and next_items:
                left, right = previous_items[-1], next_items[0]
                if (not re.search(r'[.!?:;\)\]]\s*$', left['markdown']) and
                        re.match(r'^[a-z(]', pdf.plain_markdown(right['markdown']).lstrip())):
                    items.append({'page': next_state['page'], 'kind': 'possible_cross_page_join',
                                  'previous_item': left['id'], 'item': right['id']})
        verification = doc/'verification.json'
        if verification.is_file():
            report = pdf.read_json(verification)
            for page in report.get('pages', []):
                for diagnostic in page.get('unresolved_checks', []):
                    items.append({'page': page['page'], 'kind': 'unresolved_diagnostic', **diagnostic,
                                  'adjudication_entry': {'page': page['page'], 'check': diagnostic['check'],
                                                         'fingerprint': diagnostic['fingerprint'], 'reason': 'Describe the visible source check.'}})
        if not (doc/'adjudications.json').exists():
            pdf.write_json(doc/'adjudications.json', {'schema_version': 1, 'entries': []})
        queue['sources'].append({'id': source['id'], 'title': source['title'], 'pages': len(states),
                                 'contact_sheets': sheet_files, 'items': items})
        total_pages += len(states)
        total_items += len(items)
    pdf.write_json(root/'review-queue.json', queue)
    return {'status': 'review_aid_ready', 'pages': total_pages, 'queue_items': total_items,
            'queue': str(root/'review-queue.json')}


def build(args):
    """Publish the compact template; restore previous review records on failure."""
    import reading_package
    work, _, sources = load_bundle(args.work)
    saved = {work / name: (work / name).read_bytes() if (work / name).is_file() else None
             for name in ["build.json", "verification.json"]}
    for source in sources:
        if source["kind"] == "pdf":
            for filename in ["build.json", "verification.json"]:
                path = work / "documents" / source["id"] / filename
                saved[path] = path.read_bytes() if path.is_file() else None
    try:
        return reading_package.build(args)
    except BaseException:
        for path, data in saved.items():
            if data is None:
                path.unlink(missing_ok=True)
            else:
                path.write_bytes(data)
        raise


def verify(args):
    import reading_package
    return reading_package.verify(args)


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest="command", required=True)
    p = sub.add_parser("prepare", help="Inventory inputs, snapshot originals, and extract supplementary tables/text")
    p.add_argument("inputs", nargs="+", help="Files and/or directories; directories are inventoried recursively")
    p.add_argument("--work", required=True)
    p.add_argument("--name", required=True)
    p.add_argument("--title")
    p.add_argument("--main", help="Explicit main PDF; with multiple PDFs no main is guessed")
    p.add_argument("--attachment", action="append", default=[], help="Retain this supplied file as opaque bytes instead of parsing it; repeat as needed")
    p.set_defaults(run=prepare)
    p = sub.add_parser("extract", help="Extract each PDF separately; resume completed document scans")
    p.add_argument("--work", required=True)
    p.add_argument("--ocr", choices=["auto", "never", "always"], default="auto")
    p.add_argument("--language", default="eng")
    p.add_argument("--tessdata")
    p.add_argument("--password-env")
    p.add_argument("--preview-dpi", type=int, default=110)
    p.set_defaults(run=extract)
    p = sub.add_parser("reuse-review", help="Reuse decisions from byte-identical sources in another review directory")
    p.add_argument("--work", required=True)
    p.add_argument("--from-work", required=True)
    p.set_defaults(run=reuse_review)
    p = sub.add_parser("review-aid", help="Create PDF contact sheets and a compact review queue")
    p.add_argument("--work", required=True)
    p.add_argument("--columns", type=int, default=2)
    p.add_argument("--rows", type=int, default=2)
    p.add_argument("--cell-width", type=int, default=700)
    p.add_argument("--cell-height", type=int, default=950)
    p.set_defaults(run=review_aid)
    p = sub.add_parser("build", help="Build the compact reading-skill template")
    p.add_argument("--work", required=True)
    p.add_argument("--output", required=True)
    p.add_argument("--dpi", type=int, default=180)
    p.add_argument("--max-image-side", type=int, default=2800)
    p.add_argument("--jpeg-quality", type=int, default=90)
    gate = p.add_mutually_exclusive_group(required=True)
    gate.add_argument("--require-reviewed", action="store_true")
    gate.add_argument("--draft", action="store_true", help="Explicitly allow a package with pending source/page review")
    p.set_defaults(run=build)
    p = sub.add_parser("verify", help="Verify the most recent build against preserved inputs")
    p.add_argument("--work", required=True)
    p.add_argument("--strict", action="store_true")
    p.set_defaults(run=verify)
    args = parser.parse_args(argv)
    for key in ["dpi", "preview_dpi"]:
        if hasattr(args, key) and not 72 <= getattr(args, key) <= 600:
            parser.error(f"--{key.replace('_', '-')} must be between 72 and 600")
    for key in ["columns", "rows"]:
        if hasattr(args, key) and not 1 <= getattr(args, key) <= 6:
            parser.error(f"--{key} must be between 1 and 6")
    for key in ["cell_width", "cell_height"]:
        if hasattr(args, key) and not 200 <= getattr(args, key) <= 2400:
            parser.error(f"--{key.replace('_', '-')} must be between 200 and 2400")
    try:
        result = args.run(args)
        print(json.dumps(result, ensure_ascii=False, indent=2))
        pending = {"mechanical_failure", "unreviewed", "unresolved_discrepancies"}
        return 2 if getattr(args, "strict", False) and result["status"] in pending else 0
    except (ValueError, OSError, KeyError, TypeError, zipfile.BadZipFile, ET.ParseError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
