#!/usr/bin/env bash
set -euo pipefail

# Usage: 02_clone_repo.sh <MAIN_DIR> <GITHUB_REPO_URL>
if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <MAIN_DIR> <GITHUB_REPO_URL>" >&2
  exit 1
fi

MAIN_DIR="$1"
GITHUB_REPO_URL="$2"
repo_name=$(basename "$GITHUB_REPO_URL" .git)
REPO_DIR="$MAIN_DIR/$repo_name"
PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/02_clone_done"
mkdir -p "$PIPELINE_DIR"


echo "02: clone target=$GITHUB_REPO_URL into $REPO_DIR" >&2

if [[ -f "$MARKER" && -d "$REPO_DIR" ]]; then
  echo "repo/$repo_name"
  exit 0
fi

cd "$MAIN_DIR"
mkdir -p "repo"

# Try cloning strategies; if repo already exists, skip
if [[ -d "$REPO_DIR" ]]; then
  echo "02: repo dir already exists: $REPO_DIR" >&2
else
  if git clone --recurse-submodules "$GITHUB_REPO_URL" "repo/$repo_name"; then
    echo "02: cloned with submodules" >&2
  else
    echo "02: main clone failed, trying --depth=1" >&2
    if git clone --depth=1 "$GITHUB_REPO_URL" "repo/$repo_name"; then
      echo "02: shallow clone ok" >&2
    else
      echo "02: shallow clone failed, trying plain clone" >&2
      git clone "$GITHUB_REPO_URL" "repo/$repo_name"
    fi
  fi
fi

# mark success
touch "$MARKER"

echo "repo/$repo_name"
