#!/usr/bin/env bash
set -euo pipefail

# Verbose progress functions
VERBOSE=${VERBOSE:-1}
START_TIME=$(date +%s)
TOTAL_STEPS=11  # 6 main steps + 5 substeps + 1 coverage step

log_progress() {
    local step_num=$1
    local step_name=$2
    local status=$3
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')

    if [[ $VERBOSE -eq 1 ]]; then
        case $status in
            "start")
                echo "[$timestamp] ▶️  Step $step_num/$TOTAL_STEPS: $step_name - STARTING" >&2
                ;;
            "skip")
                echo "[$timestamp] ⏭️  Step $step_num/$TOTAL_STEPS: $step_name - SKIPPED (already done)" >&2
                ;;
            "complete")
                echo "[$timestamp] ✅ Step $step_num/$TOTAL_STEPS: $step_name - COMPLETED" >&2
                ;;
            "error")
                echo "[$timestamp] ❌ Step $step_num/$TOTAL_STEPS: $step_name - ERROR" >&2
                ;;
        esac
        show_progress_bar $step_num
    fi
}

show_progress_bar() {
    local current=$1
    local total=$TOTAL_STEPS
    local width=30
    local percentage=$((current * 100 / total))
    local filled=$((current * width / total))
    local empty=$((width - filled))

    printf "Progress: [" >&2
    printf "%*s" $filled | tr ' ' '█' >&2
    printf "%*s" $empty | tr ' ' '░' >&2
    printf "] %d%% (%d/%d)\n" $percentage $current $total >&2
    echo >&2
}

show_elapsed_time() {
    local current_time=$(date +%s)
    local elapsed=$((current_time - START_TIME))
    local minutes=$((elapsed / 60))
    local seconds=$((elapsed % 60))
    echo "⏱️  Total elapsed time: ${minutes}m ${seconds}s" >&2
}

# Parse args
GITHUB_REPO_URL=""
FOLDER_NAME=""
TUTORIAL_FILTER=""
TUTORIAL_FILTER=""
API_KEY=""
RUN_BENCHMARK=0
while [[ $# -gt 0 ]]; do
  case $1 in
    --project_dir)
      FOLDER_NAME="$2"
      shift 2
      ;;
    --github_url)
      GITHUB_REPO_URL="$2"
      shift 2
      ;;
    --tutorials)
      TUTORIAL_FILTER="$2"
      shift 2
      ;;
    --api)
      API_KEY="$2"
      shift 2
      ;;
    --benchmark)
      RUN_BENCHMARK=1
      shift 1
      ;;
    *)
      echo "Unknown parameter: $1" >&2
      exit 1
      ;;
  esac
done

if [[ -z "$GITHUB_REPO_URL" || -z "$FOLDER_NAME" ]]; then
  echo "Usage: bash Paper2Agent.sh \\" >&2
  echo "  --project_dir <project_dir> \\" >&2
  echo "  --github_url <github_repo_url> \\" >&2
  echo "  --tutorials <tutorial_filter> \\" >&2
  echo "  --api <api_key>" >&2
  echo "" >&2
  echo "  --tutorials: Optional filter for tutorials (supports natural language descriptions)" >&2
  echo "      Examples: 'data visualization', 'ML tutorial', 'preprocessing.ipynb'" >&2
  echo "  --api: Optional API key for notebook execution and testing" >&2
  echo "  --benchmark: Optional flag to run benchmark extraction and assessment (default: off)" >&2
  exit 1
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

declare -A STEP_STATUS

# 1. Setup project (decide if we should run by checking marker)
MAIN_DIR="$SCRIPT_DIR/$FOLDER_NAME"
if [[ -f "$MAIN_DIR/.pipeline/01_setup_done" ]]; then
  log_progress 1 "Setup project environment" "skip"
  STEP_STATUS[setup]="skipped"
else
  log_progress 1 "Setup project environment" "start"
  MAIN_DIR=$(bash $SCRIPT_DIR/scripts/01_setup_project.sh "$SCRIPT_DIR" "$FOLDER_NAME")
  log_progress 1 "Setup project environment" "complete"
  STEP_STATUS[setup]="executed"
fi

cd "$MAIN_DIR"

# Compute repo name early so we can check clone artifact
repo_name=$(basename "$GITHUB_REPO_URL" .git)

# 2. Clone repo
if [[ -f "$MAIN_DIR/.pipeline/02_clone_done" ]]; then
  log_progress 2 "Clone GitHub repository" "skip"
  STEP_STATUS[clone]="skipped"
else
  log_progress 2 "Clone GitHub repository" "start"
  repo_name=$(bash $SCRIPT_DIR/scripts/02_clone_repo.sh "$MAIN_DIR" "$GITHUB_REPO_URL")
  log_progress 2 "Clone GitHub repository" "complete"
  STEP_STATUS[clone]="executed"
fi

# 3. Prepare folders
if [[ -f "$MAIN_DIR/.pipeline/03_folders_done" ]]; then
  log_progress 3 "Prepare working directories" "skip"
  STEP_STATUS[folders]="skipped"
else
  log_progress 3 "Prepare working directories" "start"
  bash $SCRIPT_DIR/scripts/03_prepare_folders.sh "$MAIN_DIR"
  log_progress 3 "Prepare working directories" "complete"
  STEP_STATUS[folders]="executed"
fi

