#!/usr/bin/env python3
import json
import sys
import argparse


def preprocess_notebook(input_path, output_path, max_text_len=2000):
    """
    Reads a notebook, removes images, truncates long text, and saves it.
    """
    try:
        with open(input_path, "r", encoding="utf-8") as f:
            nb = json.load(f)
    except Exception as e:
        print(f"Error reading notebook {input_path}: {e}", file=sys.stderr)
        sys.exit(1)

    new_cells = []

    for cell in nb.get("cells", []):
        # Keep the cell metadata and source
        new_cell = {
            "cell_type": cell.get("cell_type"),
            "metadata": cell.get("metadata", {}),
            "source": cell.get("source", []),
        }

        # If it's a code cell, process outputs
        if cell.get("cell_type") == "code":
            new_cell["execution_count"] = cell.get("execution_count")
            new_outputs = []

            for output in cell.get("outputs", []):
                output_type = output.get("output_type")

                # Skip stream outputs if they are too long (optional, but good for safety)
                # For now, we treat stream and execute_result similarly regarding text content

                new_output = {"output_type": output_type}

                # Handle stream output (stdout/stderr)
                if output_type == "stream":
                    new_output["name"] = output.get("name")
                    text = output.get("text", [])
                    if isinstance(text, list):
                        text = "".join(text)

                    if len(text) > max_text_len:
                        text = (
                            text[:max_text_len]
                            + f"\n... [Truncated {len(text)-max_text_len} chars] ..."
                        )

                    new_output["text"] = [text]  # Keep as list for consistency
                    new_outputs.append(new_output)

                # Handle execute_result and display_data
                elif output_type in ["execute_result", "display_data"]:
                    data = output.get("data", {})
                    new_data = {}

                    # Keep text/plain
                    if "text/plain" in data:
                        text = data["text/plain"]
                        if isinstance(text, list):
                            text = "".join(text)

                        if len(text) > max_text_len:
                            text = (
                                text[:max_text_len]
                                + f"\n... [Truncated {len(text)-max_text_len} chars] ..."
                            )

                        new_data["text/plain"] = [text]

                    # Explicitly DROP image data (image/png, image/jpeg, etc.)
                    # We do NOT copy them to new_data

                    if new_data:
                        new_output["data"] = new_data
                        new_output["metadata"] = output.get("metadata", {})
                        if output_type == "execute_result":
                            new_output["execution_count"] = output.get(
                                "execution_count"
                            )
                        new_outputs.append(new_output)

                elif output_type == "error":
                    # Keep errors as is, usually important
                    new_outputs.append(output)

            new_cell["outputs"] = new_outputs

        else:
            # Markdown/Raw cells - keep as is
            pass

        new_cells.append(new_cell)

    nb["cells"] = new_cells

    with open(output_path, "w", encoding="utf-8") as f:
        json.dump(nb, f, indent=2)

    print(f"Preprocessed notebook saved to {output_path}")


def main():
    parser = argparse.ArgumentParser(
        description="Preprocess notebook for LLM: strip images, truncate text."
    )
    parser.add_argument("input_notebook", help="Path to input .ipynb file")
    parser.add_argument("output_notebook", help="Path to output .ipynb file")
    parser.add_argument(
        "--max_len", type=int, default=2000, help="Max chars for text output"
    )

    args = parser.parse_args()

    preprocess_notebook(args.input_notebook, args.output_notebook, args.max_len)


if __name__ == "__main__":
    main()
