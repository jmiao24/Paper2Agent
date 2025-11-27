# Paper2Agent MCP Server

TypeScript Model Context Protocol server for creating and managing Paper2Agent instances programmatically.

## Features

- **Create Paper Agents**: Transform research repositories into AI agents
- **Monitor Progress**: Track pipeline status in real-time
- **Manage Agents**: List and inspect all created agents
- **Launch Agents**: Start Paper Agents in Claude Code

## Installation

```bash
cd mcp-server
npm install
npm run build
```

## Usage

### As an MCP Server

Add to your Claude Code MCP configuration (`~/.claude/mcp.json`):

```json
{
  "mcpServers": {
    "paper2agent": {
      "command": "node",
      "args": ["/home/user/Paper2Agent/mcp-server/dist/index.js"]
    }
  }
}
```

### Development Mode

```bash
npm run dev
```

### Build

```bash
npm run build
```

## Available Tools

### `create_paper_agent`

Create a new Paper2Agent from a research repository.

**Parameters:**
- `project_dir` (required): Name of the project directory (e.g., "TISSUE_Agent")
- `github_url` (required): GitHub repository URL
- `tutorials` (optional): Filter tutorials by title or URL
- `api_key` (optional): API key for private repositories

**Example:**
```typescript
{
  "project_dir": "TISSUE_Agent",
  "github_url": "https://github.com/sunericd/TISSUE"
}
```

### `get_pipeline_status`

Get the current status of a Paper2Agent pipeline.

**Parameters:**
- `project_dir` (required): Project directory name

**Returns:** Pipeline status with completion percentage and step details

### `list_paper_agents`

List all Paper2Agent projects.

**Returns:** Array of agent information including status and tool counts

### `get_agent_info`

Get detailed information about a specific Paper2Agent.

**Parameters:**
- `project_dir` (required): Project directory name

**Returns:** Detailed agent information including MCP server path, tools count, etc.

### `launch_agent`

Launch a Paper2Agent in Claude Code.

**Parameters:**
- `project_dir` (required): Project directory name

## Example Workflow

```typescript
// 1. Create a new agent
create_paper_agent({
  project_dir: "Scanpy_Agent",
  github_url: "https://github.com/scverse/scanpy",
  tutorials: "Preprocessing and clustering"
})

// 2. Check status
get_pipeline_status({ project_dir: "Scanpy_Agent" })

// 3. List all agents
list_paper_agents()

// 4. Get detailed info
get_agent_info({ project_dir: "Scanpy_Agent" })

// 5. Launch when ready
launch_agent({ project_dir: "Scanpy_Agent" })
```

## Architecture

```
mcp-server/
├── src/
│   ├── index.ts      # Main MCP server
│   ├── types.ts      # TypeScript interfaces
│   └── utils.ts      # Utility functions
├── package.json
├── tsconfig.json
└── README.md
```

## Development

The server uses the Model Context Protocol SDK to expose Paper2Agent functionality as MCP tools. Each tool corresponds to a specific Paper2Agent operation.

### Adding New Tools

1. Define the tool in `tools` array in `index.ts`
2. Add the handler in the switch statement
3. Create any necessary utility functions in `utils.ts`
4. Update TypeScript types in `types.ts`

## License

MIT
