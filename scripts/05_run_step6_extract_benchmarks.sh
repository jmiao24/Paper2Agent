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
# The JSON is a dictionary: { "name": { "execution_path": "...", "http_url": "..." }, ... }
# We use jq to extract keys and iterate
tutorial_names=$(jq -r 'keys[]' "$EXECUTED_NOTEBOOKS_JSON")

# Initialize CSV with header if it doesn't exist (handled by python script, but good to be safe)
rm -f "$OUTPUT_CSV"

for tutorial_name in $tutorial_names; do
    # Extract fields for this tutorial
    # We use arg --arg to pass the key safely
    tutorial_data=$(jq -c --arg name "$tutorial_name" '.[$name]' "$EXECUTED_NOTEBOOKS_JSON")
    
    # execution_path is relative to MAIN_DIR usually, but let's check
    rel_exec_path=$(echo "$tutorial_data" | jq -r '.execution_path')
    http_url=$(echo "$tutorial_data" | jq -r '.http_url')
    
    # Construct full path to executed notebook
    exec_nb_path="$MAIN_DIR/$rel_exec_path"
    
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
    echo "IMPORTANT: Return ONLY the JSON object. Do not include any conversational text, markdown formatting, or explanations." >> "$agent_input_file"
    echo "Tutorial Name: $tutorial_name" >> "$agent_input_file"
    echo "Tutorial URL: $http_url" >> "$agent_input_file"
    echo "---" >> "$agent_input_file"
    # Preprocess the notebook to reduce size (strip images, truncate text)
    preprocessed_nb_path="$MAIN_DIR/notebooks/${tutorial_name}/${tutorial_name}_execution_context_preprocessed.ipynb"
    python3 "$SCRIPT_DIR/tools/preprocess_notebook.py" "$exec_nb_path" "$preprocessed_nb_path"
    
    echo "Notebook Content:" >> "$agent_input_file"
    cat "$preprocessed_nb_path" >> "$agent_input_file"
    
    # Run Claude
    # We use a large context model
    claude --model claude-sonnet-4-20250514 \
      --output-format json \
      --dangerously-skip-permissions \
      -p - < "$agent_input_file" > "$agent_output_file"
      
    # Validate and Append to CSV
    python3 "$EXTRACTOR_SCRIPT" \
        --notebook "$preprocessed_nb_path" \
        --questions "$agent_output_file" \
        --output "$OUTPUT_CSV"
        
done

# Global Review Step
echo "05.6: Running global benchmark review..."
python3 "$SCRIPT_DIR/tools/benchmark_reviewer.py" \
    --input "$OUTPUT_CSV" \
    --reviewer-agent "$SCRIPT_DIR/agents/benchmark-reviewer.md"

echo "05.6: Benchmark extraction complete. Results in $OUTPUT_CSV" >&2
touch "$MARKER"
