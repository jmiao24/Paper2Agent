#!/usr/bin/env bash
# Exercise the workspace and URL contract without launching Claude or contacting a server.
set -euo pipefail

script="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")/../scripts" && pwd -P)/connect_remote_mcp.sh"
fixture="$(mktemp -d)"
trap 'rm -rf -- "$fixture"' EXIT
fixture="$(cd -- "$fixture" && pwd -P)"
mkdir -p "$fixture/bin" "$fixture/start" "$fixture/elsewhere/default"
export PATH="$fixture/bin:$PATH"
export CLAUDE_TEST_LOG="$fixture/claude.log"

cat > "$fixture/bin/claude" <<'SHIM'
#!/usr/bin/env bash
printf '%s\n' "$PWD" "$@" >> "$CLAUDE_TEST_LOG"
SHIM
chmod +x "$fixture/bin/claude"
cd -- "$fixture/start"

check_registration() {
    local workspace="$1" expected="$2" endpoint="$3"
    : > "$CLAUDE_TEST_LOG"
    bash "$script" --working_dir "$workspace" --mcp_name example \
        --mcp_url "$endpoint" --no-launch > "$fixture/stdout"
    printf '%s\n' "$expected" mcp add --transport http example "$endpoint" > "$fixture/expected"
    diff -u "$fixture/expected" "$CLAUDE_TEST_LOG"
}

# A relative workspace always means a location under the caller, even with CDPATH set.
export CDPATH="$fixture/elsewhere"
check_registration default "$fixture/start/default" 'https://example.invalid/mcp?mode=a%20b&v=2'
check_registration - "$fixture/start/-" 'http://[::1]:8080'
check_registration "$fixture/absolute path" "$fixture/absolute path" 'https://example.invalid'

for endpoint in 'https:///mcp' 'https://?query' 'https://#fragment'; do
    : > "$CLAUDE_TEST_LOG"
    if bash "$script" --working_dir invalid --mcp_name example \
        --mcp_url "$endpoint" --no-launch > "$fixture/stdout" 2> "$fixture/stderr"; then
        printf 'Accepted an endpoint with no host: %s\n' "$endpoint" >&2
        exit 1
    fi
    grep -Fq 'complete HTTP or HTTPS endpoint' "$fixture/stderr"
    test ! -e invalid
    test ! -s "$CLAUDE_TEST_LOG"
done

echo 'Workspace resolution, valid endpoint passthrough, and missing-host rejection passed.'
