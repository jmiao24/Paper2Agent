#!/bin/bash
set -e

echo "Installing Paper2Agent MCP Server..."

# Get the directory where this script is located
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

# Install dependencies
echo "Installing npm dependencies..."
cd "$SCRIPT_DIR"
npm install

# Build the TypeScript
echo "Building TypeScript..."
npm run build

# Create or update Claude Code MCP configuration
MCP_CONFIG_DIR="$HOME/.claude"
MCP_CONFIG_FILE="$MCP_CONFIG_DIR/mcp.json"

echo "Configuring Claude Code MCP..."

# Create .claude directory if it doesn't exist
mkdir -p "$MCP_CONFIG_DIR"

# Check if mcp.json exists
if [ -f "$MCP_CONFIG_FILE" ]; then
  echo "Found existing MCP configuration at $MCP_CONFIG_FILE"
  echo "Please manually add the following to your mcp.json:"
  echo ""
  cat mcp-config.json
  echo ""
  echo "Or replace your mcp.json with the one above if you don't have other MCP servers configured."
else
  echo "Creating new MCP configuration..."
  cp mcp-config.json "$MCP_CONFIG_FILE"
  echo "Created $MCP_CONFIG_FILE"
fi

echo ""
echo "✅ Installation complete!"
echo ""
echo "To use Paper2Agent MCP:"
echo "1. Restart Claude Code if it's running"
echo "2. Use the 'list_paper_agents', 'create_paper_agent', and other tools"
echo ""
echo "Available tools:"
echo "  - create_paper_agent: Create a new Paper Agent from a repo"
echo "  - get_pipeline_status: Check pipeline progress"
echo "  - list_paper_agents: List all agents"
echo "  - get_agent_info: Get detailed agent info"
echo "  - launch_agent: Launch an agent in Claude Code"
echo ""
