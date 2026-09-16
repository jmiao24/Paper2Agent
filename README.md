<p align="center">
  <img src="./logo/paper2agent_logo.png" alt="Paper2Agent Logo" width="600px" />
</p>

# Paper2Agent: Reimagining Papers As AI Agents

## 📖 Overview
`Paper2Agent` is a multi-agent AI system that automatically transforms research papers into interactive AI agents with minimal human input. Explore [demos](#-demos) of Paper2Agent-generated agents, or try it yourself at [paper2agent.ai](https://paper2agent.ai).

Paper2Agent coordinates parallel specialist agents to turn scientific papers into reliable MCP servers or skills.

## 🚀 Quick Start

### Basic Usage

Install the [paper2agent skill](#installation), then ask your coding agent to agentify a paper.

**Claude Code:**

```text
/paper2agent Convert <GITHUB_URL> into tested MCP tools in <PROJECT_DIR>.
```

**Codex:**

```text
$paper2agent Convert <GITHUB_URL> into tested MCP tools in <PROJECT_DIR>.
```

The skill selects useful operations from the repository's APIs, tutorials, examples, and tests. A completed conversion delivers `dist/<repo-name>-mcp.zip` with installation and usage instructions. Processing time and cost depend on the selected scope, dependencies, hardware, and coding-agent model.

### Advanced Usage

#### Targeted Tasks or Tutorials

Specify the scientific tasks, tutorial title, or source URL to focus on:

```text
Use the paper2agent skill to convert <GITHUB_URL> into MCP tools in <PROJECT_DIR>.
Focus on <TASKS, TUTORIAL_TITLE, or SOURCE_URL>.
```

#### Repository with API Key

Make credentials available through your host's secret mechanism or process environment, then tell the agent the variable name:

```text
Use the paper2agent skill to convert <GITHUB_URL> into MCP tools in <PROJECT_DIR>.
Read the required API key from the environment variable <VARIABLE_NAME>.
```

Credentials stay outside generated code, notebooks, reports, and the delivered ZIP.

### Inputs

| Input | Description |
| --- | --- |
| Repository | GitHub URL or local checkout to convert |
| Project directory | Where to save the generated server and working artifacts |
| Scope (optional) | Scientific tasks, tutorial titles, or source URLs to prioritize |
| Constraints (optional) | Hardware, time, data availability, and runtime credential variable names |

Request [optional extensions](skills/paper2agent/references/extensions.md), such as user-query evaluation or remote deployment, when needed.

### Examples

The examples below use Claude Code's `/paper2agent` invocation. In Codex, replace it with `$paper2agent`.

#### TISSUE Agent

Create an AI agent from the [TISSUE](https://github.com/sunericd/TISSUE) research paper codebase for uncertainty-calibrated single-cell spatial transcriptomics analysis:

```text
/paper2agent Convert https://github.com/sunericd/TISSUE into tested MCP tools in TISSUE_Agent.
```

#### Scanpy Agent for Preprocessing and Clustering

Create an AI agent from the [Scanpy](https://github.com/scverse/scanpy) research paper codebase for single-cell analysis preprocessing and clustering:

```text
/paper2agent Convert https://github.com/scverse/scanpy into tested MCP tools in Scanpy_Agent.
Focus on the "Preprocessing and clustering" tutorial.
```

You can also provide a tutorial URL:

```text
/paper2agent Convert https://github.com/scverse/scanpy into tested MCP tools in Scanpy_Agent.
Focus on https://github.com/scverse/scanpy/blob/main/docs/tutorials/basics/clustering.ipynb.
```

#### AlphaGenome Agent

Create an AI agent from the [AlphaGenome](https://github.com/google-deepmind/alphagenome) research paper codebase for genomic data interpretation:

```text
/paper2agent Convert https://github.com/google-deepmind/alphagenome into tested MCP tools in AlphaGenome_Agent.
Read the API key from the environment variable ALPHAGENOME_API_KEY.
```

<a id="installation"></a>

## ⚙️ Installation & Setup

### Prerequisites

- **Coding-agent host:** A host with skill support, shell access, and parallel subagent spawning enabled. The coordinator launches specialists and fresh verifier agents through the host.
- **Runtime access:** Python and Git, plus any R, native CLI, data, API, or GPU requirements of the selected repository. The skill prepares isolated project environments and records tested versions.

### Installation Steps

1. **Clone the Paper2Agent repository**

   ```bash
   git clone https://github.com/jmiao24/Paper2Agent.git
   cd Paper2Agent
   ```

2. **Install the entire skill folder for your host**

   Choose the command for your host. Include `references/`, `scripts/`, and `agents/` along with `SKILL.md`.

   **Claude Code** — personal skill location from the [Claude Code skills documentation](https://code.claude.com/docs/en/skills):

   ```bash
   mkdir -p "$HOME/.claude/skills/paper2agent"
   cp -R skills/paper2agent/. "$HOME/.claude/skills/paper2agent/"
   ```

   **Codex** — personal skill location from the [official OpenAI skills documentation](https://learn.chatgpt.com/docs/build-skills):

   ```bash
   mkdir -p "$HOME/.agents/skills/paper2agent"
   cp -R skills/paper2agent/. "$HOME/.agents/skills/paper2agent/"
   ```

3. **Start your coding agent in your analysis workspace**

   Open Claude Code or Codex in the directory where you want to work, then use the [Quick Start](#-quick-start) prompt. If the skill does not appear, restart the coding agent. The skill installs the generated server's dependencies in its project environment during conversion.

### Multi-agent Workflow

1. Prepare the environment and select tools concurrently.
2. Run selected upstream sources in parallel to obtain reference results.
3. Implement minimal wrappers in parallel, then launch fresh, separate agents to verify them.
4. Integrate the verified tools into an MCP server and exercise real MCP calls.
5. Install and validate the server in a fresh runtime environment.
6. Package the server and have an independent verifier check installation and tool calls from the extracted ZIP.

See the [skill](skills/paper2agent/SKILL.md) and [orchestration instructions](skills/paper2agent/references/orchestration.md) for the workflow and resume behavior.

## 🤖 How to Create a Paper Agent?

Connect the generated Paper MCP server to an AI coding agent, such as [Claude Code](https://www.anthropic.com/claude-code), Codex, or the [Google Gemini CLI](https://google-gemini.github.io/gemini-cli/), to use its scientific tools in conversation.

### Connect a Generated Local MCP Server

Extract the delivered ZIP and follow its `USAGE.md` to install dependencies and configure your MCP client. The instructions include the tested interpreter, server entry point, required environment variables, and supported platforms.

To have the coding agent configure the connection, explicitly request it after conversion:

```text
Connect the generated MCP server to my coding-agent client using its USAGE.md.
```

### Connect a Remote MCP Server Hosted on Hugging Face

You can also use an existing server from [Connectable Paper MCP Servers](#-connectable-paper-mcp-servers). Open the hosted service's instructions for its MCP endpoint, transport, and authentication requirements.

For an HTTP endpoint in Claude Code, follow the [MCP connection documentation](https://code.claude.com/docs/en/mcp):

```bash
claude mcp add --transport http <MCP_NAME> <MCP_ENDPOINT_URL>
```

For example, the [hosted AlphaGenome MCP server](https://Paper2Agent-alphagenome-mcp.hf.space) can provide tools for genomic data interpretation. Once connected, you can input a query like:

```text
Analyze heart gene expression data with AlphaGenome MCP to identify the causal gene
for the variant chr11:116837649:T>G, associated with Hypoalphalipoproteinemia.
```

### Verification

In Claude Code, check the server's connection status with:

```bash
claude mcp list
```

Or use `/mcp` inside Claude Code. A successful connection should appear in the server list; use a tool call to confirm the scientific workflow works with your inputs. The screenshot below illustrates the original demo connection.

<img width="620" height="247" alt="Screenshot 2025-09-15 at 10 36 00 PM" src="https://github.com/user-attachments/assets/e9bc771f-d223-477c-953b-f30220e37633" />

## 📁 Output Structure

The final deliverable is **`<project_dir>/dist/<repo-name>-mcp.zip`**. It contains one server project:

```text
<repo-name>-mcp/
├── USAGE.md                     # Installation, startup, client setup, and tool reference
├── src/
│   ├── <repo_name>_mcp.py        # MCP server entry point
│   ├── requirements.txt         # Pinned Python runtime dependencies
│   └── tools/                   # Verified tool modules and runtime helpers
└── ...                          # Required source/native runtime, licenses, and route-specific files
```

Exact runtime files depend on the repository. Required scientific code is included or installed from a documented, tested version. R and CLI projects include their runtime restoration or installation instructions. Any external data, models, credentials, or hardware requirements are documented in `USAGE.md`.

### Key Output Files and Directories

Intermediate artifacts remain in the working project for inspection and resuming work:

| File/Directory | Description |
| --- | --- |
| `dist/<repo-name>-mcp.zip` | Validated MCP server package to download and use |
| `src/` | Generated server, tool modules, and runtime requirements |
| `repo/<repo_name>/` | Original research repository |
| `<repo_name>-env/` | Isolated Python environment used during conversion |
| `reports/` | Selection decisions, source provenance, agent records, and validation results |
| `reports/delivery-validation.json` | Validation of the exact ZIP after extraction at a new location |
| `tests/` | Scientific checks, fixtures, results, and logs |
| `notebooks/` | Notebook execution evidence when relevant |
| `.pipeline/` | Workflow state and completion markers |

The default ZIP contains runtime files and usage instructions. Development artifacts and examples stay in the workspace. Validation covers the delivered tools and documented conditions. See the [output contract](skills/paper2agent/references/output-delivery.md) for packaging and delivery requirements.

## 🎬 Demos
Below, we showcase demos of AI agents created by Paper2Agent, illustrating how each agent applies the tools from its source paper to tackle scientific tasks.
### 🧬 AlphaGenome Agent for Genomic Data Interpretation
Example query:
```
Analyze heart gene expression data with AlphaGenome MCP to identify the causal gene
for the variant chr11:116837649:T>G, associated with Hypoalphalipoproteinemia.
```

https://github.com/user-attachments/assets/34aad25b-42b3-4feb-b418-db31066e7f7b

### 🗺️ TISSUE Agent for Uncertainty-Aware Spatial Transcriptomics Analysis
Example query:
```
Calculate the 95% prediction interval for the spatial gene expression prediction of gene Acta2 using TISSUE MCP.

This is my data:
Spatial count matrix: Spatial_count.txt
Spatial locations: Locations.txt
scRNA-seq count matrix: scRNA_count.txt
```

https://github.com/user-attachments/assets/2c8f6368-fa99-4e6e-b7b5-acc12f741655

### 🧫 Scanpy Agent for Single-Cell Data Preprocessing
Example query:
```
Use Scanpy MCP to preprocess and cluster the single-cell dataset pbmc_all.h5ad.
```

## 🔗 Connectable Paper MCP Servers
* AlphaGenome: https://Paper2Agent-alphagenome-mcp.hf.space
* Scanpy: https://Paper2Agent-scanpy-mcp.hf.space
* TISSUE: https://Paper2Agent-tissue-mcp.hf.space

## 📊 Benchmarking for Paper2Agent
For comprehensive benchmarking results and evaluation metrics of Paper2Agent, please refer to our dedicated benchmarking repository: [Paper2AgentBench](https://github.com/jmiao24/Paper2AgentBench).
## 📚 Citation
```
@misc{miao2025paper2agent,
      title={Paper2Agent: Reimagining Research Papers As Interactive and Reliable AI Agents}, 
      author={Jiacheng Miao and Joe R. Davis and Jonathan K. Pritchard and James Zou},
      year={2025},
      eprint={2509.06917},
      archivePrefix={arXiv},
      primaryClass={cs.AI},
      url={https://arxiv.org/abs/2509.06917}, 
}
```

