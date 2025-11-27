/**
 * MLflow MCP Agent Types
 * For experiment tracking, trace management, and model evaluation
 */

export type TraceState = 'OK' | 'ERROR' | 'IN_PROGRESS';
export type SpanType = 'AGENT' | 'TOOL' | 'LLM' | 'CHAIN' | 'RETRIEVER';
export type AssessmentSourceType = 'HUMAN' | 'AUTOMATED' | 'LLM';

export interface TraceInfo {
  trace_id: string;
  state: TraceState;
  execution_duration?: number;
  request_preview?: string;
  response_preview?: string;
  tags?: Record<string, string>;
  trace_metadata?: Record<string, any>;
  assessments?: Assessment[];
}

export interface SpanData {
  name: string;
  span_id: string;
  parent_span_id?: string;
  start_time: number;
  end_time: number;
  attributes: {
    'mlflow.spanType'?: SpanType;
    [key: string]: any;
  };
}

export interface Assessment {
  assessment_id: string;
  feedback?: {
    name: string;
    value: number | string;
    rationale?: string;
  };
  expectation?: {
    name: string;
    value: any;
  };
  source: {
    source_type: AssessmentSourceType;
    source_id?: string;
  };
}

export interface TraceSearchRequest {
  experiment_id: string;
  filter_string?: string;
  max_results?: number;
  order_by?: string[];
  extract_fields?: string;
}

export interface TraceSearchResponse {
  traces: Array<{
    info: TraceInfo;
    data: {
      spans: SpanData[];
    };
  }>;
  total_count: number;
}

export interface MLflowExperiment {
  experiment_id: string;
  name: string;
  artifact_location: string;
  lifecycle_stage: 'active' | 'deleted';
  tags?: Record<string, string>;
}

export interface MLflowAgentRequest {
  tracking_uri: string;
  experiment_name: string;
  task_description: string;
  field_selection?: string;
  filters?: {
    trace_state?: TraceState;
    span_type?: SpanType;
    time_range?: {
      start_timestamp_ms?: number;
      end_timestamp_ms?: number;
    };
    execution_duration?: {
      min_ms?: number;
      max_ms?: number;
    };
  };
}

export interface MLflowToolSuggestion {
  tool_name: 'search_traces' | 'get_trace' | 'log_feedback' | 'log_expectation' | 'delete_traces' | 'set_trace_tag' | 'delete_trace_tag';
  description: string;
  suggested_parameters: Record<string, any>;
  example_usage: string;
}

export interface MLflowQueryPlan {
  task: string;
  suggested_tools: MLflowToolSuggestion[];
  field_selection_strategy: {
    extract_fields: string;
    rationale: string;
  };
  filter_strategy?: {
    filter_string: string;
    rationale: string;
  };
  workflow_steps: string[];
}

export interface MLflowFieldPattern {
  category: 'trace_info' | 'tags' | 'assessments' | 'spans';
  pattern: string;
  description: string;
  example: string;
}

export interface MLflowConnectionConfig {
  tracking_uri: string;
  experiment_id?: string;
  environment_variables?: Record<string, string>;
  authentication?: {
    type: 'databricks' | 'aws' | 'azure' | 'gcp' | 'basic';
    credentials?: Record<string, string>;
  };
}

export interface MLflowAgentOutput {
  query_plan: MLflowQueryPlan;
  connection_config: MLflowConnectionConfig;
  example_code: {
    python: string;
    mcp_tool_call: string;
  };
  best_practices: string[];
}
