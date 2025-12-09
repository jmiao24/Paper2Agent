#!/usr/bin/env bash
set -euo pipefail

# Usage: 05_run_step7_benchmark_assessment.sh <SCRIPT_DIR> <MAIN_DIR> <repo_name>
if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <SCRIPT_DIR> <MAIN_DIR> <repo_name>" >&2
  exit 1
fi

SCRIPT_DIR="$1"
MAIN_DIR="$2"
REPO_NAME="$3"

PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/05_step7_done"
INPUT_CSV="$MAIN_DIR/reports/benchmark_questions.csv"
OUTPUT_CSV="$MAIN_DIR/reports/benchmark_results.csv"
JUDGE_AGENT="$SCRIPT_DIR/agents/benchmark-judge.md"
ASSESSOR_SCRIPT="$SCRIPT_DIR/tools/benchmark_assessor.py"

mkdir -p "$PIPELINE_DIR"

echo "05.7: Running benchmark assessment..." >&2

if [[ -f "$MARKER" ]]; then
  echo "05.7: already done (marker exists)" >&2
  exit 0
fi

if [[ ! -f "$INPUT_CSV" ]]; then
    echo "05.7: No benchmark questions found at $INPUT_CSV. Skipping." >&2
    exit 0
fi

# 1. Install MCP Server
# Logic copied from 06_launch_mcp.sh to ensure consistency
project_dir=$(basename "$MAIN_DIR")
TOOL_PY_PROJECT="$MAIN_DIR/src/${project_dir}_mcp.py"
TOOL_PY_REPO="$MAIN_DIR/src/${REPO_NAME}_mcp.py"

if [[ -f "$TOOL_PY_PROJECT" ]]; then
  TOOL_PY="$TOOL_PY_PROJECT"
elif [[ -f "$TOOL_PY_REPO" ]]; then
  TOOL_PY="$TOOL_PY_REPO"
else
  echo "05.7: ERROR - MCP file not found. Skipping assessment." >&2
  exit 1
fi

echo "05.7: Installing MCP server from $TOOL_PY..." >&2
# We use the project's environment python
ENV_PYTHON="${MAIN_DIR}/${REPO_NAME}-env/bin/python"

if [[ ! -f "$ENV_PYTHON" ]]; then
    echo "05.7: ERROR - Environment python not found at $ENV_PYTHON" >&2
    exit 1
fi

# Install MCP (this registers it with `claude` CLI)
# We try to install, but if it fails (e.g. already exists), we ignore the error and proceed
fastmcp install claude-code "$TOOL_PY" --python "$ENV_PYTHON" || true

# 2. Run Assessment
echo "05.7: Starting assessment..." >&2
python3 "$SCRIPT_DIR/tools/benchmark_assessor.py" \
    --input "$INPUT_CSV" \
    --output "$OUTPUT_CSV" \
    --judge-agent "$SCRIPT_DIR/agents/benchmark-judge.md" \
    --agent-def "$SCRIPT_DIR/agents/benchmark-solver.md"

echo "05.7: Assessment complete. Results in $OUTPUT_CSV" >&2
touch "$MARKER"
