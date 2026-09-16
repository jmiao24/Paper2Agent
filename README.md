<p align="center">
  <img src="./logo/paper2agent_logo.png" alt="Paper2Agent Logo" width="600px" />
</p>

# Paper2Agent: Reimagining Papers As AI Agents

## 📖 Overview
`Paper2Agent` is a multi-agent AI system that automatically transforms research papers into interactive AI agents with minimal human input. Explore [demos](#-demos) of Paper2Agent-generated agents, or try it yourself at [paper2agent.ai](https://paper2agent.ai).

Paper2Agent coordinates parallel specialist agents to turn scientific papers into reliable MCP servers and skills.

## 🚀 Quick Start

### Basic Usage

The simplest way to use Paper2Agent is to ask your coding agent (Claude Code, Codex, etc.) to install the paper2agent skill, then agentify a paper alongside its code repository.

```text
Read https://github.com/jmiao24/Paper2Agent and install the paper2agent skill
from skills/paper2agent for this coding agent.

Use the paper2agent skill to agentify this paper and its associated files,
alongside its code repository if available. Follow the skill instructions
for the workflow, verification, and final delivery.

Paper and associated files: <PAPER_URL_OR_LOCAL_FILES>
Code repository (if available): <GITHUB_URL_OR_LOCAL_PATH>
Output directory: <PROJECT_DIR>
```

If the skill does not appear after installation, restart your coding agent. For manual installation, see [Installation & Setup](#installation).

See the [skill instructions](skills/paper2agent/SKILL.md) for supported inputs, workflows, and deliverables.

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

### Manual Installation Steps

To have your coding agent install the skill, use the [Quick Start](#-quick-start) prompt. To install it yourself, follow the steps below.

1. **Clone the Paper2Agent repository**

   ```bash
   git clone https://github.com/jmiao24/Paper2Agent.git
   cd Paper2Agent
   ```

2. **Install the entire skill folder for your host**

   Choose the command for your host. Copy the entire folder, including all subdirectories and supporting files.

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

