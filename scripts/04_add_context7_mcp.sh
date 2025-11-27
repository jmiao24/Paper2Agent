#!/usr/bin/env bash
set -euo pipefail

# Usage: 04_add_context_mcp.sh <MAIN_DIR>
if [[ $# -lt 1 ]]; then
  echo "Usage: $0 <MAIN_DIR>" >&2
  exit 1
fi

MAIN_DIR="$1"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/04_context7_done"
mkdir -p "$PIPELINE_DIR"

echo "04: adding context7 MCP (idempotent)" >&2

if [[ -f "$MARKER" ]]; then
  echo "04: already added (marker exists)" >&2
  exit 0
fi

if claude mcp add context7 -- npx -y @upstash/context7-mcp@latest; then
  touch "$MARKER"
  echo "04: context7 added" >&2
else
  echo "04: warning - failed to add context7 MCP, continuing" >&2
  # don't create marker on failure
fi
