#!/usr/bin/env python3
"""
Benchmark Assessor Script

This script:
1. Loads benchmark questions from CSV.
2. Runs each question through the Claude CLI (connected to the MCP).
3. Collects the agent's response.
4. Uses a second LLM call (Judge) to evaluate the response against the ground truth.
5. Saves the results to a new CSV.
"""

import os
import sys
import argparse
import subprocess
import time
import json
import csv
import logging
from typing import Optional, Dict, Any, List, Tuple

# Set up logging
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s",
    handlers=[logging.StreamHandler(sys.stdout)],
)
logger = logging.getLogger(__name__)


def load_benchmark_csv(csv_path: str) -> List[Dict[str, Any]]:
    """Load the benchmark CSV file."""
    if not os.path.exists(csv_path):
        logger.error(f"Input CSV file not found: {csv_path}")
        sys.exit(1)

    with open(csv_path, "r", encoding="utf-8") as f:
        reader = csv.DictReader(f)
        return list(reader)


def run_claude_cli(
    prompt: str, system_prompt: Optional[str] = None, timeout: int = 600
) -> Tuple[str, str]:
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

    # If we have a system prompt (e.g. for the Judge), we might need to prepend it or pass it differently.
    # The `claude` CLI usually takes the prompt as an argument.
    # For the Judge, we'll include the system instructions in the main prompt text for simplicity,
    # or use a specific flag if available. `claude` CLI doesn't have a --system flag documented here,
    # so we'll prepend it to the prompt.

    if system_prompt:
        cmd[-1] = f"{system_prompt}\n\n---\n\n{prompt}"

    try:
        result = subprocess.run(
            cmd, capture_output=True, text=True, timeout=timeout, cwd=os.getcwd()
        )

        if result.returncode != 0:
            logger.warning(f"Claude CLI failed: {result.stderr}")
            return f"ERROR: {result.stderr}", ""

        # Parse JSON output
        try:
            output_json = json.loads(result.stdout)
            # Handle list or dict
            if isinstance(output_json, list) and len(output_json) > 0:
                return output_json[0].get("result", str(output_json)), result.stdout
            elif isinstance(output_json, dict):
                return output_json.get("result", str(output_json)), result.stdout
            else:
                return result.stdout.strip(), result.stdout
        except json.JSONDecodeError:
            return result.stdout.strip(), result.stdout

    except subprocess.TimeoutExpired:
        return "ERROR: Timeout", ""
    except Exception as e:
        return f"ERROR: {e}", ""


def judge_response(
    question: str, ground_truth: str, agent_response: str, judge_agent_def: str
) -> Dict[str, Any]:
    """Run the Judge Agent to evaluate the response."""

    prompt = f"""
Task: Evaluate the following Agent Response against the Ground Truth.

Question: {question}

Ground Truth: {ground_truth}

Agent Response: {agent_response}

Return your evaluation in the specified JSON format.
"""

    response_text, _ = run_claude_cli(prompt, system_prompt=judge_agent_def)

    # Try to parse JSON from the judge's response
    try:
        # Find JSON block if embedded in text
        if "```json" in response_text:
            json_str = response_text.split("```json")[1].split("```")[0].strip()
        elif "{" in response_text:
            json_str = response_text[
                response_text.find("{") : response_text.rfind("}") + 1
            ]
        else:
            json_str = response_text

        return json.loads(json_str)
    except Exception as e:
        logger.warning(
            f"Failed to parse Judge response: {e}. Response was: {response_text}"
        )
        return {
            "score": 0.0,
            "reasoning": f"Judge output parsing failed. Raw output: {response_text}",
        }


def main():
    parser = argparse.ArgumentParser(description="Run benchmark assessment.")
    parser.add_argument(
        "--input", required=True, help="Path to benchmark_questions.csv"
    )
    parser.add_argument("--output", required=True, help="Path to save results CSV")
    parser.add_argument(
        "--judge-agent", required=True, help="Path to benchmark-judge.md"
    )
    parser.add_argument(
        "--agent-def", required=True, help="Path to benchmark-solver.md"
    )

    args = parser.parse_args()

    # Load Judge Agent Definition
    with open(args.judge_agent, "r") as f:
        judge_def = f.read()

    # Load Solver Agent Definition
    with open(args.agent_def, "r") as f:
        solver_def = f.read()

    questions = load_benchmark_csv(args.input)
    results = []

    logger.info(f"Starting assessment of {len(questions)} questions...")

    for i, q in enumerate(questions):
        logger.info(
            f"Processing {i+1}/{len(questions)}: {q.get('question_id', 'unknown')}"
        )

        # 1. Run Agent
        agent_prompt = f"Please answer the following question using the available tools. Provide your full reasoning, the code you executed, and the final answer.\n\nQuestion: {q['question']}"
        start_time = time.time()
        agent_response, full_agent_response = run_claude_cli(
            agent_prompt, system_prompt=solver_def
        )
        duration = time.time() - start_time

        # 2. Run Judge
        judge_result = judge_response(
            q["question"], q["ground_truth"], agent_response, judge_def
        )

        # 3. Record Result
        result_row = q.copy()
        result_row["agent_response"] = agent_response
        result_row["full_agent_response"] = full_agent_response
        result_row["score"] = judge_result.get("score", 0.0)
        result_row["reasoning"] = judge_result.get("reasoning", "")
        result_row["duration_seconds"] = round(duration, 2)

        results.append(result_row)

        # Save after each question for incremental progress
        save_results(results, args.output)

    logger.info(f"Assessment complete. Results saved to {args.output}")


def save_results(results: List[Dict[str, Any]], output_path: str):
    if not results:
        return

    keys = results[0].keys()
    with open(output_path, "w", newline="", encoding="utf-8") as f:
        writer = csv.DictWriter(f, fieldnames=keys)
        writer.writeheader()
        writer.writerows(results)


if __name__ == "__main__":
    main()
