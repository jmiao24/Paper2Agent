#!/usr/bin/env python3
# /// script
# requires-python = ">=3.11"
# dependencies = ["pymupdf==1.28.2", "pymupdf4llm==1.28.2", "pypdf==6.18.1", "pillow==12.2.0"]
# ///
"""Behavioral tests using local synthetic documents; no paper files required."""

import argparse
import csv
import io
import json
from pathlib import Path
import tempfile
import unittest
from unittest.mock import patch
import zipfile

import pymupdf

import paper_bundle as bundle
import pdf_to_skill as pdf


def make_workbook(path):
    namespace = 'xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main"'
    content = {
        "xl/workbook.xml": f'''<workbook {namespace} xmlns:r="{bundle.REL}"><workbookPr date1904="1"/><sheets>
          <sheet name="Index" sheetId="1" r:id="rId1"/>
          <sheet name="Table / 1" sheetId="2" r:id="rId2" state="hidden"/>
          <sheet name="Empty" sheetId="3" r:id="rId3"/>
        </sheets></workbook>''',
        "xl/_rels/workbook.xml.rels": '''<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
          <Relationship Id="rId1" Target="worksheets/sheet1.xml"/>
          <Relationship Id="rId2" Target="/xl/worksheets/sheet2.xml"/>
          <Relationship Id="rId3" Target="worksheets/sheet3.xml"/>
        </Relationships>''',
        "xl/sharedStrings.xml": f'''<sst {namespace}><si><r><t>Table </t></r><r><t>one</t></r></si><si><t>Text, with\nnewline</t></si></sst>''',
        "xl/styles.xml": f'''<styleSheet {namespace}><numFmts count="2"><numFmt numFmtId="164" formatCode="00000"/><numFmt numFmtId="165" formatCode="yyyy-mm-dd"/></numFmts>
          <cellXfs count="5"><xf numFmtId="0"/><xf numFmtId="164"/><xf numFmtId="11"/><xf numFmtId="165"/><xf numFmtId="10"/></cellXfs></styleSheet>''',
        "xl/worksheets/sheet1.xml": f'''<worksheet {namespace}><sheetData><row r="1"><c r="A1" t="s"><v>0</v></c><c r="B1" t="s"><v>1</v></c></row></sheetData></worksheet>''',
        "xl/worksheets/sheet2.xml": f'''<worksheet {namespace}><cols><col min="3" max="3" hidden="1"/></cols><sheetData>
          <row r="1"><c r="A1" t="inlineStr"><is><t>ID</t></is></c><c r="B1" t="inlineStr"><is><t>Effects</t></is></c></row>
          <row r="2" hidden="1"><c r="A2" s="1"><v>123</v></c><c r="B2"><v>-0.020000000000000001</v></c><c r="C2" s="2"><v>0.000012</v></c></row>
          <row r="4"><c r="A4"><f>1+2</f><v>3</v></c><c r="B4"><f>2+2</f><v/></c><c r="C4" s="3"><v>45200</v></c><c r="D4" s="4"><v>0.1234</v></c></row>
          <row r="1000"><c r="Z1000" s="1"/></row>
        </sheetData><mergeCells><mergeCell ref="B1:D1"/></mergeCells></worksheet>''',
        "xl/worksheets/sheet3.xml": f'<worksheet {namespace}><sheetData/></worksheet>',
    }
    with zipfile.ZipFile(path, "w") as archive:
        for name, text in content.items():
            archive.writestr(name, text)


def make_pdf(path, text):
    with pymupdf.open() as doc:
        page = doc.new_page(width=300, height=300)
        page.insert_text((30, 30), text)
        page.draw_rect(pymupdf.Rect(30, 100, 150, 160), color=(1, 0, 0), fill=(0.5, 0.5, 1))
        doc.save(path)


