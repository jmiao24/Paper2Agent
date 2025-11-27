#!/usr/bin/env bash
set -euo pipefail

# Usage: 05_run_step1_setup_env.sh <SCRIPT_DIR> <MAIN_DIR> <repo_name> [tutorial_filter]
if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <SCRIPT_DIR> <MAIN_DIR> <repo_name> [tutorial_filter]" >&2
  exit 1
fi

SCRIPT_DIR="$1"
MAIN_DIR="$2"
repo_name="$3"
tutorial_filter="${4:-}"
STEP_OUT="$MAIN_DIR/claude_outputs/step1_output.json"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/05_step1_done"
mkdir -p "$PIPELINE_DIR"

STEP1_PROMPT="$SCRIPT_DIR/prompts/step1_prompt.md"

# Only output stdout when command-substituted: no final echo (this script is typically run directly).
echo "05: step1 prompt -> $STEP_OUT" >&2

if [[ -f "$MARKER" ]]; then
  echo "05: step 1 already done (marker exists)" >&2
  exit 0
fi

export github_repo_name="$repo_name"
export tutorial_filter="$tutorial_filter"

envsubst < "$STEP1_PROMPT" | claude \
  --model claude-sonnet-4-20250514 \
  --verbose \
  --output-format stream-json \
  --dangerously-skip-permissions \
  -p - > "$STEP_OUT"

touch "$MARKER"