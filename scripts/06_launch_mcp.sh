#!/usr/bin/env bash
set -euo pipefail

# Usage: 06_launch_mcp.sh <MAIN_DIR> <repo_name>
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <MAIN_DIR> <repo_name>" >&2
  exit 1
fi

MAIN_DIR="$1"
repo_name="$2"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/06_mcp_done"
mkdir -p "$PIPELINE_DIR"

# Derive project directory name from MAIN_DIR (e.g., /path/to/Scanpy_Agent -> Scanpy_Agent)
project_dir=$(basename "$MAIN_DIR")

# Try both project_dir and repo_name for MCP file (in case step 4 used different naming)
TOOL_PY_PROJECT="$MAIN_DIR/src/${project_dir}_mcp.py"
TOOL_PY_REPO="$MAIN_DIR/src/${repo_name}_mcp.py"

# Use project_dir version if it exists, otherwise fall back to repo_name version
if [[ -f "$TOOL_PY_PROJECT" ]]; then
  TOOL_PY="$TOOL_PY_PROJECT"
elif [[ -f "$TOOL_PY_REPO" ]]; then
  TOOL_PY="$TOOL_PY_REPO"
else
  echo "06: ERROR - MCP file not found. Tried:" >&2
  echo "06:   $TOOL_PY_PROJECT" >&2
  echo "06:   $TOOL_PY_REPO" >&2
  exit 1
fi

echo "06: launching MCP for $project_dir" >&2

if [[ -f "$MARKER" ]]; then
  echo "06: already launched (marker exists)" >&2
  exit 0
fi

echo "06: found ${TOOL_PY}, adding to local mcp connected to claude-code" >&2

# Add (idempotent enough for our purpose) and then call gemini
fastmcp install claude-code "$TOOL_PY" --python "${MAIN_DIR}/${repo_name}-env/bin/python"

# Launch client (this is interactive - we still call it)
claude || echo "06: claude code client exited" >&2

touch "$MARKER"
