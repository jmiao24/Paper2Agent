#!/usr/bin/env bash
# Connect a remote MCP endpoint to Claude Code in an analysis workspace.
set -euo pipefail

usage() {
    cat <<'EOF'
Usage: connect_remote_mcp.sh --working_dir DIR --mcp_name NAME --mcp_url URL [OPTIONS]

Required:
  --working_dir DIR   Analysis workspace to create or reuse
  --mcp_name NAME     Name for the server in Claude Code
  --mcp_url URL       Complete MCP endpoint URL, including its required path

Options:
  --transport TYPE   http (default) or sse, as documented by the server
  --no-launch        Register the server without opening an interactive session
  -h, --help         Show this help

Example:
  bash scripts/connect_remote_mcp.sh \
    --working_dir ./analysis --mcp_name paper \
    --mcp_url https://example.com/mcp

Use the endpoint and authentication instructions provided by the hosted service.
The script preserves existing workspace files and passes the URL unchanged.
EOF
}

fail() {
    printf 'Error: %s\n' "$1" >&2
    exit 1
}

working_dir=''
mcp_name=''
mcp_url=''
transport='http'
launch=true

while (( $# )); do
    case "$1" in
        --working_dir|--mcp_name|--mcp_url|--transport)
            (( $# >= 2 )) || fail "$1 requires a value"
            [[ -n "$2" && "$2" != --* ]] || fail "$1 requires a value"
            case "$1" in
                --working_dir) working_dir="$2" ;;
                --mcp_name) mcp_name="$2" ;;
                --mcp_url) mcp_url="$2" ;;
                --transport) transport="$2" ;;
            esac
            shift 2
            ;;
        --no-launch) launch=false; shift ;;
        -h|--help) usage; exit 0 ;;
        *) fail "Unknown option; use --help for usage" ;;
    esac
done

[[ -n "$working_dir" ]] || fail '--working_dir is required'
[[ "$mcp_name" =~ ^[A-Za-z0-9][A-Za-z0-9_-]*$ ]] || fail '--mcp_name must start with a letter or digit and contain only letters, digits, underscores, or hyphens'
[[ "$mcp_url" =~ ^https?://[^[:space:]]+$ ]] || fail '--mcp_url must be a complete HTTP or HTTPS endpoint'
[[ "$transport" == http || "$transport" == sse ]] || fail '--transport must be http or sse'
command -v claude >/dev/null 2>&1 || fail 'Claude Code is not installed or not on PATH'

mkdir -p -- "$working_dir"
cd -- "$working_dir"
claude mcp add --transport "$transport" "$mcp_name" "$mcp_url"

if "$launch"; then
    exec claude
fi
