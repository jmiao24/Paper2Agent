#!/bin/bash

# ARTIFEX NERD SWARM - Automated Setup Script
# This script installs dependencies, builds the project, and configures Claude Desktop

set -e  # Exit on error

echo "🚀 ARTIFEX NERD SWARM - Setup Script"
echo "===================================="
echo ""

# Check Node.js version
echo "📋 Checking prerequisites..."
if ! command -v node &> /dev/null; then
    echo "❌ Error: Node.js is not installed."
    echo "   Please install Node.js >= 18 from https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Error: Node.js version must be >= 18 (you have v$NODE_VERSION)"
    echo "   Please upgrade Node.js from https://nodejs.org/"
    exit 1
fi

echo "✅ Node.js v$(node -v) detected"

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Build project
echo ""
echo "🔨 Building TypeScript project..."
npm run build

echo ""
echo "✅ Build successful!"

# Detect OS and Claude Desktop config path
echo ""
echo "🔍 Detecting Claude Desktop configuration..."

CONFIG_PATH=""
if [[ "$OSTYPE" == "darwin"* ]]; then
    # macOS
    CONFIG_PATH="$HOME/Library/Application Support/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    # Linux
    CONFIG_PATH="$HOME/.config/Claude/claude_desktop_config.json"
elif [[ "$OSTYPE" == "msys" ]] || [[ "$OSTYPE" == "win32" ]]; then
    # Windows (Git Bash)
    CONFIG_PATH="$APPDATA/Claude/claude_desktop_config.json"
else
    echo "⚠️  Unknown OS: $OSTYPE"
fi

# Get absolute path to index.js
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" &> /dev/null && pwd )"
INDEX_PATH="$SCRIPT_DIR/dist/index.js"

echo "📁 MCP Server path: $INDEX_PATH"

# Offer to configure Claude Desktop
if [ -n "$CONFIG_PATH" ]; then
    echo ""
    echo "🔧 Claude Desktop Configuration"
    echo "--------------------------------"
    echo "Config file: $CONFIG_PATH"
    echo ""

    if [ -f "$CONFIG_PATH" ]; then
        echo "⚠️  Claude Desktop config already exists."
        echo ""
        read -p "Do you want to add ARTIFEX NERD SWARM to your config? (y/n) " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            # Backup existing config
            cp "$CONFIG_PATH" "$CONFIG_PATH.backup"
            echo "✅ Backed up existing config to: $CONFIG_PATH.backup"

            # Read existing config
            EXISTING_CONFIG=$(cat "$CONFIG_PATH")

            # Check if mcpServers key exists
            if echo "$EXISTING_CONFIG" | grep -q '"mcpServers"'; then
                echo "📝 Adding ARTIFEX NERD SWARM to existing mcpServers..."

                # Use Python to merge JSON (more reliable than jq)
                python3 <<EOF
import json
import sys

try:
    with open('$CONFIG_PATH', 'r') as f:
        config = json.load(f)

    if 'mcpServers' not in config:
        config['mcpServers'] = {}

    config['mcpServers']['artifex-nerd-swarm'] = {
        'command': 'node',
        'args': ['$INDEX_PATH'],
        'env': {}
    }

    with open('$CONFIG_PATH', 'w') as f:
        json.dump(config, f, indent=2)

    print('✅ Successfully added ARTIFEX NERD SWARM to config')
except Exception as e:
    print(f'❌ Error updating config: {e}', file=sys.stderr)
    sys.exit(1)
EOF
            else
                echo "📝 Creating mcpServers section..."
                echo '{
  "mcpServers": {
    "artifex-nerd-swarm": {
      "command": "node",
      "args": ["'$INDEX_PATH'"],
      "env": {}
    }
  }
}' > "$CONFIG_PATH"
                echo "✅ Created new config with ARTIFEX NERD SWARM"
            fi
        fi
    else
        echo "📝 Claude Desktop config not found. Creating new config..."

        # Create directory if it doesn't exist
        mkdir -p "$(dirname "$CONFIG_PATH")"

        # Create new config
        echo '{
  "mcpServers": {
    "artifex-nerd-swarm": {
      "command": "node",
      "args": ["'$INDEX_PATH'"],
      "env": {}
    }
  }
}' > "$CONFIG_PATH"
        echo "✅ Created config at: $CONFIG_PATH"
    fi
else
    echo "⚠️  Could not automatically detect Claude Desktop config path."
    echo ""
    echo "Please manually add this to your Claude Desktop config:"
    echo ""
    echo '{'
    echo '  "mcpServers": {'
    echo '    "artifex-nerd-swarm": {'
    echo '      "command": "node",'
    echo '      "args": ["'$INDEX_PATH'"],'
    echo '      "env": {}'
    echo '    }'
    echo '  }'
    echo '}'
fi

# Final instructions
echo ""
echo "🎉 Setup Complete!"
echo "=================="
echo ""
echo "Next Steps:"
echo "1. Restart Claude Desktop"
echo "2. Look for the 🔌 MCP indicator showing 'artifex-nerd-swarm' connected"
echo "3. Try a command like: 'Use generate_rubric to create an evaluation rubric'"
echo ""
echo "📚 Documentation:"
echo "   - Quick Start: ../QUICK_START.md"
echo "   - Architecture: ../ARTIFEX_NERD_SWARM_ARCHITECTURE.md"
echo ""
echo "🐛 Troubleshooting:"
echo "   - Verify build: ls $INDEX_PATH"
echo "   - Check config: cat $CONFIG_PATH"
echo "   - Test server: echo '{\"jsonrpc\":\"2.0\",\"id\":1,\"method\":\"tools/list\"}' | node $INDEX_PATH"
echo ""
echo "Happy researching! 🚀"