class BundleTests(unittest.TestCase):
    def setUp(self):
        capture = patch("sys.stdout", new_callable=io.StringIO)
        capture.start()
        self.addCleanup(capture.stop)
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.inputs = self.root / "input"
        self.inputs.mkdir()
        self.work = self.root / "review"
        self.output = self.root / "package"

    def tearDown(self):
        self.temp.cleanup()

    def prepare(self, **kwargs):
        values = dict(inputs=[str(self.inputs)], work=str(self.work), name="test-paper", title="A test paper", main=None, attachment=[])
        values.update(kwargs)
        return bundle.prepare(argparse.Namespace(**values))

    def build(self, reviewed=False):
        return bundle.build(argparse.Namespace(work=str(self.work), output=str(self.output), dpi=72,
                                               require_reviewed=reviewed, draft=not reviewed))

    def review_sources(self):
        plan = pdf.read_json(self.work / "bundle.json")
        for source in plan["sources"]:
            source.update(reviewed=True, review_notes="Synthetic fixture values checked against original source.")
        pdf.write_json(self.work / "bundle.json", plan)

    def test_workbook_preserves_precision_formulas_merges_and_hidden_cells(self):
        path = self.inputs / "tables.xlsx"
        make_workbook(path)
        tables = bundle.workbook_tables(path)
        self.assertEqual(len(tables), 3)
        self.assertEqual(tables[0][0][0], ["Table one", "Text, with\nnewline"])
        rows, meta = tables[1]
        self.assertEqual((len(rows), len(rows[0])), (4, 4))
        self.assertEqual(rows[1], ["123", "-0.020000000000000001", "0.000012", ""])
        self.assertEqual(rows[2], ["", "", "", ""])
        self.assertEqual(rows[3], ["3", "=2+2", "45200", "0.1234"])
        self.assertEqual(meta["merged_ranges"], ["B1:D1"])
        self.assertEqual(meta["hidden_rows"], ["2"])
        self.assertEqual(meta["hidden_columns"][0]["min"], "3")
        self.assertEqual(meta["state"], "hidden")
        self.assertEqual(meta["workbook_properties"]["date1904"], "1")
        self.assertTrue(any("Unsupported number" in warning for warning in meta["warnings"]))
        self.assertEqual(tables[2][0], [])

    def test_supported_number_formats_round_and_pad_signs(self):
        self.assertEqual(bundle.display_number("-12", "00000"), ("-00012", True))
        self.assertEqual(bundle.display_number("2.5", "0"), ("3", True))
        self.assertEqual(bundle.display_number("-2.5", "0"), ("-3", True))
        self.assertEqual(bundle.display_number("0.12345", "0.00%"), ("12.35%", True))
        self.assertEqual(bundle.display_number("0", "0.00E+00"), ("0.00E+00", True))
        self.assertEqual(bundle.display_number("45200", "yyyy-mm-dd"), ("45200", False))

    def test_formula_with_cached_empty_string_remains_empty(self):
        path = self.inputs / "empty-cache.xlsx"
        make_workbook(path)
        with zipfile.ZipFile(path) as archive:
            content = {name: archive.read(name) for name in archive.namelist()}
        content["xl/worksheets/sheet2.xml"] = content["xl/worksheets/sheet2.xml"].replace(
            b'<c r="B4"><f>2+2</f><v/></c>', b'<c r="B4" t="str"><f>IF(1,"","x")</f><v/></c>')
        with zipfile.ZipFile(path, "w") as archive:
            for name, data in content.items():
                archive.writestr(name, data)
        rows, metadata = bundle.workbook_tables(path)[1]
        self.assertEqual(rows[3][1], "")
        self.assertTrue(next(c for c in metadata["cells"] if c["cell"] == "B4")["cached_value_present"])

    def test_end_to_end_tables_text_and_opaque_attachments(self):
        make_workbook(self.inputs / "tables.xlsx")
        raw = b'ID,Value\r\n001,"text, with comma"\r\n'
        (self.inputs / "table.csv").write_bytes(raw)
        (self.inputs / "table.tsv").write_text("ID\tValue\n002\t-0.020\n")
        (self.inputs / "notes.txt").write_text("Supplementary notes.\n")
        opaque = b"\x00\xffunparsed video data"
        (self.inputs / "movie.bin").write_bytes(opaque)
        self.prepare()
        plan = pdf.read_json(self.work / "bundle.json")
        # Select names from original file identity, not source ordering.
        names = {x["id"]:x["filename"] for x in pdf.read_json(self.work/"inventory.json")["sources"]}
        for src in plan["sources"]:
            if names[src["id"]] == "table.csv": src["asset_name"] = "table"
            if names[src["id"]] == "table.tsv": src["asset_name"] = "table-tsv"
        pdf.write_json(self.work/"bundle.json", plan)
        result = self.build()
        self.assertEqual(result["status"], "unreviewed")
        report = bundle.verify(argparse.Namespace(work=str(self.work)))
        self.assertTrue(report["mechanical_ok"], report["issues"])
        self.assertTrue(all(c["matches_source_conversion"] for c in report["artifact_checks"]))
        inventory = pdf.read_json(self.work / "inventory.json")["sources"]
        csv_source = next(s for s in inventory if s["filename"] == "table.csv")
        self.assertEqual((self.output / "assets/supp_table/table.csv").read_bytes(), raw)
        binary = next(s for s in inventory if s["kind"] == "attachment")
        self.assertEqual((self.work / binary["snapshot"]).read_bytes(), opaque)
        self.assertFalse((self.output / "attachments").exists())
        self.assertIn("Draft", (self.output / "SKILL.md").read_text())
        self.assertEqual(bundle.main(["verify", "--work", str(self.work), "--strict"]), 2)

    def test_review_gate_and_clean_reviewed_build(self):
        (self.inputs / "table.csv").write_text("ID,value\n001,-0.020\n")
        self.prepare()
        with self.assertRaisesRegex(ValueError, "not been reviewed"):
            self.build(reviewed=True)
        self.assertFalse(self.output.exists())
        self.review_sources()
        self.assertEqual(self.build(reviewed=True)["status"], "reviewed")
        self.assertEqual(bundle.main(["verify", "--work", str(self.work), "--strict"]), 0)

    def test_duplicate_basenames_and_slug_collisions_are_distinct(self):
        for directory in ["a", "b"]:
            (self.inputs / directory).mkdir()
            (self.inputs / directory / "same.csv").write_text(f"key,value\n{directory},1\n")
        self.prepare()
        plan = pdf.read_json(self.work/"bundle.json")
        for src in plan["sources"]: src["asset_name"] = src["id"]
        pdf.write_json(self.work/"bundle.json",plan)
        self.build()
        files = list((self.output/"assets/supp_table").glob("*.csv"))
        self.assertEqual(len(files),2)
        self.assertNotEqual(files[0].read_text(), files[1].read_text())

    def test_changed_original_snapshot_rejected(self):
        (self.inputs / "table.csv").write_text("ID,value\n001,1\n")
        self.prepare()
        _, _, sources = bundle.load_bundle(self.work)
        (self.work / sources[0]["snapshot"]).write_text("ID,value\n001,2\n")
        with self.assertRaisesRegex(ValueError, "snapshot changed"):
            self.build()

    def test_changed_export_and_missing_output_detected(self):
        (self.inputs / "table.csv").write_text("ID,value\n001,1\n")
        self.prepare()
        self.build()
        _, _, sources = bundle.load_bundle(self.work)
        (self.output / "assets/supp_table/table.csv").unlink()
        report = bundle.verify(argparse.Namespace(work=str(self.work)))
        self.assertFalse(report["mechanical_ok"])
        self.assertTrue(any("differs from extracted evidence" in i for i in report["issues"]))
        (self.work / "extracted" / sources[0]["table"]).write_text("ID,value\n001,2\n")
        with self.assertRaisesRegex(ValueError, "artifact changed"):
            bundle.load_bundle(self.work)

    def test_no_overwrite_or_output_inside_input(self):
        (self.inputs / "notes.txt").write_text("notes")
        with self.assertRaisesRegex(ValueError, "outside input"):
            self.prepare(work=str(self.inputs / "review"))
        self.prepare()
        with self.assertRaisesRegex(ValueError, "exists"):
            self.prepare()
        self.build()
        with self.assertRaisesRegex(ValueError, "new output"):
            self.build()

    def test_all_sources_required_and_notes_required(self):
        (self.inputs / "notes.txt").write_text("notes")
        self.prepare()
        plan = pdf.read_json(self.work / "bundle.json")
        plan["sources"][0]["reviewed"] = True
        pdf.write_json(self.work / "bundle.json", plan)
        with self.assertRaisesRegex(ValueError, "review notes"):
            bundle.load_bundle(self.work)
        plan["sources"] = []
        pdf.write_json(self.work / "bundle.json", plan)
        with self.assertRaisesRegex(ValueError, "exactly once"):
            bundle.load_bundle(self.work)

    def test_explicit_opaque_override_for_unparseable_csv(self):
        path = self.inputs / "irregular.csv"
        path.write_text("a,b\nc\n")
        with self.assertRaisesRegex(ValueError, "Non-rectangular"):
            self.prepare()
        self.assertFalse(self.work.exists())
        self.prepare(attachment=[str(path)])
        self.build()
        _, _, sources = bundle.load_bundle(self.work)
        self.assertEqual(sources[0]["kind"], "attachment")

    def test_oversized_sparse_workbook_refused(self):
        path = self.inputs / "huge.xlsx"
        make_workbook(path)
        with zipfile.ZipFile(path) as archive:
            content = {name: archive.read(name) for name in archive.namelist()}
        content["xl/worksheets/sheet1.xml"] = content["xl/worksheets/sheet1.xml"].replace(b'A1', b'XFD1048576')
        with zipfile.ZipFile(path, "w") as archive:
            for name, data in content.items():
                archive.writestr(name, data)
        with self.assertRaisesRegex(ValueError, "exceeds"):
            bundle.workbook_tables(path)

    def test_two_pdf_pipeline_preserves_pages_and_separates_figure_names(self):
        main, supplement = self.inputs / "main.pdf", self.inputs / "supplement.pdf"
        make_pdf(main, "Main result 123")
        make_pdf(supplement, "Supplement result 456")
        self.prepare(main=str(main))
        args = argparse.Namespace(work=str(self.work), ocr="never", language="eng", tessdata=None, password_env=None, preview_dpi=72)
        bundle.extract(args)
        # Resume must retain edits instead of rescanning the completed PDFs.
        _, _, sources = bundle.load_bundle(self.work)
        for source in sources:
            child = self.work / "documents" / source["id"]
            plan = pdf.read_json(child / "plan.json")
            path = child / plan["pages"][0]["file"]
            state = pdf.read_json(path)
            text = "Main result 123" if source["role"] == "main" else "Supplement result 456"
            state.update(reviewed=True, review_notes="Synthetic source: one text line and a colored rectangle checked.", items=[
                {"id": "text", "kind": "text", "bbox": [20, 10, 280, 50], "markdown": text},
                {"id": "figure", "kind": "figure", "bbox": [20, 90, 160, 170], "asset_name": "figure1", "label": "Figure 1"},
            ])
            pdf.write_json(path, state)
        bundle.extract(args)
        self.review_sources()
        result = self.build(reviewed=True)
        self.assertEqual(result["status"], "reviewed")
        images = list(self.output.glob("assets/*/figure-1.jpg"))
        self.assertEqual(len(images), 2)
        for source in sources:
            docname = "paper" if source["role"] == "main" else "supplement"
            category = "figure" if source["role"] == "main" else "supp_figs"
            text = (self.output / "references" / (docname + ".md")).read_text()
            self.assertNotIn("<!-- PDF page", text)
            self.assertNotIn("![", text)
            self.assertIn(f"../assets/{category}/figure-1.jpg", text)
        self.assertEqual(bundle.main(["verify", "--work", str(self.work), "--strict"]), 0)
        # A failed second build must not invalidate the successful first one.
        real_build = pdf.build
        calls = 0
        def fail_second(args):
            nonlocal calls
            calls += 1
            if calls == 2:
                raise ValueError("Simulated second-document rendering failure")
            return real_build(args)
        with patch.object(pdf, "build", side_effect=fail_second):
            with self.assertRaisesRegex(ValueError, "Simulated"):
                bundle.build(argparse.Namespace(work=str(self.work), output=str(self.root / "failed-output"),
                                                dpi=72, require_reviewed=True, draft=False))
        self.assertFalse((self.root / "failed-output").exists())
        self.assertEqual(bundle.verify(argparse.Namespace(work=str(self.work)))["status"], "reviewed")
        images[0].write_bytes(b"changed image")
        report = bundle.verify(argparse.Namespace(work=str(self.work)))
        self.assertFalse(report["mechanical_ok"])

    def test_strict_openxml_matches_transitional_values(self):
        regular = self.inputs / "regular.xlsx"
        strict = self.inputs / "strict.xlsx"
        make_workbook(regular)
        with zipfile.ZipFile(regular) as old, zipfile.ZipFile(strict, "w") as new:
            for name in old.namelist():
                data = old.read(name).replace(b"http://schemas.openxmlformats.org/spreadsheetml/2006/main", b"http://purl.oclc.org/ooxml/spreadsheetml/main")
                data = data.replace(bundle.REL.encode(), b"http://purl.oclc.org/ooxml/officeDocument/relationships")
                new.writestr(name, data)
        self.assertEqual(bundle.workbook_tables(regular), bundle.workbook_tables(strict))

    def test_images_and_figure_pdf_follow_template_and_preserve_all_frames(self):
        from PIL import Image
        import reading_package as reading
        mainfig = self.inputs / "Figure 1.pdf"
        make_pdf(mainfig, "Panel A 123")
        with pymupdf.open(mainfig) as doc:
            doc.new_page(width=300, height=300).insert_text((30,30), "Panel B 456")
            doc.save(self.inputs / "panels.pdf")
        mainfig.unlink()
        Image.new('RGBA', (3200, 1600), (255,0,0,100)).save(self.inputs / 'extended.png')
        Image.new('RGB',(20,30),'red').save(self.inputs/'stack.tiff',save_all=True,append_images=[Image.new('RGB',(20,30),'blue')])
        self.prepare()
        plan = pdf.read_json(self.work/'bundle.json')
        for source in plan['sources']:
            if source['title'] == 'panels':
                source.update(role='figure', asset_name='figure-1', title='Figure 1')
        pdf.write_json(self.work/'bundle.json',plan)
        self.review_sources()
        self.build(reviewed=True)
        self.assertEqual(reading.template_issues(self.output), [])
        self.assertEqual({p.name for p in self.output.iterdir()}, {'SKILL.md','references','assets'})
        self.assertEqual({p.name for p in (self.output/'references').iterdir()}, {'index.md','paper.md','supplement.md'})
        self.assertEqual(len(list((self.output/'assets/figure').glob('*.jpg'))),2)
        self.assertEqual(len(list((self.output/'assets/supp_figs').glob('*.jpg'))),3)
        with Image.open(self.output/'assets/supp_figs/extended.jpg') as image:
            self.assertEqual(image.size,(2800,1400))
            self.assertEqual(image.mode,'RGB')
        self.assertEqual(bundle.verify(argparse.Namespace(work=str(self.work)))['status'],'reviewed')
        (self.output/'references/extra.json').write_text('{}')
        self.assertFalse(bundle.verify(argparse.Namespace(work=str(self.work)))['mechanical_ok'])

    def test_main_and_supplementary_workbook_table_routing(self):
        make_workbook(self.inputs/'tables.xlsx')
        self.prepare()
        plan=pdf.read_json(self.work/'bundle.json')
        plan['sources'][0]['tables']={'1':{'category':'table','asset_name':'table-1','title':'Table 1'},
                                      '2':{'category':'supp_table','asset_name':'supplementary-table-1','title':'Supplementary Table 1'}}
        pdf.write_json(self.work/'bundle.json',plan)
        self.build()
        self.assertTrue((self.output/'assets/table/table-1.csv').exists())
        self.assertTrue((self.output/'assets/supp_table/supplementary-table-1.csv').exists())
        self.assertIn('### Table 1', (self.output/'references/paper.md').read_text())
        self.assertIn('-0.020000000000000001', (self.output/'references/supplement.md').read_text())
        self.assertTrue((self.output/'assets/supp_table/tables-sheet-3.csv').exists())

    def test_index_ignores_quoted_headings_and_rejects_stale_navigation(self):
        (self.inputs/'paper.md').write_text('## Results\n\nFinding.\n\n````text\n## Fake section\n![quoted](example.png)\n````\n\n## Methods\n\nDetails.\n')
        self.prepare()
        plan=pdf.read_json(self.work/'bundle.json')
        plan['sources'][0]['role']='main'
        plan['navigation']=[{'file':'references/paper.md','heading':'Absent','purpose':'Missing'}]
        pdf.write_json(self.work/'bundle.json',plan)
        with self.assertRaisesRegex(ValueError,'absent'):
            self.build()
        self.assertFalse(self.output.exists())
        plan['navigation']=[{'file':'references/paper.md','heading':'Results','purpose':'Reported finding'}]
        pdf.write_json(self.work/'bundle.json',plan)
        self.build()
        index=(self.output/'references/index.md').read_text()
        self.assertIn('Reported finding',index)
        self.assertNotIn('Fake section',index)
        self.assertIn('![quoted](example.png)',(self.output/'references/paper.md').read_text())

    def test_asset_name_collision_cannot_overwrite_source(self):
        from PIL import Image
        Image.new('RGB',(20,20)).save(self.inputs/'same.jpg')
        Image.new('RGB',(30,30)).save(self.inputs/'same.png')
        self.prepare()
        with self.assertRaisesRegex(ValueError,'collision'):
            self.build()
        self.assertFalse(self.output.exists())

    def test_positioned_monospace_keeps_indentation(self):
        with pymupdf.open() as doc:
            page=doc.new_page()
            page.insert_text((80,80),'if condition:',fontname='cour')
            page.insert_text((80,100),'    result = 1',fontname='cour')
            actual=pdf.verbatim_region(page,[70,60,280,110])
            self.assertEqual(actual,'if condition:\n    result = 1')

    def test_cross_page_sentence_and_float_order_keep_context(self):
        path=self.inputs/'main.pdf'
        with pymupdf.open() as doc:
            doc.new_page().insert_text((30,30),'A sentence continues')
            doc.new_page().insert_text((30,30),'across pages.')
            doc.save(path)
        self.prepare()
        bundle.extract(argparse.Namespace(work=str(self.work),ocr='never',language='eng',tessdata=None,password_env=None,preview_dpi=72))
        sid=pdf.read_json(self.work/'bundle.json')['sources'][0]['id']
        child=self.work/'documents'/sid
        plan=pdf.read_json(child/'plan.json')
        first=pdf.read_json(child/plan['pages'][0]['file'])
        first['items']=[{'id':'first','kind':'text','bbox':[20,10,280,50],'markdown':'A sentence continues'},
                        {'id':'float','kind':'figure','bbox':[20,90,160,170],'asset_name':'figure-1','label':'Figure 1'}]
        second=pdf.read_json(child/plan['pages'][1]['file'])
        second['items']=[{'id':'second','kind':'text','bbox':[20,10,280,50],'markdown':'across pages.','join_previous':'space'}]
        for page,entry in zip([first,second],plan['pages']):
            page.update(reviewed=True,review_notes='Compared both halves of the synthetic cross-page sentence and figure.')
            pdf.write_json(child/entry['file'],page)
        plan['reading_order']=['first','second','float']
        pdf.write_json(child/'plan.json',plan)
        self.review_sources()
        self.build(reviewed=True)
        text=(self.output/'references/paper.md').read_text()
        self.assertIn('A sentence continues across pages.',text)
        self.assertLess(text.index('across pages.'),text.index('[Figure 1]'))
        manifest=pdf.read_json(self.work/'build.json')
        self.assertEqual([x['page'] for x in manifest['provenance']],[1,2,1])
        self.assertEqual(bundle.verify(argparse.Namespace(work=str(self.work)))['status'],'reviewed')

    def test_bad_local_link_prevents_publication(self):
        (self.inputs/'notes.md').write_text('## Results\n[Missing figure](../assets/figure/missing.jpg)\n')
        self.prepare()
        with self.assertRaisesRegex(ValueError,'Broken local link'):
            self.build()
        self.assertFalse(self.output.exists())
        self.assertFalse((self.work/'build.json').exists())

    def test_markdown_table_retains_empty_edge_cells(self):
        table='||CAD|Crohn|\n|---|---|---|\n|Section|||\n|Cells|A|B|'
        self.assertEqual(pdf.table_rows(table), [['','CAD','Crohn'],['Section','',''],['Cells','A','B']])
        self.assertEqual(pdf.table_rows('|A|B|\n|---|---|\n|x\\|y||'),[['A','B'],['x|y','']])

    def test_citation_spacing_does_not_hide_numeric_changes(self):
        self.assertEqual(pdf.number_tokens('[2,3] [44,69–71]'),pdf.number_tokens('[2, 3] [44, 69–71]'))
        for value in ['-0.020', '1.20e-05', '40%', '14,000', '3,000', '2025.06.03.657653']:
            self.assertEqual(list(pdf.number_tokens(value)),[value])
        self.assertNotEqual(pdf.number_tokens('14,000'),pdf.number_tokens('14,001'))
        self.assertNotEqual(pdf.number_tokens('-0.02'),pdf.number_tokens('0.02'))

    def test_invisible_footer_is_recorded_and_not_compared_as_body(self):
        path=self.inputs/'overflow.pdf'
        with pymupdf.open() as doc:
            page=doc.new_page(width=300,height=300)
            page.insert_text((30,30),'Visible result 123')
            page.insert_text((145,320),'9',fontsize=10)
            doc.save(path)
        self.prepare()
        bundle.extract(argparse.Namespace(work=str(self.work),ocr='never',language='eng',tessdata=None,password_env=None,preview_dpi=72))
        sid=pdf.read_json(self.work/'bundle.json')['sources'][0]['id']; child=self.work/'documents'/sid
        plan=pdf.read_json(child/'plan.json'); pagepath=child/plan['pages'][0]['file']; state=pdf.read_json(pagepath)
        state.update(reviewed=True,review_notes='Synthetic visible text checked; footer lies fully outside page.',
                     items=[{'id':'body','kind':'text','bbox':[20,10,280,50],'markdown':'Visible result 123'}])
        pdf.write_json(pagepath,state); self.review_sources()
        self.assertEqual(self.build(reviewed=True)['status'],'reviewed')
        report=pdf.read_json(child/'verification.json')
        self.assertEqual(report['pages'][0]['independent_parser_outside_page_text'][0]['text'].strip(),'9')

    def test_exact_adjudications_produce_reviewed_with_limitations(self):
        path = self.inputs/'paper.pdf'
        make_pdf(path, 'Measured value 123')
        self.prepare()
        bundle.extract(argparse.Namespace(work=str(self.work),ocr='never',language='eng',tessdata=None,password_env=None,preview_dpi=72))
        sid = pdf.read_json(self.work/'bundle.json')['sources'][0]['id']
        child = self.work/'documents'/sid
        plan = pdf.read_json(child/'plan.json')
        pagepath = child/plan['pages'][0]['file']
        state = pdf.read_json(pagepath)
        state.update(reviewed=True, review_notes='Checked synthetic mismatch against visible source.',
                     items=[{'id':'body','kind':'text','bbox':[20,10,280,50],'markdown':'Measured value 124'}])
        pdf.write_json(pagepath,state)
        self.review_sources()
        self.assertEqual(self.build(reviewed=True)['status'],'unresolved_discrepancies')
        report = pdf.read_json(child/'verification.json')
        entries = [{'page':1, 'check':item['check'], 'fingerprint':item['fingerprint'],
                    'reason':'Visible synthetic source checked; this difference is accepted for the fixture.'}
                   for item in report['pages'][0]['unresolved_checks']]
        pdf.write_json(child/'adjudications.json', {'schema_version':1,'entries':entries})
        final_output = self.root/'final-output'
        result = bundle.build(argparse.Namespace(work=str(self.work),output=str(final_output),dpi=72,
                                                  max_image_side=2800,jpeg_quality=90,require_reviewed=True,draft=False))
        self.assertEqual(result['status'],'reviewed_with_limitations')
        self.assertNotIn('**Draft:',(final_output/'SKILL.md').read_text())
        self.assertEqual(bundle.main(['verify','--work',str(self.work),'--strict']),0)

    def test_review_aid_builds_contact_sheets_and_cleanup_queue(self):
        path = self.inputs/'paper.pdf'
        with pymupdf.open() as doc:
            for number in range(1,4):
                page=doc.new_page(width=300,height=300)
                page.insert_text((30,25),'Article')
                page.insert_text((30,90),f'Body result {number}')
                page.insert_text((30,285),f'Nature 2026 {number}')
            doc.save(path)
        self.prepare()
        bundle.extract(argparse.Namespace(work=str(self.work),ocr='never',language='eng',tessdata=None,password_env=None,preview_dpi=72))
        sid=pdf.read_json(self.work/'bundle.json')['sources'][0]['id']
        child=self.work/'documents'/sid; plan=pdf.read_json(child/'plan.json')
        for number,entry in enumerate(plan['pages'],1):
            page=pdf.read_json(child/entry['file'])
            page.update(reviewed=False,items=[
                {'id':f'h{number}','kind':'text','bbox':[25,10,100,35],'markdown':'Article'},
                {'id':f'b{number}','kind':'text','bbox':[25,70,200,110],'markdown':f'Body result {number}'},
                {'id':f'f{number}','kind':'text','bbox':[25,265,180,295],'markdown':f'Nature 2026 {number}'},
            ])
            pdf.write_json(child/entry['file'],page)
        result=bundle.review_aid(argparse.Namespace(work=str(self.work),columns=2,rows=2,cell_width=300,cell_height=360))
        self.assertEqual(result['pages'],3)
        queue=pdf.read_json(result['queue'])
        kinds=[item['kind'] for item in queue['sources'][0]['items']]
        self.assertIn('suggested_compact_omission',kinds)
        self.assertEqual(len(queue['sources'][0]['contact_sheets']),1)
        self.assertTrue((self.work/queue['sources'][0]['contact_sheets'][0]).is_file())
        for entry in plan['pages']:
            page=pdf.read_json(child/entry['file']); page.update(reviewed=True,review_notes='Checked body and repeated margin text.')
            pdf.write_json(child/entry['file'],page)
        self.review_sources(); self.build(reviewed=True)
        paper=(self.output/'references/paper.md').read_text()
        self.assertNotIn('Nature 2026',paper)
        self.assertGreaterEqual(len(pdf.read_json(self.work/'build.json')['compact_omissions']),6)

    def test_reuse_review_requires_identical_source_hash(self):
        path=self.inputs/'paper.pdf'; make_pdf(path,'Reviewed value 123')
        self.prepare()
        extract_args=lambda work: argparse.Namespace(work=str(work),ocr='never',language='eng',tessdata=None,password_env=None,preview_dpi=72)
        bundle.extract(extract_args(self.work))
        sid=pdf.read_json(self.work/'bundle.json')['sources'][0]['id']; child=self.work/'documents'/sid
        plan=pdf.read_json(child/'plan.json'); pagepath=child/plan['pages'][0]['file']; page=pdf.read_json(pagepath)
        page.update(reviewed=True,review_notes='Visible synthetic page checked.',items=[
            {'id':'body','kind':'text','bbox':[20,10,280,50],'markdown':'Reviewed value 123'}])
        pdf.write_json(pagepath,page); self.review_sources()
        second=self.root/'second-review'
        bundle.prepare(argparse.Namespace(inputs=[str(self.inputs)],work=str(second),name='test-paper',title='Test Paper',main=None,attachment=[]))
        bundle.extract(extract_args(second))
        result=bundle.reuse_review(argparse.Namespace(work=str(second),from_work=str(self.work)))
        self.assertEqual(result['sources'],1)
        second_source=pdf.read_json(second/'bundle.json')['sources'][0]
        self.assertTrue(second_source['reviewed'])
        second_plan=pdf.read_json(second/'documents'/second_source['id']/'plan.json')
        self.assertTrue(pdf.read_json(second/'documents'/second_source['id']/second_plan['pages'][0]['file'])['reviewed'])
        self.assertTrue((second/'review-import.json').is_file())

if __name__ == "__main__":
    unittest.main(verbosity=2)
