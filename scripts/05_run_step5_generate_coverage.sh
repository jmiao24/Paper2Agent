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

# Activate environment and install formatting tools
ENV_PATH="$MAIN_DIR/${repo_name}-env"
if [[ ! -d "$ENV_PATH" ]]; then
  echo "Error: Environment not found at $ENV_PATH" >&2
  exit 1
fi

source "$ENV_PATH/bin/activate"

# Install black and isort if not already installed
echo "05: Installing/verifying black and isort..." >&2
pip install -q black isort || {
  echo "Error: Failed to install black or isort" >&2
  exit 1
}

# Format code with black and isort before analysis
TOOLS_DIR="$MAIN_DIR/src/tools"
if [[ -d "$TOOLS_DIR" ]]; then
  # Use find to safely handle cases with no .py files
  mapfile -t PY_FILES < <(find "$TOOLS_DIR" -maxdepth 1 -name "*.py" -type f 2>/dev/null)
  if [[ ${#PY_FILES[@]} -gt 0 ]]; then
    echo "05: Running black on src/tools/*.py..." >&2
    black "${PY_FILES[@]}" 2>&1 | sed 's/^/  /' >&2 || {
      echo "Warning: black encountered errors (continuing anyway)" >&2
    }
    
    echo "05: Running isort on src/tools/*.py..." >&2
    isort "${PY_FILES[@]}" 2>&1 | sed 's/^/  /' >&2 || {
      echo "Warning: isort encountered errors (continuing anyway)" >&2
    }
    
    echo "05: Code formatting complete" >&2
  else
    echo "05: Warning: No Python files found in src/tools/, skipping formatting" >&2
  fi
else
  echo "05: Warning: src/tools/ directory not found, skipping formatting" >&2
fi

# Export repo_name for envsubst substitution
export github_repo_name="$repo_name"

# Replace ${github_repo_name} placeholder in prompt
envsubst < "$STEP5_PROMPT" | claude --model claude-sonnet-4-20250514 \
  --verbose --output-format stream-json \
  --dangerously-skip-permissions -p - > "$STEP_OUT"

touch "$MARKER"

