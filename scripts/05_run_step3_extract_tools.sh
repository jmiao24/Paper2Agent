#!/usr/bin/env bash
set -euo pipefail

# Usage: 05c_run_step3_extract.sh <SCRIPT_DIR> <MAIN_DIR> [api_key]
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <SCRIPT_DIR> <MAIN_DIR> [api_key]" >&2
  exit 1
fi

SCRIPT_DIR="$1"
MAIN_DIR="$2"
api_key="${3:-}"
STEP_OUT="$MAIN_DIR/claude_outputs/step3_output.json"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/05_step3_done"
mkdir -p "$PIPELINE_DIR"

STEP3_PROMPT="$SCRIPT_DIR/prompts/step3_prompt.md"

echo "05: step 3 extracting tools -> $STEP_OUT" >&2

if [[ -f "$MARKER" ]]; then
  echo "05: step 3 already done (marker exists)" >&2
  exit 0
fi

export api_key="$api_key"

envsubst < "$STEP3_PROMPT" | claude --model claude-sonnet-4-20250514 \
  --verbose --output-format stream-json \
  --dangerously-skip-permissions -p - > "$STEP_OUT"

touch "$MARKER"
