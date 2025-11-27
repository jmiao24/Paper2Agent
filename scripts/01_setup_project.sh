#!/usr/bin/env bash
set -euo pipefail

# Usage: 01_setup_project.sh <SCRIPT_DIR> <FOLDER_NAME>
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <SCRIPT_DIR> <FOLDER_NAME>" >&2
  exit 1
fi

SCRIPT_DIR="$1"
FOLDER_NAME="$2"
MAIN_DIR="$SCRIPT_DIR/$FOLDER_NAME"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/01_setup_done"

mkdir -p "$PIPELINE_DIR"

# Log to stderr; final stdout is MAIN_DIR only.
echo "01: SCRIPT_DIR=$SCRIPT_DIR FOLDER_NAME=$FOLDER_NAME" >&2

if [[ -f "$MARKER" ]]; then
  echo "$MAIN_DIR"
  exit 0
fi

# Create project dir if needed
mkdir -p "$MAIN_DIR"

# Copy configs/templates only if not already present
if [[ ! -d "$MAIN_DIR/.claude" && -d "$SCRIPT_DIR/.claude" ]]; then
  cp -R "$SCRIPT_DIR/.claude" "$MAIN_DIR/.claude"
else
  echo "01: .claude already exists or source missing" >&2
fi

if [[ ! -d "$MAIN_DIR/templates" && -d "$SCRIPT_DIR/templates" ]]; then
  cp -R "$SCRIPT_DIR/templates" "$MAIN_DIR/templates"
else
  echo "01: templates already exists or source missing" >&2
fi

if [[ ! -d "$MAIN_DIR/tools" && -d "$SCRIPT_DIR/tools" ]]; then
  cp -R "$SCRIPT_DIR/tools" "$MAIN_DIR/tools"
else
  echo "01: tools already exists or source missing" >&2
fi

# mark success
touch "$MARKER"

# final output (stdout) that wrapper will capture
echo "$MAIN_DIR"
