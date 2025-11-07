<p align="center">
  <img src="./logo/paper2agent_logo.png" alt="Paper2Agent Logo" width="600px" />
</p>

# Paper2Agent: Reimagining Papers As AI Agents

## 📖 Overview
`Paper2Agent` is a multi-agent AI system that automatically transforms research papers into interactive AI agents with minimal human input. Here are some [Demos](#-demos) of the Paper2Agent-generated agent.

## 🚀 Quick Start 

### Basic Usage
Automatically detects and runs all relevant tutorials from a research paper’s codebase.

> **⚠️ Prerequisites**: Complete the [installation & setup](#️-installation--setup) below before running Paper2Agent.
>
> **⏱️ Runtime & Cost**: Processing time varies from 30 minutes to 3+ hours based on codebase complexity. Estimated cost: ~$15 for complex repositories like AlphaGenome using Claude Sonnet 4 (one-time cost).

```bash
cd Paper2Agent

bash Paper2Agent.sh \
  --project_dir <PROJECT_DIR> \
  --github_url <GITHUB_URL>
```

### Advanced Usage

#### Targeted Tutorial Processing
Process only specific tutorials by title or URL:

```bash
bash Paper2Agent.sh \
  --project_dir <PROJECT_DIR> \
  --github_url <GITHUB_URL> \
  --tutorials <TUTORIALS_URL or TUTORIALS_TITLE>
```

#### Repository with API Key
For repositories requiring authentication:

```bash
bash Paper2Agent.sh \
  --project_dir <PROJECT_DIR> \
  --github_url <GITHUB_URL> \
  --api <API_KEY>
```

### Parameters

**Required:**
- `--project_dir <directory>`: Name of the project directory to create
  - Example: `TISSUE_Agent`
- `--github_url <url>`: GitHub repository URL to analyze
  - Example: `https://github.com/sunericd/TISSUE`

**Optional:**
- `--tutorials <filter>`: Filter tutorials by title or URL
  - Example: `"Preprocessing and clustering"` or tutorial URL
- `--api <key>`: API key for repositories requiring authentication
  - Example: `your_api_key_here`

### Examples

#### TISSUE Agent
Create an AI agent from the [TISSUE](https://github.com/sunericd/TISSUE) research paper codebase for uncertainty-calibrated single-cell spatial transcriptomics analysis:

```bash
bash Paper2Agent.sh \
  --project_dir TISSUE_Agent \
  --github_url https://github.com/sunericd/TISSUE
```

#### Scanpy Agent for Preprocessing and Clustering
Create an AI agent from the [Scanpy](https://github.com/scverse/scanpy) research paper codebase for single-cell analysis preprocessing and clustering:

```bash
# Filter by tutorial title
bash Paper2Agent.sh \
  --project_dir Scanpy_Agent \
  --github_url https://github.com/scverse/scanpy \
  --tutorials "Preprocessing and clustering"

# Filter by tutorial URL
bash Paper2Agent.sh \
  --project_dir Scanpy_Agent \
  --github_url https://github.com/scverse/scanpy \
  --tutorials "https://github.com/scverse/scanpy/blob/main/docs/tutorials/basics/clustering.ipynb"
```

#### AlphaGenome Agent
Create an AI agent from the [AlphaGenome](https://github.com/google-deepmind/alphagenome) research paper codebase for genomic data interpretation:

```bash
bash Paper2Agent.sh \
  --project_dir AlphaGenome_Agent \
  --github_url https://github.com/google-deepmind/alphagenome \
  --api <ALPHAGENOME_API_KEY>
```

## ⚙️ Installation & Setup

### Prerequisites
- **Python**: Version 3.10 or higher
- **Claude Code**: Install following instructions at [anthropic.com/claude-code](https://www.anthropic.com/claude-code)

### Installation Steps
1. **Clone the Paper2Agent Repository**
   ```bash
   git clone https://github.com/jmiao24/Paper2Agent.git
   cd Paper2Agent
   ```

2. **Install Python Dependencies**
   ```bash
   pip install fastmcp
   ```

3. **Install and Configure Claude Code**
   ```bash
   npm install -g @anthropic-ai/claude-code
   claude
   ```

## 🤖 How to Create a Paper Agent?
To streamline usage, we recommend creating Paper Agents by connecting Paper MCP servers to an AI coding agent, such as [Claude Code](https://www.anthropic.com/claude-code) or the [Google Gemini CLI](https://google-gemini.github.io/gemini-cli/) (it's free with a Google account!).
We are also actively developing our own base agent, which will be released soon.

### Automatic Launch
After pipeline completion, Claude Code will automatically open with your new MCP server loaded.

### Manual Launch with Local MCP Server
To restart your agent later:
```bash
cd <working_dir>
fastmcp install claude-code <project_dir>/src/<repo_name>_mcp.py \
--python <project_dir>/<repo_name>-env/bin/python
```

### Manual Launch with Remote MCP Server Hosted on Hugging Face
To create a paper agent in Claude Code with the Paper MCP server of interest, use the following script with your own working directory, MCP name, and server URL:
```bash
bash launch_remote_mcp.sh \
  --working_dir <working_dir> \
  --mcp_name <mcp_name> \
  --mcp_url <remote_mcp_url>
```

For example, to create an AlphaGenome Agent, run:
```bash
bash launch_remote_mcp.sh \
  --working_dir analysis_dir \
  --mcp_name alphagenome \
  --mcp_url https://Paper2Agent-alphagenome-mcp.hf.space
```

✅ You will now have an **AlphaGenome Agent** ready for genomics data interpretation. You can input the query like:
```
Analyze heart gene expression data with AlphaGenome MCP to identify the causal gene
for the variant chr11:116837649:T>G, associated with Hypoalphalipoproteinemia.
```

To reuse the AlphaGenome agent, run

```bash
cd analysis_dir
claude
```

### Verification
Verify your agent is loaded:
```bash
claude mcp list
```

or use `\mcp` inside Claude Code. You should see your repository-specific MCP server listed.
<img width="620" height="247" alt="Screenshot 2025-09-15 at 10 36 00 PM" src="https://github.com/user-attachments/assets/e9bc771f-d223-477c-953b-f30220e37633" />

## 📁 Output Structure

After completion, your project will contain:

```
<project_dir>/
├── src/
│   ├── <repo_name>_mcp.py          # Generated MCP server
│   └── tools/
│       └── <tutorial_file_name>.py      # Extracted tools from each tutorial
├── <repo_name>-env/                # Isolated Python environment
├── repo/
│   └── <repo_name>/                # Cloned repository with original code
├── claude_outputs/
│   ├── step1_output.json           # Tutorial scanner results
│   ├── step2_output.json           # Tutorial executor results
│   ├── step3_output.json           # Tool extraction results
│   ├── step4_output.json           # MCP server creation results
│   └── step5_output.json           # Coverage and quality analysis results
├── reports/
│   ├── tutorial-scanner.json       # Tutorial discovery analysis
│   ├── tutorial-scanner-include-in-tools.json  # Tools inclusion decisions
│   ├── executed_notebooks.json     # Notebook execution summary
│   ├── environment-manager_results.md  # Environment setup details
│   ├── coverage/                   # Code coverage analysis reports
│   │   ├── coverage.xml            # XML coverage report (CI/CD format)
│   │   ├── coverage.json           # JSON coverage report (machine-readable)
│   │   ├── coverage_summary.txt     # Text summary of coverage metrics
│   │   ├── coverage_report.md       # Detailed markdown coverage analysis
│   │   ├── pytest_output.txt       # Full pytest execution output
│   │   └── htmlcov/                # HTML coverage dashboard (interactive)
│   ├── quality/                    # Code quality analysis reports
│   │   └── pylint/                 # Pylint code style analysis
│   │       ├── pylint_report.txt   # Full pylint analysis output
│   │       ├── pylint_scores.txt   # Per-file pylint scores summary
│   │       └── pylint_issues.md    # Detailed style issues breakdown
│   └── coverage_and_quality_report.md  # Combined coverage + quality report
├── tests/
│   ├── code/<tutorial_file_name>/       # Test code for extracted tools
│   ├── data/<tutorial_file_name>/       # Test data files
│   ├── results/<tutorial_file_name>/    # Test execution results
│   └── logs/                       # Test execution logs
├── notebooks/
│   └── <tutorial_file_name>/
│       ├── <tutorial_file_name>_execution_final.ipynb  # Executed tutorial
│       └── images/                 # Generated plots and visualizations
└── tools/                          # Additional utility scripts
```

### Key Output Files and Directories

| File/Directory | Description |
|----------------|-------------|
| `src/<repo_name>_mcp.py` | Main MCP server file that Claude Code loads |
| `src/tools/<tutorial_file_name>.py` | Individual tool modules extracted from each tutorial |
| `<repo_name>-env/` | Isolated Python environment with all dependencies |
| `reports/coverage/` | Code coverage analysis reports (pytest-cov) |
| `reports/quality/pylint/` | Code style analysis reports (pylint) |
| `reports/coverage_and_quality_report.md` | Combined coverage + quality metrics report |

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

## 📊 AlphaGenome Agent Benchmarking
For comprehensive benchmarking results and evaluation metrics of the AlphaGenome Agent, please refer to our dedicated benchmarking repository: [Paper2AgentBench](https://github.com/joed3/Paper2AgentBench). This repository contains our benchmarking tools and evaluation metrics for the AlphaGenome Agent compared to the Claude + Repo and Biomni agents.

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

