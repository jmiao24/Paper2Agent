#!/usr/bin/env python3
import json
import sys
import argparse
import re
import csv
import os
from typing import Dict, Any


def load_notebook(notebook_path: str) -> Dict[str, Any]:
    """Load a Jupyter notebook."""
    with open(notebook_path, "r", encoding="utf-8") as f:
        return json.load(f)


def extract_cell_outputs(notebook: Dict[str, Any]) -> Dict[int, str]:
    """
    Extract outputs from code cells.
    Returns a dictionary mapping execution_count (or cell index) to its output text.
    """
    outputs = {}
    for idx, cell in enumerate(notebook.get("cells", [])):
        if cell.get("cell_type") != "code":
            continue

        # Use execution_count as the ID to match LLM behavior (which sees "In [X]")
        exec_count = cell.get("execution_count")
        if exec_count is not None:
            cell_id = int(exec_count)
        else:
            # Fallback to index if no execution count (unlikely for executed notebooks)
            # We add 10000 to avoid collision with execution counts usually
            cell_id = idx + 10000

        cell_outputs = cell.get("outputs", [])
        if not cell_outputs:
            continue

        # Combine all text outputs for this cell
        text_content = []
        for output in cell_outputs:
            if "text" in output:
                text_content.extend(output["text"])
            elif "data" in output and "text/plain" in output["data"]:
                text_content.extend(output["data"]["text/plain"])
            elif "text/plain" in output:  # Some formats might have it directly
                text_content.extend(output["text/plain"])

        if text_content:
            # Join and clean up
            full_text = "".join(text_content).strip()
            if full_text:
                outputs[cell_id] = full_text

    return outputs


def is_plotting_question(question_text: str) -> bool:
    """
    Check if the question is about plotting or visualization.
    Returns True if it contains forbidden keywords.
    """
    forbidden_keywords = [
        "plot",
        "figure",
        "graph",
        "chart",
        "axis",
        "axes",
        "legend",
        "color",
        "title",
        "visualize",
        "umap",
        "tsne",
        "spatial",
        "heatmap",
        "dotplot",
        "violin",
        "scatter",
        "histogram",
        "grid",
        "subplot",
    ]

    # Allow "umap" or "tsne" only if asking for coordinates/data, but it's safer to exclude for now
    # or check context. For now, let's be strict.

    text_lower = question_text.lower()
    for keyword in forbidden_keywords:
        # Simple substring check - can be improved with word boundaries if needed
        if keyword in text_lower:
            return True
    return False


def validate_question(
    question_data: Dict[str, Any], cell_outputs: Dict[int, str]
) -> Dict[str, Any]:
    """
    Validate a single question against the notebook outputs.
    Checks if the ground truth is actually present in the specified cell.
    """
    cell_id = question_data.get("cell_id")
    ground_truth = str(question_data.get("ground_truth", "")).strip()

    if cell_id is None:
        return {"valid": False, "reason": "Missing cell_id"}

    if cell_id not in cell_outputs:
        return {
            "valid": False,
            "reason": f"Cell ID {cell_id} has no output or does not exist",
        }

    output_text = cell_outputs[cell_id]

    # Simple containment check (can be improved with regex or fuzzy matching if needed)
    # We normalize whitespace for comparison
    normalized_output = " ".join(output_text.split())
    normalized_gt = " ".join(ground_truth.split())

    if normalized_gt in normalized_output:
        return {"valid": True}

    # Try checking if it's a number and close enough (if numeric)
    try:
        gt_float = float(ground_truth)
        # Simple regex to find numbers in output
        numbers = [float(x) for x in re.findall(r"[-+]?\d*\.\d+|\d+", output_text)]
        for num in numbers:
            if abs(num - gt_float) < 1e-5:  # Epsilon for float comparison
                return {"valid": True}
    except ValueError:
        pass

    return {
        "valid": False,
        "reason": f"Ground truth '{ground_truth}' not found in cell {cell_id} output",
        "cell_output_preview": output_text[:100] + "..."
        if len(output_text) > 100
        else output_text,
    }


def main():
    parser = argparse.ArgumentParser(
        description="Validate benchmark questions against notebook execution."
    )
    parser.add_argument(
        "--notebook", required=True, help="Path to the executed notebook"
    )
    parser.add_argument(
        "--questions",
        required=True,
        help="Path to the JSON file containing extracted questions",
    )
    parser.add_argument(
        "--output", required=True, help="Path to save the validated questions (CSV)"
    )

    args = parser.parse_args()

    # Load data
    try:
        notebook = load_notebook(args.notebook)

        # Load questions - handle potential CLI output wrapping
        with open(args.questions, "r") as f:
            raw_data = json.load(f)

        # Check if it's wrapped in CLI output format
        if isinstance(raw_data, dict) and "result" in raw_data:
            content = raw_data["result"]

            # Robust JSON extraction: find the first '{' and the last '}'
            # This handles markdown blocks, conversational text, etc.
            try:
                # Find start and end of JSON object
                start_idx = content.find("{")
                end_idx = content.rfind("}")

                if start_idx != -1 and end_idx != -1 and end_idx > start_idx:
                    json_str = content[start_idx : end_idx + 1]
                    questions_data = json.loads(json_str)
                else:
                    # No JSON object found
                    print(
                        f"Warning: No JSON object found in result for {args.notebook}. Content preview: {content[:100]}...",
                        file=sys.stderr,
                    )
                    questions_data = {"questions": []}  # Return empty to avoid crash

            except json.JSONDecodeError as e:
                print(f"Error parsing extracted JSON string: {e}", file=sys.stderr)
                print(f"Failed content snippet: {json_str[:100]}...", file=sys.stderr)
                questions_data = {"questions": []}
        else:
            # Assume it's already the direct JSON
            questions_data = raw_data
    except Exception as e:
        print(f"Error loading files: {e}", file=sys.stderr)
        sys.exit(1)

    cell_outputs = extract_cell_outputs(notebook)

    valid_questions = []

    # Process questions
    # Handle both list of questions or wrapped in "questions" key
    q_list = (
        questions_data.get("questions", [])
        if isinstance(questions_data, dict)
        else questions_data
    )

    print(f"Validating {len(q_list)} questions...")

    for q in q_list:
        # Check for plotting keywords first
        if is_plotting_question(q.get("question", "")):
            print(
                f"Warning: Question skipped due to plotting keywords: {q.get('question', '')[:100]}..."
            )
            continue

        validation = validate_question(q, cell_outputs)
        if validation["valid"]:
            valid_questions.append(q)
        else:
            print(f"Warning: Invalid question skipped. Reason: {validation['reason']}")

    # Write to CSV (append mode if file exists, else write header)

    file_exists = os.path.isfile(args.output)

    fieldnames = [
        "question_id",
        "tutorial_id",
        "tutorial_path",
        "question",
        "ground_truth",
        "answer_type",
        "cell_id",
    ]

    with open(args.output, "a", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        if not file_exists:
            writer.writeheader()

        for i, q in enumerate(valid_questions):
            # Generate a simple ID if not present
            if "question_id" not in q:
                tut_id = q.get("tutorial_id", "unknown")
                q["question_id"] = f"{tut_id}_q{i+1}"

            # Ensure all fields exist
            row = {k: q.get(k, "") for k in fieldnames}
            writer.writerow(row)

    print(
        f"Successfully wrote {len(valid_questions)} validated questions to {args.output}"
    )


if __name__ == "__main__":
    main()
