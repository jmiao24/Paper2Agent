#!/usr/bin/env bash
set -euo pipefail

# Usage: 03_prepare_folders.sh <MAIN_DIR>
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <MAIN_DIR>" >&2
  exit 1
fi

MAIN_DIR="$1"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/03_folders_done"
mkdir -p "$PIPELINE_DIR"

echo "03: preparing folder structure under $MAIN_DIR" >&2

if [[ -f "$MARKER" ]]; then
  exit 0
fi

mkdir -p "$MAIN_DIR/reports" \
         "$MAIN_DIR/src/tools" \
         "$MAIN_DIR/tests/code" \
         "$MAIN_DIR/tests/data" \
         "$MAIN_DIR/notebooks" \
         "$MAIN_DIR/tests/results" \
         "$MAIN_DIR/tests/logs" \
         "$MAIN_DIR/tests/summary" \
         "$MAIN_DIR/tmp/inputs" \
         "$MAIN_DIR/tmp/outputs" \
         "$MAIN_DIR/claude_outputs"

touch "$MARKER"
