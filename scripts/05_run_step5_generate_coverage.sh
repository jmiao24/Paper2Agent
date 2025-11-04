#!/usr/bin/env bash
set -euo pipefail

# Usage: 05_run_step5_generate_coverage.sh <SCRIPT_DIR> <MAIN_DIR> <repo_name>
if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <SCRIPT_DIR> <MAIN_DIR> <repo_name>" >&2
  exit 1
fi

SCRIPT_DIR="$1"
MAIN_DIR="$2"
repo_name="$3"
STEP_OUT="$MAIN_DIR/claude_outputs/step5_output.json"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/05_step5_done"
mkdir -p "$PIPELINE_DIR"

STEP5_PROMPT="$SCRIPT_DIR/prompts/step5_prompt.md"

echo "05: step 5 generating coverage reports -> $STEP_OUT" >&2

if [[ -f "$MARKER" ]]; then
  echo "05: step 5 already done (marker exists)" >&2
  exit 0
fi

# Export repo_name for envsubst substitution
export github_repo_name="$repo_name"

# Replace ${github_repo_name} placeholder in prompt
envsubst < "$STEP5_PROMPT" | claude --model claude-sonnet-4-20250514 \
  --verbose --output-format stream-json \
  --dangerously-skip-permissions -p - > "$STEP_OUT"

touch "$MARKER"

