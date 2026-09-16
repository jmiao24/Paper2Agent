#!/usr/bin/env python3
"""Create a compact inspection copy while preserving the complete source notebook."""

import argparse
from copy import deepcopy
import json
from pathlib import Path
import sys


def _compact_text(value, max_text_len):
    text = "".join(value) if isinstance(value, list) else value
    if len(text) > max_text_len:
        text = text[:max_text_len] + f"\n... [Truncated {len(text)-max_text_len} chars] ..."
    return [text]


def preprocess_notebook(input_path, output_path, max_text_len=2000):
    """Strip rich outputs and truncate plain text in a distinct notebook copy.

    Source cells, IDs, metadata, attachments, execution counts, and errors are
    retained. The output must not alias the input, including through links.
    """
    source, target = Path(input_path), Path(output_path)
    if source.resolve() == target.resolve() or (target.exists() and source.samefile(target)):
        raise ValueError("Inspection output must differ from the source notebook (including links)")
    if max_text_len < 0:
        raise ValueError("Text limit cannot be negative")

    notebook = json.loads(source.read_text(encoding="utf-8"))
    for cell in notebook.get("cells", []):
        if cell.get("cell_type") != "code":
            continue
        outputs = []
        for original in cell.get("outputs", []):
            output = deepcopy(original)
            kind = output.get("output_type")
            if kind == "stream":
                output["text"] = _compact_text(output.get("text", ""), max_text_len)
            elif kind in ("execute_result", "display_data"):
                data = output.get("data", {})
                if "text/plain" not in data:
                    continue
                output["data"] = {"text/plain": _compact_text(data["text/plain"], max_text_len)}
            outputs.append(output)
        cell["outputs"] = outputs

    target.write_text(json.dumps(notebook, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")
    print(f"Preprocessed notebook saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("input_notebook", help="Path to input .ipynb file")
    parser.add_argument("output_notebook", help="Path to a separate output .ipynb file")
    parser.add_argument("--max_len", type=int, default=2000, help="Max chars for text output")
    args = parser.parse_args()
    try:
        preprocess_notebook(args.input_notebook, args.output_notebook, args.max_len)
    except (OSError, ValueError, TypeError) as exc:
        print(f"Error: {exc}", file=sys.stderr)
        return 1
    return 0


if __name__ == "__main__":
    sys.exit(main())