# 4. Add context MCP
if [[ -f "$MAIN_DIR/.pipeline/04_context7_done" ]]; then
  log_progress 4 "Add context MCP server" "skip"
  STEP_STATUS[context7]="skipped"
else
  log_progress 4 "Add context MCP server" "start"
  bash $SCRIPT_DIR/scripts/04_add_context7_mcp.sh "$MAIN_DIR"
  log_progress 4 "Add context MCP server" "complete"
  STEP_STATUS[context7]="executed"
fi

# 5: Core Paper2Agent pipeline steps
for i in 1 2 3 4 5 6 7; do
  OUT="$MAIN_DIR/claude_outputs/step${i}_output.json"
  MARK="$MAIN_DIR/.pipeline/05_step${i}_done"

  # Define step names
  case $i in
    1) STEP_NAME="Setup Python environment & scan tutorials" ;;
    2) STEP_NAME="Execute tutorial notebooks" ;;
    3) STEP_NAME="Extract tools from tutorials" ;;
    4) STEP_NAME="Wrap tools in MCP server" ;;
    5) STEP_NAME="Generate code coverage & quality reports" ;;
    6) STEP_NAME="Extract benchmark questions" ;;
    7) STEP_NAME="Run benchmark assessment" ;;
  esac

  if [[ -f "$MARK" ]]; then
    log_progress $((4+i)) "$STEP_NAME" "skip"
    STEP_STATUS["step${i}"]="skipped"
  else
    # Check if benchmark steps should be skipped
    if [[ ($i -eq 6 || $i -eq 7) && $RUN_BENCHMARK -eq 0 ]]; then
        log_progress $((4+i)) "$STEP_NAME" "skip"
        STEP_STATUS["step${i}"]="skipped (optional)"
        continue
    fi

    log_progress $((4+i)) "$STEP_NAME" "start"
    case $i in
      1) bash $SCRIPT_DIR/scripts/05_run_step1_setup_env.sh "$SCRIPT_DIR" "$MAIN_DIR" "$repo_name" "$TUTORIAL_FILTER" ;;
      2) bash $SCRIPT_DIR/scripts/05_run_step2_execute_tutorials.sh    "$SCRIPT_DIR" "$MAIN_DIR" "$API_KEY" ;;
      3) bash $SCRIPT_DIR/scripts/05_run_step3_extract_tools.sh    "$SCRIPT_DIR" "$MAIN_DIR" "$API_KEY" ;;
      4) bash $SCRIPT_DIR/scripts/05_run_step4_wrap_mcp.sh    "$SCRIPT_DIR" "$MAIN_DIR" ;;
      5) bash $SCRIPT_DIR/scripts/05_run_step5_generate_coverage.sh "$SCRIPT_DIR" "$MAIN_DIR" "$repo_name" ;;
      6) bash $SCRIPT_DIR/scripts/05_run_step6_extract_benchmarks.sh "$SCRIPT_DIR" "$MAIN_DIR" "$repo_name" ;;
      7) bash $SCRIPT_DIR/scripts/05_run_step7_benchmark_assessment.sh "$SCRIPT_DIR" "$MAIN_DIR" "$repo_name" ;;
    esac
    log_progress $((4+i)) "$STEP_NAME" "complete"
    STEP_STATUS["step${i}"]="executed"
  fi
done

# 6. Launch MCP
if [[ -f "$MAIN_DIR/.pipeline/06_mcp_done" ]]; then
  log_progress 10 "Launch MCP server" "skip"
  STEP_STATUS[mcp]="skipped"
else
  log_progress 10 "Launch MCP server" "start"
  bash $SCRIPT_DIR/scripts/06_launch_mcp.sh "$MAIN_DIR" "$repo_name"
  log_progress 10 "Launch MCP server" "complete"
  STEP_STATUS[mcp]="executed"
fi

# --- Final Summary Report ---
echo ""
echo "🎉 Pipeline execution completed!" >&2
show_elapsed_time
echo ""
echo "================ Pipeline Summary ================" >&2
printf "01 Setup project: %s\n" "${STEP_STATUS[setup]:-not run}" >&2
printf "02 Clone repository: %s\n" "${STEP_STATUS[clone]:-not run}" >&2
printf "03 Prepare folders: %s\n" "${STEP_STATUS[folders]:-not run}" >&2
printf "04 Add context MCP: %s\n" "${STEP_STATUS[context7]:-not run}" >&2

for i in 1 2 3 4 5 6 7; do
  case $i in
    1) STEP_DESC="Setup env & scan" ;;
    2) STEP_DESC="Execute tutorials" ;;
    3) STEP_DESC="Extract tools" ;;
    4) STEP_DESC="Wrap MCP server" ;;
    5) STEP_DESC="Generate coverage & quality" ;;
    6) STEP_DESC="Extract benchmarks" ;;
    7) STEP_DESC="Run assessment" ;;
  esac
  printf "05.%d %s: %s\n" "$i" "$STEP_DESC" "${STEP_STATUS["step${i}"]:-not run}" >&2
done
printf "06 Launch MCP: %s\n" "${STEP_STATUS[mcp]:-not run}" >&2
echo "=================================================" >&2

# Show usage instructions
if [[ $VERBOSE -eq 1 ]]; then
  echo ""
  echo "📋 To disable verbose output, run with: VERBOSE=0 $0 ..." >&2
  echo "📋 To re-run with more verbosity, check individual script outputs" >&2
fi
