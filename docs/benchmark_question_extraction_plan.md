# Benchmark Question Extraction & Assessment - Implementation Plan

## Overview
This document outlines a comprehensive plan for implementing a benchmarking system for the Paper2Agent workflow. It consists of two main components:
1.  **Benchmark Extraction**: Automatically extracting objective questions and ground truth answers from executed tutorials.
2.  **Benchmark Assessment (LLM-as-Judge)**: Evaluating the final MCP agent's performance against these questions using an LLM judge.

## Integration Point
**Recommended Workflow**:
1.  ...
2.  Step 5.5: Code Coverage & Quality Reports
3.  **Step 5.6: Extract Benchmark Questions** (New)
4.  **Step 5.7: Run Benchmark Assessment** (New)
5.  Step 6: Launch MCP Server (Existing, Interactive)

**Rationale**: 
- Benchmarks extraction and assessment should be part of the automated build/verification pipeline (Step 5 loop).
- The final Step 6 is an interactive launch for the user, so automated assessment must happen *before* it.

---

## Step-by-Step Implementation Plan

### Phase 1: Infrastructure Setup

#### Step 1.1: Create Extraction Script
**Action**: Create `scripts/05_run_step6_extract_benchmarks.sh`
**Purpose**: Orchestrate the extraction of questions from executed notebooks.

#### Step 1.2: Create Assessment Script
**Action**: Create `scripts/05_run_step7_benchmark_assessment.sh`
**Purpose**: Run the final agent against the extracted questions and evaluate results. This script will:
1.  Start the MCP server (generated in Step 4) in the background.
2.  Run the assessment agent against the server.
3.  Generate reports.
4.  Shutdown the server.

#### Step 1.3: Create Agent Definitions
**Action**: 
1.  `agents/benchmark-extractor.md`: Specialized for analyzing notebooks and formulating questions.
2.  `agents/benchmark-judge.md`: Specialized for comparing Agent output vs. Ground Truth.

#### Step 1.4: Update Main Pipeline
**Action**: Modify `Paper2Agent.sh`:
1.  Update `TOTAL_STEPS` count.
2.  Extend the Step 5 loop to include sub-steps 6 and 7.
3.  Add case handlers for the new scripts.

---

### Phase 2: Benchmark Extraction (Efficiency & Accuracy Focused)

#### Step 2.1: Optimized Extraction Logic
**Strategy**: Single-Pass LLM Extraction with Verification.
Instead of multiple passes (identify -> classify -> formulate), we will use a powerful prompt to do this in one pass per tutorial, with strict JSON output.

**Input**:
- Executed Notebook (JSON)
- Tool Definitions (Python files)

**Process**:
1.  **Pre-processing**: Python script parses the notebook to extract cells with outputs (text, numbers, simple structures). Large outputs are truncated/summarized.
2.  **LLM Analysis**: Send the filtered notebook content to the `benchmark-extractor` agent.
    *   **Prompt Instruction**: "Identify 3-5 objective questions from this tutorial. For each, provide the Question, the Exact Ground Truth (from cell output), and the Cell ID."
    *   **Constraint**: Questions must be answerable *solely* via the tools defined in `src/tools/`.
3.  **Validation**: The Python script verifies that the "Ground Truth" provided by the LLM actually exists in the specified Cell ID's output. This prevents hallucination.

**Output**: `reports/benchmark_questions.csv`

#### Step 2.2: Question Types
Focus on **Objective** metrics to ensure accurate judging:
- **Numeric**: "What is the accuracy?", "How many items...?"
- **Categorical**: "What is the class label?", "True or False: ...?"
- **Exact String**: "What is the return value of...?"

---

### Phase 3: Benchmark Assessment (LLM-as-Judge)

#### Step 3.1: Assessment Logic
**Process**:
1.  **Load Benchmarks**: Read `reports/benchmark_questions.csv`.
2.  **Initialize Agent**: Connect to the MCP server (Client).
3.  **Execution Loop**:
    For each question:
    *   **Query**: Send question to the MCP Agent.
    *   **Capture**: Record the Agent's full response.
    *   **Judge**: Send (Question, Ground Truth, Agent Response) to `benchmark-judge` agent.
    *   **Score**: Judge returns `Correct` (1.0), `Incorrect` (0.0), or `Partially Correct` (0.5) with reasoning.

#### Step 3.2: The Judge Prompt
**Key Criteria**:
- **Numeric**: Allow for minor precision differences (e.g., 0.98 vs 0.981).
- **Semantic**: "The model accuracy is 98%" is equivalent to "0.98".
- **Strictness**: Penalize hallucinations or wrong steps.

#### Step 3.3: Reporting
**Output**: `reports/benchmark_results.json` and `reports/benchmark_summary.md`.
**Metrics**:
- **Accuracy**: % of questions answered correctly.
- **Tool Usage**: Did the agent use the correct tool? (If observable).
- **Latency**: Time taken per question.

---

### Phase 4: Data Structures

#### Step 4.1: Benchmark CSV Schema
- `question_id`: Unique ID.
- `tutorial_source`: Filename.
- `question`: Text.
- `ground_truth`: Value.
- `answer_type`: numeric/text/boolean.
- `tolerance`: (Optional) for numeric comparison (e.g., 0.01).

#### Step 4.2: Assessment JSON Schema
```json
{
  "summary": {
    "total_questions": 20,
    "accuracy": 0.85,
    "timestamp": "..."
  },
  "details": [
    {
      "question_id": "...",
      "question": "...",
      "ground_truth": "...",
      "agent_response": "...",
      "judgment": "Correct",
      "score": 1.0,
      "reasoning": "..."
    }
  ]
}
```

---

### Phase 5: Implementation Timeline

#### Week 1: Extraction
- Implement `scripts/05_run_step6_extract_benchmarks.sh`.
- Implement `agents/benchmark-extractor.md`.
- Verify extraction on sample tutorials.

#### Week 2: Assessment
- Implement `scripts/05_run_step7_benchmark_assessment.sh`.
- Implement `agents/benchmark-judge.md`.
- Run end-to-end tests.

---

## Success Metrics
1.  **Extraction Quality**: >90% of extracted questions are valid and have correct ground truth (verified by human spot-check).
2.  **Assessment Reliability**: LLM Judge agrees with human judgment >95% of the time.
3.  **Pipeline Stability**: New steps do not break existing workflow.
