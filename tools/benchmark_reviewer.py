#!/usr/bin/env python3
import json
import sys
import argparse
import csv
import os
import subprocess
from typing import Dict, Any, List, Optional


def run_claude_cli(
    prompt: str, system_prompt: Optional[str] = None, timeout: int = 600
) -> str:
    """Run the Claude CLI with the given prompt."""
    cmd = [
        "claude",
        "--model",
        "claude-sonnet-4-20250514",
        "--print",
        "--output-format",
        "json",
        "--dangerously-skip-permissions",  # Skip permissions for automated run
        prompt,
    ]

    if system_prompt:
        cmd[-1] = f"{system_prompt}\n\n---\n\n{prompt}"

    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, cwd=os.getcwd()
        )

        if result.returncode != 0:
            print(f"Claude CLI failed: {result.stderr}", file=sys.stderr)
            return f"ERROR: {result.stderr}"

        # Parse JSON output
        try:
            output_json = json.loads(result.stdout)
            # Handle list or dict
            if isinstance(output_json, list) and len(output_json) > 0:
                return output_json[0].get("result", str(output_json))
            elif isinstance(output_json, dict):
                return output_json.get("result", str(output_json))
            else:
                return result.stdout.strip()
        except json.JSONDecodeError:
            return result.stdout.strip()

    except subprocess.TimeoutExpired:
        return "ERROR: Timeout"
    except Exception as e:
        return f"ERROR: {e}"


def review_questions(
    questions: List[Dict[str, Any]], reviewer_def: str
) -> List[Dict[str, Any]]:
    """
    Run the reviewer agent to filter and refine questions.
    """
    if not questions:
        return []

    print(
        f"Reviewing {len(questions)} candidate questions globally...", file=sys.stderr
    )

    # Chunking strategy if too many questions? For now, assume < 100 questions fits in context.
    # If > 50 questions, maybe we should sample or chunk. But let's try all at once first.

    prompt = f"""
Task: Review the following list of candidate benchmark questions collected from multiple tutorials.
Select the top 10-15 high-quality, non-redundant, self-contained questions that focus on data analysis results.
Ensure diversity across different tutorials if possible, but prioritize quality.
Return the selected questions in the specified JSON format.

Candidate Questions:
{json.dumps(questions, indent=2)}
"""

    response = run_claude_cli(prompt, system_prompt=reviewer_def)

    # Parse response
    try:
        # Robust JSON extraction
        start_idx = response.find("{")
        end_idx = response.rfind("}")

        if start_idx != -1 and end_idx != -1:
            json_str = response[start_idx : end_idx + 1]
            data = json.loads(json_str)
            return data.get("selected_questions", [])
        else:
            print(
                "Warning: Could not parse reviewer response JSON. Using original list.",
                file=sys.stderr,
            )
            return questions

    except Exception as e:
        print(
            f"Error parsing reviewer response: {e}. Using original list.",
            file=sys.stderr,
        )
        return questions


def main():
    parser = argparse.ArgumentParser(
        description="Review and filter benchmark questions globally."
    )
    parser.add_argument(
        "--input",
        required=True,
        help="Path to the input CSV file containing all questions",
    )
    parser.add_argument(
        "--reviewer-agent", required=True, help="Path to benchmark-reviewer.md"
    )
    parser.add_argument(
        "--output",
        required=False,
        help="Path to save the filtered questions (CSV). Defaults to input path.",
    )

    args = parser.parse_args()
    output_path = args.output if args.output else args.input

    if not os.path.exists(args.input):
        print(f"Input file {args.input} does not exist. Exiting.", file=sys.stderr)
        sys.exit(0)

    # Load questions from CSV
    questions = []
    with open(args.input, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        for row in reader:
            questions.append(row)

    if not questions:
        print("No questions found in input file.", file=sys.stderr)
        sys.exit(0)

    # Load reviewer agent definition
    try:
        with open(args.reviewer_agent, "r") as f:
            reviewer_def = f.read()
    except Exception as e:
        print(f"Error loading reviewer agent: {e}", file=sys.stderr)
        sys.exit(1)

    # Run review
    reviewed_questions = review_questions(questions, reviewer_def)

    if not reviewed_questions:
        print(
            "Warning: Reviewer returned 0 questions. Keeping original list.",
            file=sys.stderr,
        )
        reviewed_questions = questions

    # Write back to CSV
    fieldnames = [
        "question_id",
        "tutorial_id",
        "tutorial_path",
        "question",
        "ground_truth",
        "answer_type",
        "cell_id",
    ]

    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=fieldnames)
        writer.writeheader()
        for q in reviewed_questions:
            # Ensure all fields exist
            row = {k: q.get(k, "") for k in fieldnames}
            writer.writerow(row)

    print(
        f"Successfully wrote {len(reviewed_questions)} reviewed questions to {output_path}"
    )


if __name__ == "__main__":
    main()
