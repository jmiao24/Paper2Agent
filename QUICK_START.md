# ARTIFEX NERD SWARM - Quick Start Guide

## 🎯 Overview

The ARTIFEX NERD SWARM is a Model Context Protocol (MCP) server providing 11 specialized AI agents for research operations. This guide shows you how to install, run, and use the system.

---

## 📋 Prerequisites

- **Node.js** >= 18.x ([Download](https://nodejs.org/))
- **npm** >= 9.x (comes with Node.js)
- **Git** (for cloning the repository)
- **Claude Desktop** (recommended) or any MCP-compatible client

**Optional (for specific agents):**
- Python 3.8+ (for running generated notebooks)
- Google Colab account (for interactive notebooks)

---

## 🔧 Installation

### Step 1: Clone the Repository

```bash
git clone https://github.com/Tuesdaythe13th/Paper2Agent.git
cd Paper2Agent/mcp-server
```

### Step 2: Install Dependencies

```bash
npm install
```

This installs the MCP SDK and TypeScript dependencies.

### Step 3: Build the Project

```bash
npm run build
```

This compiles TypeScript to JavaScript in the `dist/` directory.

---

## 🚀 Running the MCP Server

### Option 1: Run with Claude Desktop (Recommended)

#### 1. Locate Claude Desktop Config

**macOS:**
```bash
~/Library/Application Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
%APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
~/.config/Claude/claude_desktop_config.json
```

#### 2. Edit the Config File

Add the ARTIFEX NERD SWARM server to your MCP servers:

```json
{
  "mcpServers": {
    "artifex-nerd-swarm": {
      "command": "node",
      "args": ["/absolute/path/to/Paper2Agent/mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

**Important:** Replace `/absolute/path/to/Paper2Agent` with your actual path!

**Example (macOS/Linux):**
```json
{
  "mcpServers": {
    "artifex-nerd-swarm": {
      "command": "node",
      "args": ["/home/user/Paper2Agent/mcp-server/dist/index.js"],
      "env": {}
    }
  }
}
```

**Example (Windows):**
```json
{
  "mcpServers": {
    "artifex-nerd-swarm": {
      "command": "node",
      "args": ["C:\\Users\\YourName\\Paper2Agent\\mcp-server\\dist\\index.js"],
      "env": {}
    }
  }
}
```

#### 3. Restart Claude Desktop

Quit and reopen Claude Desktop. The MCP server will start automatically.

#### 4. Verify Connection

In Claude Desktop, you should see a 🔌 icon or MCP indicator showing "artifex-nerd-swarm" is connected.

---

### Option 2: Run Standalone (for Testing)

You can run the server directly from the command line:

```bash
cd /path/to/Paper2Agent/mcp-server
node dist/index.js
```

The server runs on **stdio** (standard input/output), waiting for JSON-RPC 2.0 messages.

To test manually, you can send JSON-RPC requests:

```bash
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | node dist/index.js
```

---

## 🎨 Using the Agents

### Available Tools (14 total)

Once connected to Claude Desktop, you can use these MCP tools:

| Tool Name | Agent | Purpose |
|-----------|-------|---------|
| `create_paper_agent` | Infrastructure | Create Paper2Agent from GitHub repo |
| `get_pipeline_status` | Infrastructure | Check pipeline progress |
| `generate_rubric` | LLM-Rubric Architect | Generate evaluation rubrics |
| `design_experiment` | Experimental Designer | Design research methodology |
| `analyze_budget` | Budget Agent | Budget analysis (grant/investor) |
| `generate_comptroller_notebook` | The Comptroller | Financial operations dashboard |
| `generate_administrator_notebook` | The Administrator | Organizational governance |
| `generate_mlflow_query_plan` | MLflow MCP Agent | Experiment tracking queries |
| `generate_dataset_builder_plan` | Dataset Builder | Training data construction |
| `generate_ciso_notebook` | The CISO | Security operations (STRIDE, incident response) |
| `analyze_swarm_and_suggest` | The Orchestrator | Swarm optimization & ADK workflows |
| `create_design_system` | The Creative Director | Brand/design system generation |
| `visualize_dataset` | The Visual Inspector | FiftyOne dataset visualization |
| `analyze_transcript` | The Forensic Analyst | Neural forensics with DSMMD taxonomy |

---

## 📝 Example Usage

### Example 1: Generate an Evaluation Rubric

**In Claude Desktop:**

```
Use the generate_rubric tool to create an evaluation rubric for:
- Task: Binary classification of medical images
- Domain: Radiology (chest X-rays)
- Metrics: Sensitivity, specificity, AUC-ROC
- Criteria: Clinical accuracy, fairness across demographics
```

**Output:** Google Colab notebook with evaluation framework

---

### Example 2: Design an Experiment

**In Claude Desktop:**

```
Use the design_experiment tool to design a study on:
- Research question: Does data augmentation improve model robustness?
- Hypothesis: Augmented models will have 10% higher accuracy on corrupted images
- Dataset: CIFAR-10
- Methods: Train with/without augmentation, test on CIFAR-10-C
```

**Output:** Detailed experimental design with controls, variables, validation strategy

---

### Example 3: Visualize Dataset Quality

**In Claude Desktop:**

```
Use the visualize_dataset tool with:
- mode: quality_check
- dataset: FiftyOne Zoo "quickstart" dataset
- brain method: mistakenness
- Check for label mistakes using model predictions
```

**Output:**
- Interactive FiftyOne notebook
- List of likely mislabeled samples
- Quality score: 85% compliance
- Recommendations: Fix 15 high-mistakenness samples

---

### Example 4: Create a Design System

**In Claude Desktop:**

```
Use the create_design_system tool with:
- Project: ARTIFEX NERD SWARM Dashboard
- Aesthetic: functional_brutalist
- Modules: style_engine, interface_architect
- Components: dashboard, card
- Accessibility: WCAG_AA
```

**Output:**
- Color palette (Brutalist: Black/White/Green)
- Typography system (IBM Plex Mono)
- CSS framework with custom properties
- React/HTML components for dashboard and cards

---

### Example 5: Security Review (CISO)

**In Claude Desktop:**

```
Use the generate_ciso_notebook tool to:
- Model threat scenarios: nation_state, ransomware_gang
- High-value assets: Patient health records, ML model weights
- Attack surfaces: Web API, Database, File storage
- Operational mode: offensive (red team simulation)
```

**Output:**
- Google Colab notebook with 4 blocks:
  1. STRIDE threat modeling
  2. Incident response protocols
  3. Cryptography & secrets management
  4. Social engineering defense

---

### Example 6: Forensic Transcript Analysis

**In Claude Desktop:**

```
Use the analyze_transcript tool with:
- transcript source: inline
- content: [Your LLM conversation transcript]
- specimen_name: "Sediment/Juno"
- model_family: "GPT-4o"
- Enable all DSMMD detectors (110.1, 140.1, 140.3, 155.2, SB-1)
```

**Output:**
- Google Colab notebook with forensic analysis
- ASCII report with DSMMD summary:
  - 110.1: Confabulated Authority (impossible tool claims)
  - 140.1: Metadata Leakage (serialization artifacts)
  - 140.3: Genre Rupture (narrative frame breaks)
  - 155.2: Context Collapse (evaluation awareness)
  - SB-1: Split-Brain Dissociation (behavior/explanation decoupling)
- Interactive timeline visualization
- Forensic verdict with evidence grade (E1-E4)
- Recommendations for mechanistic investigation

---

## 🧪 Testing Individual Agents

### Quick Test Script

Create a test file `test-agent.mjs`:

```javascript
import { generateRubricArtifacts } from './dist/rubric-architect.js';

const request = {
  taskDescription: "Evaluate sentiment analysis models",
  evaluationDomain: "Natural Language Processing",
  performanceMetrics: ["Accuracy", "F1-score", "Precision", "Recall"],
  qualityCriteria: ["Robustness to typos", "Multilingual support"]
};

const output = generateRubricArtifacts(request);
console.log(JSON.stringify(output, null, 2));
```

Run it:

```bash
node test-agent.mjs
```

---

## 🐛 Troubleshooting

### Problem: "MCP server not connecting"

**Solution:**
1. Check the config path is absolute (not relative)
2. Verify `dist/index.js` exists: `ls dist/index.js`
3. Check Node.js version: `node --version` (should be ≥18)
4. Restart Claude Desktop completely

### Problem: "Module not found" errors

**Solution:**
```bash
cd mcp-server
npm install
npm run build
```

### Problem: "TypeError: Cannot read property..."

**Solution:** You may have old build artifacts. Clean and rebuild:

```bash
rm -rf dist/
npm run build
```

### Problem: "JSON-RPC parse error"

**Solution:** The MCP client is sending malformed requests. Check your Claude Desktop config JSON syntax.

---

## 📚 Advanced Usage

### Running Multiple Agents in a Workflow

Example: **Budget-Constrained Experiment Design**

```
1. Use design_experiment to create initial methodology
2. Use analyze_budget to estimate costs
3. If over budget:
   - Use design_experiment again with cost constraints
   - Repeat until budget satisfied
4. Use generate_ciso_notebook to check security implications
5. Use create_design_system to format final report
```

This demonstrates ADK **LoopAgent** pattern (iterative refinement).

---

### Generating Notebooks for Google Colab

Most agents return notebooks in their output. To use them:

1. **Copy the notebook JSON** from the agent output
2. **Create a new file** `notebook.ipynb`
3. **Paste the JSON** into the file
4. **Upload to Google Colab:**
   - Go to https://colab.research.google.com
   - File → Upload notebook
   - Select your `notebook.ipynb`
5. **Run the cells** interactively

---

### Using with Other MCP Clients

The server follows the **MCP specification**, so it works with any MCP client:

**Example: MCP Inspector (Testing Tool)**

```bash
npm install -g @modelcontextprotocol/inspector

mcp-inspector node /path/to/Paper2Agent/mcp-server/dist/index.js
```

This opens a web UI to test tools interactively.

---

## 📖 Documentation

- **Full Architecture:** See `ARTIFEX_NERD_SWARM_ARCHITECTURE.md`
- **Agent Capabilities:** See agent-specific type files in `src/`
- **MCP Protocol:** https://modelcontextprotocol.io/docs
- **ADK Framework:** https://github.com/google/adk

---

## 🔄 Development Workflow

### Making Changes to Agents

1. **Edit TypeScript source:**
   ```bash
   cd mcp-server/src
   vim creative-director.ts  # or your editor
   ```

2. **Rebuild:**
   ```bash
   npm run build
   ```

3. **Restart Claude Desktop** to reload the MCP server

### Adding a New Agent

1. **Create type definitions:** `src/my-agent-types.ts`
2. **Create implementation:** `src/my-agent.ts`
3. **Export AgentCard:** `export const MY_AGENT_CARD: AgentCard = {...}`
4. **Add to index.ts:**
   - Import: `import { generateMyAgentOutput, MY_AGENT_CARD } from './my-agent.js';`
   - Add tool definition to `tools` array
   - Add handler in `switch (name)` statement
5. **Rebuild:** `npm run build`

---

## 🎯 Quick Start Checklist

- [ ] Install Node.js ≥18
- [ ] Clone repository
- [ ] `npm install` in `mcp-server/`
- [ ] `npm run build`
- [ ] Edit Claude Desktop config with absolute path
- [ ] Restart Claude Desktop
- [ ] Verify MCP connection (🔌 icon)
- [ ] Test with: "Use generate_rubric to create an evaluation rubric"
- [ ] Open generated notebook in Google Colab

---

## 📞 Support

**Issues:** https://github.com/Tuesdaythe13th/Paper2Agent/issues

**MCP Documentation:** https://modelcontextprotocol.io

**FiftyOne (Visual Inspector):** https://voxel51.com/docs/fiftyone

---

**Happy researching with ARTIFEX NERD SWARM! 🚀**
