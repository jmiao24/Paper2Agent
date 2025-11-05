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

# Define directories
TOOLS_DIR="$MAIN_DIR/src/tools"
TESTS_DIR="$MAIN_DIR/tests/code"

# Install formatting tools
echo "05: Installing/verifying black and isort..." >&2
pip install -q black isort || {
  echo "Error: Failed to install black or isort" >&2
  exit 1
}

# Format code with black and isort before analysis
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

# Install coverage and pylint tools
echo "05: Installing/verifying pytest-cov, coverage, and pylint..." >&2
pip install -q pytest pytest-cov coverage pylint || {
  echo "Error: Failed to install coverage or pylint tools" >&2
  exit 1
}

# Create output directories
mkdir -p "$MAIN_DIR/reports/coverage"
mkdir -p "$MAIN_DIR/reports/quality/pylint"

# Run pytest with coverage
if [[ -d "$TESTS_DIR" ]] && [[ -n "$(find "$TESTS_DIR" -name "*_test.py" -type f 2>/dev/null)" ]]; then
  # Clean Python bytecode cache before pytest to prevent import file mismatch errors
  # This is needed even with --import-mode=importlib because Python's import system
  # can still cache bytecode from previous runs with duplicate module names
  echo "05: Cleaning Python cache files to prevent import conflicts..." >&2
  find "$MAIN_DIR" -type d -name "__pycache__" -exec rm -rf {} + 2>/dev/null || true
  find "$MAIN_DIR" -type f -name "*.pyc" -delete 2>/dev/null || true
  find "$MAIN_DIR" -type f -name "*.pyo" -delete 2>/dev/null || true
  
  echo "05: Running pytest with coverage..." >&2
  cd "$MAIN_DIR"
  # --cache-clear: Clear pytest's internal cache
  # --import-mode=importlib: Use importlib to avoid import file mismatch issues with duplicate module names
  pytest "$TESTS_DIR" \
    --cache-clear \
    --import-mode=importlib \
    --cov="$TOOLS_DIR" \
    --cov-report=xml:"$MAIN_DIR/reports/coverage/coverage.xml" \
    --cov-report=json:"$MAIN_DIR/reports/coverage/coverage.json" \
    --cov-report=html:"$MAIN_DIR/reports/coverage/htmlcov" \
    --cov-report=term \
    -v > "$MAIN_DIR/reports/coverage/pytest_output.txt" 2>&1 || true
  
  # Generate coverage text summary
  echo "05: Generating coverage summary..." >&2
  coverage report --data-file="$MAIN_DIR/reports/coverage/.coverage" > "$MAIN_DIR/reports/coverage/coverage_summary.txt" 2>&1 || true
else
  echo "05: Warning: No test files found, skipping coverage analysis" >&2
  touch "$MAIN_DIR/reports/coverage/coverage_summary.txt"
fi

# Run pylint on tool files
if [[ -d "$TOOLS_DIR" ]]; then
  mapfile -t PY_FILES < <(find "$TOOLS_DIR" -maxdepth 1 -name "*.py" -type f 2>/dev/null)
  if [[ ${#PY_FILES[@]} -gt 0 ]]; then
    echo "05: Running pylint on src/tools/*.py..." >&2
    cd "$MAIN_DIR"
    
    # Run pylint with full report
    pylint "${PY_FILES[@]}" \
      --output-format=text \
      --reports=yes \
      --score=yes \
      > "$MAIN_DIR/reports/quality/pylint/pylint_report.txt" 2>&1 || true
    
    # Extract scores per file
    pylint "${PY_FILES[@]}" \
      --output-format=text \
      --score=yes \
      2>/dev/null | grep -E '^[A-Z]:|Your code has been rated' \
      > "$MAIN_DIR/reports/quality/pylint/pylint_scores.txt" 2>&1 || true
  else
    echo "05: Warning: No Python files found in src/tools/, skipping pylint" >&2
    touch "$MAIN_DIR/reports/quality/pylint/pylint_report.txt"
    touch "$MAIN_DIR/reports/quality/pylint/pylint_scores.txt"
  fi
else
  echo "05: Warning: src/tools/ directory not found, skipping pylint" >&2
  touch "$MAIN_DIR/reports/quality/pylint/pylint_report.txt"
  touch "$MAIN_DIR/reports/quality/pylint/pylint_scores.txt"
fi

echo "05: Coverage and pylint analysis complete, generating reports..." >&2

# Export repo_name for envsubst substitution
export github_repo_name="$repo_name"

# Replace ${github_repo_name} placeholder in prompt
envsubst < "$STEP5_PROMPT" | claude --model claude-sonnet-4-20250514 \
  --verbose --output-format stream-json \
  --dangerously-skip-permissions -p - > "$STEP_OUT"

touch "$MARKER"

