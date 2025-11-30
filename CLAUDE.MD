# Paper2Agent - AI Agent Generation System

## Overview

Paper2Agent is a multi-agent AI system that automatically transforms research papers into interactive AI agents with minimal human input. The system extracts tools from research paper codebases and creates Model Context Protocol (MCP) servers that can be used with Claude Code and other AI coding assistants.

## Project Architecture

### Core Components

1. **Tutorial Scanner** - Identifies and categorizes tutorial materials in research codebases
2. **Tutorial Executor** - Executes notebooks to generate gold-standard outputs
3. **Tool Extractor** - Extracts reusable functions from tutorials
4. **Test Verifier** - Creates and validates test files for extracted functions
5. **MCP Generator** - Creates FastMCP servers from extracted tools

### Output Structure

```
<project_dir>/
├── src/
│   ├── <repo_name>_mcp.py          # Generated MCP server
│   └── tools/                      # Extracted tools from tutorials
├── <repo_name>-env/                # Isolated Python environment
├── repo/<repo_name>/               # Cloned repository
├── reports/                        # Analysis reports
├── tests/                          # Generated test suites
└── notebooks/                      # Executed tutorials
```

## MCP Server Integration

### What is MCP?

Model Context Protocol (MCP) is a standardized protocol for connecting AI models with external tools and data sources. Paper2Agent generates MCP servers using FastMCP that expose research paper functionality as callable tools.

### MCP Server Structure

Paper2Agent generates MCP servers with the following structure:

```python
from fastmcp import FastMCP
from tools.example_tool import example_mcp

# Define the MCP server
mcp = FastMCP(name="ResearchPaper")

# Mount the tools
mcp.mount(example_mcp)

# Run the MCP server
if __name__ == "__main__":
    mcp.run(transport="http", host="127.0.0.1", port=8003)
```

### Installing MCP Servers

#### Local MCP Server

```bash
cd <working_dir>
fastmcp install claude-code <project_dir>/src/<repo_name>_mcp.py \
  --python <project_dir>/<repo_name>-env/bin/python
```

#### Remote MCP Server (Hugging Face)

```bash
bash launch_remote_mcp.sh \
  --working_dir <working_dir> \
  --mcp_name <mcp_name> \
  --mcp_url <remote_mcp_url>
```

Example:
```bash
bash launch_remote_mcp.sh \
  --working_dir analysis_dir \
  --mcp_name alphagenome \
  --mcp_url https://Paper2Agent-alphagenome-mcp.hf.space
```

### Verifying MCP Installation

```bash
# List installed MCP servers
claude mcp list

# Or inside Claude Code
\mcp
```

## Tool Calling Format

### Tool Structure

Each tool extracted by Paper2Agent follows this standardized format:

```python
from fastmcp import FastMCP
from typing import Annotated, Literal

# Create MCP instance for the tool module
tool_mcp = FastMCP(name="tool_name")

@tool_mcp.tool
def example_tool(
    required_param: Annotated[str, "Description of required parameter"],
    optional_param: Annotated[str | None, "Description of optional parameter"] = None,
    enum_param: Annotated[Literal["option1", "option2"], "Parameter with fixed options"] = "option1",
    bool_param: Annotated[bool, "Boolean flag description"] = True,
) -> dict:
    """
    Brief description of what the tool does.
    """
    # Tool implementation

    # Return standardized format
    return {
        "message": "Description of what was done",
        "reference": "https://github.com/repo/tutorial.ipynb",
        "artifacts": [
            {
                "description": "Output file description",
                "path": "/absolute/path/to/output.csv"
            }
        ]
    }
```

### Tool Calling Convention

All Paper2Agent tools return a standardized dictionary with:

- **message**: Human-readable description of the operation result
- **reference**: Link to the original tutorial/paper
- **artifacts**: List of generated files with descriptions and absolute paths

### Example Tool: Batch Variant Scoring

```python
@score_batch_mcp.tool
def score_batch_variants(
    api_key: Annotated[str, "API key for the AlphaGenome model"],
    vcf_file: Annotated[str | None, "Path to VCF/TSV/CSV file with columns: variant_id, CHROM, POS, REF, ALT"] = None,
    organism: Annotated[Literal["human", "mouse"], "Organism to score against"] = "human",
    sequence_length: Annotated[Literal["2KB", "16KB", "100KB", "500KB", "1MB"], "Context window"] = "1MB",
    score_rna_seq: Annotated[bool, "Include RNA-seq signal prediction"] = True,
    score_atac: Annotated[bool, "Include ATAC"] = True,
    out_prefix: Annotated[str | None, "Output file prefix"] = None,
) -> dict:
    """
    Score genetic variants in batch across multiple regulatory modalities using AlphaGenome.
    """
    # Implementation details...

    return {
        "message": f"Scored {len(vcf)} variants and saved results table",
        "reference": "https://github.com/AlphaPOP/blob/main/score_batch.ipynb",
        "artifacts": [
            {
                "description": "Variant scores results table",
                "path": str(download_path.resolve())
            }
        ]
    }
```

### Calling Tools in Claude Code

When the MCP server is connected to Claude Code, tools are automatically discovered and can be called:

```
User: Analyze heart gene expression data with AlphaGenome MCP to identify the
causal gene for the variant chr11:116837649:T>G, associated with
Hypoalphalipoproteinemia.
```

