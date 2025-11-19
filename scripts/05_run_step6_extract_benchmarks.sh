#!/usr/bin/env bash
set -euo pipefail

# Usage: 05_run_step6_extract_benchmarks.sh <SCRIPT_DIR> <MAIN_DIR> <repo_name>
if [[ $# -lt 3 ]]; then
  echo "Usage: $0 <SCRIPT_DIR> <MAIN_DIR> <repo_name>" >&2
  exit 1
fi

SCRIPT_DIR="$1"
MAIN_DIR="$2"
REPO_NAME="$3"

PIPELINE_DIR="$MAIN_DIR/.pipeline"
MARKER="$PIPELINE_DIR/05_step6_done"
OUTPUT_CSV="$MAIN_DIR/reports/benchmark_questions.csv"
EXECUTED_NOTEBOOKS_JSON="$MAIN_DIR/reports/executed_notebooks.json"
AGENT_DEF="$SCRIPT_DIR/agents/benchmark-extractor.md"
EXTRACTOR_SCRIPT="$SCRIPT_DIR/tools/benchmark_extractor.py"

mkdir -p "$PIPELINE_DIR"
mkdir -p "$MAIN_DIR/reports"

echo "05.6: Extracting benchmark questions..." >&2

if [[ -f "$MARKER" ]]; then
  echo "05.6: already done (marker exists)" >&2
  exit 0
fi

if [[ ! -f "$EXECUTED_NOTEBOOKS_JSON" ]]; then
    echo "05.6: No executed notebooks report found. Skipping." >&2
    exit 0
fi

# Read executed notebooks list
# We use jq to parse the JSON array
tutorials=$(jq -c '.[]' "$EXECUTED_NOTEBOOKS_JSON")

# Initialize CSV with header if it doesn't exist (handled by python script, but good to be safe)
rm -f "$OUTPUT_CSV"

for tutorial in $tutorials; do
    # Extract fields
    tutorial_name=$(echo "$tutorial" | jq -r '.name')
    tutorial_path=$(echo "$tutorial" | jq -r '.path')
    
    # Construct full path to executed notebook
    # The executed notebook is usually in notebooks/<name>/<name>_execution_final.ipynb
    # But let's check the path from the report or standard convention
    
    # Standard convention from Step 2:
    exec_nb_path="$MAIN_DIR/notebooks/${tutorial_name}/${tutorial_name}_execution_final.ipynb"
    
    if [[ ! -f "$exec_nb_path" ]]; then
        echo "05.6: Warning - Executed notebook not found for $tutorial_name at $exec_nb_path" >&2
        continue
    fi
    
    echo "05.6: Processing $tutorial_name..." >&2
    
    # Prepare input for Agent
    # We need to pass the notebook content. 
    # Since notebooks can be large, we might want to truncate or summarize, 
    # but for now let's rely on Claude's context window.
    
    # We'll use a temporary file for the agent prompt input
    agent_input_file="$MAIN_DIR/notebooks/${tutorial_name}/benchmark_input.txt"
    agent_output_file="$MAIN_DIR/notebooks/${tutorial_name}/benchmark_output.json"
    
    # Create a simplified representation for the LLM? 
    # Or just pass the raw notebook JSON? Raw JSON is usually fine for Claude.
    # Let's pass the raw notebook content as context.
    
    # Construct the prompt
    # We use the agent definition as the system prompt/persona
    
    # Call Claude
    # We pipe the notebook content into the prompt
    # Note: We are using `claude` CLI. We need to construct a prompt that includes the agent definition.
    
    # Create a combined prompt file
    cat "$AGENT_DEF" > "$agent_input_file"
    echo "" >> "$agent_input_file"
    echo "---" >> "$agent_input_file"
    echo "Task: Extract benchmark questions from the following notebook." >> "$agent_input_file"
    echo "Tutorial Name: $tutorial_name" >> "$agent_input_file"
    echo "Tutorial Path: $tutorial_path" >> "$agent_input_file"
    echo "---" >> "$agent_input_file"
    echo "Notebook Content:" >> "$agent_input_file"
    cat "$exec_nb_path" >> "$agent_input_file"
    
    # Run Claude
    # We use a large context model
    claude --model claude-sonnet-4-20250514 \
      --output-format json \
      --dangerously-skip-permissions \
      -p - < "$agent_input_file" > "$agent_output_file"
      
    # Validate and Append to CSV
    python3 "$EXTRACTOR_SCRIPT" \
        --notebook "$exec_nb_path" \
        --questions "$agent_output_file" \
        --output "$OUTPUT_CSV"
        
done

echo "05.6: Benchmark extraction complete. Results in $OUTPUT_CSV" >&2
touch "$MARKER"
