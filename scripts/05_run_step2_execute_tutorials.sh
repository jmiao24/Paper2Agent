#!/usr/bin/env bash
set -euo pipefail

# Usage: 05b_run_step2_execute.sh <SCRIPT_DIR> <MAIN_DIR> [api_key]
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <SCRIPT_DIR> <MAIN_DIR> [api_key]" >&2
  exit 1
fi

SCRIPT_DIR="$1"
MAIN_DIR="$2"
api_key="${3:-}"
STEP_OUT="$MAIN_DIR/claude_outputs/step2_output.json"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/05_step2_done"
mkdir -p "$PIPELINE_DIR"
STEP2_PROMPT="$SCRIPT_DIR/prompts/step2_prompt.md"

echo "05: step 2 executing tutorials -> $STEP_OUT" >&2

if [[ -f "$MARKER" ]]; then
  echo "05: step 2 already done (marker exists)" >&2
  exit 0
fi

export api_key="$api_key"

envsubst < "$STEP2_PROMPT" | claude --model claude-sonnet-4-20250514 \
  --verbose --output-format stream-json \
  --dangerously-skip-permissions -p - > "$STEP_OUT"

touch "$MARKER"