Claude Code will:
1. Detect available MCP tools
2. Select the appropriate tool (e.g., `score_batch_variants`)
3. Format the input data correctly
4. Call the tool with proper parameters
5. Process and present the results

## Running Paper2Agent

### Basic Usage

```bash
cd Paper2Agent

bash Paper2Agent.sh \
  --project_dir <PROJECT_DIR> \
  --github_url <GITHUB_URL>
```

### Advanced Usage

```bash
# Process specific tutorials only
bash Paper2Agent.sh \
  --project_dir <PROJECT_DIR> \
  --github_url <GITHUB_URL> \
  --tutorials <TUTORIALS_URL or TUTORIALS_TITLE>

# With API key for private repositories
bash Paper2Agent.sh \
  --project_dir <PROJECT_DIR> \
  --github_url <GITHUB_URL> \
  --api <API_KEY>
```

### Examples

#### AlphaGenome Agent

```bash
bash Paper2Agent.sh \
  --project_dir AlphaGenome_Agent \
  --github_url https://github.com/google-deepmind/alphagenome \
  --api <ALPHAGENOME_API_KEY>
```

#### Scanpy Agent

```bash
bash Paper2Agent.sh \
  --project_dir Scanpy_Agent \
  --github_url https://github.com/scverse/scanpy \
  --tutorials "Preprocessing and clustering"
```

## Available Paper MCP Servers

Pre-built MCP servers hosted on Hugging Face:

- **AlphaGenome**: https://Paper2Agent-alphagenome-mcp.hf.space
- **Scanpy**: https://Paper2Agent-scanpy-mcp.hf.space
- **TISSUE**: https://Paper2Agent-tissue-mcp.hf.space

## Multi-Agent System

Paper2Agent uses specialized agents for different pipeline stages:

1. **tutorial-scanner** - Scans codebase for tutorial materials
2. **tutorial-executor** - Executes notebooks with proper environment setup
3. **tutorial-tool-extractor-implementor** - Extracts and implements tools from tutorials
4. **test-verifier-improver** - Creates and validates test files
5. **environment-python-manager** - Manages isolated Python environments

Each agent is invoked automatically during the Paper2Agent pipeline.

## Type Annotations and Parameters

### Supported Types

Paper2Agent tools use Python type hints with `Annotated` for documentation:

- **String**: `Annotated[str, "Description"]`
- **Optional**: `Annotated[str | None, "Description"] = None`
- **Enum**: `Annotated[Literal["opt1", "opt2"], "Description"]`
- **Boolean**: `Annotated[bool, "Description"] = True`
- **Integer**: `Annotated[int, "Description"]`
- **Float**: `Annotated[float, "Description"]`

### File Path Conventions

- Input files: Relative or absolute paths accepted
- Output files: Generated in `PROJECT_ROOT/tmp/outputs/`
- Environment variables can override default directories:
  - `{TOOL_NAME}_INPUT_DIR`
  - `{TOOL_NAME}_OUTPUT_DIR`

## Best Practices

### When Creating Tools

1. **Use clear parameter descriptions** - The annotation string helps Claude understand the tool
2. **Provide sensible defaults** - Optional parameters should have good default values
3. **Return standardized format** - Always include message, reference, and artifacts
4. **Validate inputs** - Check file existence and parameter validity
5. **Use absolute paths** - Return absolute paths in artifacts for reliability

### When Using Paper Agents

1. **Verify MCP connection** - Use `\mcp` in Claude Code to confirm server is loaded
2. **Provide complete data** - Include all required input files
3. **Check artifacts** - Review generated output files in the artifacts list
4. **Reference original papers** - Use the reference URLs to understand tool behavior
5. **Monitor execution** - Check logs and reports in the reports/ directory

## Code Quality and Coverage

Paper2Agent includes automated testing and quality checks:

### Coverage Reports

Located in `reports/coverage/`:
- `coverage.xml` - CI/CD format
- `coverage.json` - Machine-readable format
- `coverage_summary.txt` - Quick metrics
- `coverage_report.md` - Detailed analysis
- `htmlcov/` - Interactive HTML dashboard

### Quality Reports

Located in `reports/quality/pylint/`:
- `pylint_report.txt` - Full analysis
- `pylint_scores.txt` - Per-file scores
- `pylint_issues.md` - Issues breakdown

### Combined Report

`reports/coverage_and_quality_report.md` provides comprehensive metrics for all generated tools.

## Prerequisites

- **Python**: 3.10 or higher
- **Claude Code**: Install from [anthropic.com/claude-code](https://www.anthropic.com/claude-code)
- **FastMCP**: `pip install fastmcp`

## Installation

```bash
# Clone repository
git clone https://github.com/jmiao24/Paper2Agent.git
cd Paper2Agent

# Install dependencies
pip install fastmcp

# Install and configure Claude Code
npm install -g @anthropic-ai/claude-code
claude
```

## Citation

```bibtex
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

## Resources

- **Repository**: https://github.com/jmiao24/Paper2Agent
- **Benchmarking**: https://github.com/joed3/Paper2AgentBench
- **Claude Code**: https://www.anthropic.com/claude-code
- **FastMCP**: https://github.com/jlowin/fastmcp
