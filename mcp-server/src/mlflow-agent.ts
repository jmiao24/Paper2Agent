/**
 * MLflow MCP Agent
 * Structures queries and experiments for MLflow MCP protocol integration
 */

import type {
  MLflowAgentRequest,
  MLflowAgentOutput,
  MLflowQueryPlan,
  MLflowToolSuggestion,
  MLflowFieldPattern,
  MLflowConnectionConfig,
} from './mlflow-agent-types.js';
import type { AgentCard as A2AAgentCard } from './operations-agents-types.js';

/**
 * Agent Card for MLflow MCP Agent (A2A Protocol Compliance)
 */
export const MLFLOW_AGENT_CARD: A2AAgentCard = {
  name: 'MLflow MCP Agent',
  version: '1.0.0',
  description: 'Intelligent query planner and experiment structurer for MLflow MCP protocol. Translates natural language requests into optimized MLflow API calls with field selection and filtering strategies.',
  capabilities: [
    'trace_search_optimization',
    'experiment_tracking_guidance',
    'field_selection_strategy',
    'filter_query_generation',
    'assessment_workflow_design',
    'performance_analysis',
  ],
  skills: [
    'mlflow_query_planning',
    'trace_debugging',
    'model_evaluation_guidance',
    'data_cleanup_strategies',
    'mcp_tool_selection',
  ],
  service_endpoint: '/api/mlflow-agent',
  authentication: {
    type: 'apiKey',
    description: 'API key required for MLflow MCP agent services',
  },
};

/**
 * Common MLflow field patterns for efficient data retrieval
 */
export const MLFLOW_FIELD_PATTERNS: MLflowFieldPattern[] = [
  {
    category: 'trace_info',
    pattern: 'info.trace_id,info.state,info.execution_duration',
    description: 'Basic trace identification and status',
    example: 'Get trace IDs and execution times for performance analysis',
  },
  {
    category: 'trace_info',
    pattern: 'info.request_preview,info.response_preview',
    description: 'Input/output previews for debugging',
    example: 'Review what the trace processed and returned',
  },
  {
    category: 'tags',
    pattern: 'info.tags.*',
    description: 'All trace tags and metadata',
    example: 'Retrieve custom tags for filtering and organization',
  },
  {
    category: 'tags',
    pattern: 'info.tags.`mlflow.traceName`',
    description: 'Trace name (backticks for dots in field names)',
    example: 'Get human-readable trace names',
  },
  {
    category: 'assessments',
    pattern: 'info.assessments.*',
    description: 'All assessment data including feedback and expectations',
    example: 'Retrieve evaluation scores and ground truth labels',
  },
  {
    category: 'assessments',
    pattern: 'info.assessments.*.feedback.value',
    description: 'Just the feedback scores',
    example: 'Extract numeric ratings for metric aggregation',
  },
  {
    category: 'assessments',
    pattern: 'info.assessments.*.source.source_type',
    description: 'Source of assessments (HUMAN, AUTOMATED, LLM)',
    example: 'Filter by who provided the evaluation',
  },
  {
    category: 'spans',
    pattern: 'data.spans.*',
    description: 'All span information (operations in trace)',
    example: 'Full trace execution breakdown',
  },
  {
    category: 'spans',
    pattern: 'data.spans.*.name',
    description: 'Operation names within trace',
    example: 'Identify which tools/agents were called',
  },
  {
    category: 'spans',
    pattern: 'data.spans.*.attributes.mlflow.spanType',
    description: 'Span types (AGENT, TOOL, LLM, CHAIN, RETRIEVER)',
    example: 'Categorize operations by their role',
  },
];

/**
 * Generate MLflow query plan based on user task description
 */
export function generateMLflowQueryPlan(request: MLflowAgentRequest): MLflowQueryPlan {
  const task = request.task_description.toLowerCase();
  const tools: MLflowToolSuggestion[] = [];
  let extractFields = request.field_selection || '';
  let filterString = '';

  // Debugging production issues
  if (task.includes('debug') || task.includes('error') || task.includes('fail')) {
    tools.push({
      tool_name: 'search_traces',
      description: 'Find traces with errors for debugging',
      suggested_parameters: {
        experiment_id: request.experiment_name,
        filter_string: "status='ERROR'",
        max_results: 50,
        extract_fields: 'info.trace_id,info.state,info.request_preview,info.response_preview,data.spans.*.name',
      },
      example_usage: 'Identify failed traces and their error contexts',
    });
    extractFields = extractFields || 'info.trace_id,info.state,info.request_preview,info.response_preview,data.spans.*.name';
    filterString = "status='ERROR'";
  }

  // Performance analysis
  if (task.includes('performance') || task.includes('slow') || task.includes('latency')) {
    tools.push({
      tool_name: 'search_traces',
      description: 'Find slow-executing traces',
      suggested_parameters: {
        experiment_id: request.experiment_name,
        filter_string: request.filters?.execution_duration?.min_ms
          ? `execution_time_ms > ${request.filters.execution_duration.min_ms}`
          : 'execution_time_ms > 5000',
        order_by: ['execution_time_ms DESC'],
        extract_fields: 'info.trace_id,info.execution_duration,data.spans.*.name,data.spans.*.attributes.mlflow.spanType',
      },
      example_usage: 'Identify performance bottlenecks in trace execution',
    });
    extractFields = extractFields || 'info.trace_id,info.execution_duration,data.spans.*.name';
    filterString = request.filters?.execution_duration?.min_ms
      ? `execution_time_ms > ${request.filters.execution_duration.min_ms}`
      : 'execution_time_ms > 5000';
  }

  // Quality assessment / evaluation
  if (task.includes('evaluat') || task.includes('assess') || task.includes('feedback') || task.includes('score')) {
    if (task.includes('log') || task.includes('add') || task.includes('create')) {
      // Logging new assessments
      tools.push({
        tool_name: 'log_feedback',
        description: 'Log evaluation scores for traces',
        suggested_parameters: {
          trace_id: '<trace_id>',
          name: 'relevance',
          value: 0.85,
          source_type: 'HUMAN',
          rationale: 'Explanation of the score',
        },
        example_usage: 'Record human evaluation judgments',
      });

      tools.push({
        tool_name: 'log_expectation',
        description: 'Log ground truth labels',
        suggested_parameters: {
          trace_id: '<trace_id>',
          name: 'expected_answer',
          value: 'The correct response',
          source_type: 'HUMAN',
        },
        example_usage: 'Add gold standard labels for evaluation',
      });
    } else {
      // Retrieving assessments
      tools.push({
        tool_name: 'search_traces',
        description: 'Search traces with assessment data',
        suggested_parameters: {
          experiment_id: request.experiment_name,
          extract_fields: 'info.trace_id,info.assessments.*',
          max_results: 100,
        },
        example_usage: 'Analyze evaluation patterns across traces',
      });
      extractFields = extractFields || 'info.trace_id,info.assessments.*';
    }
  }

  // Data cleanup
  if (task.includes('delete') || task.includes('clean') || task.includes('remove')) {
    if (task.includes('old') || task.includes('timestamp') || /\d+\s*(day|week|month)/.test(task)) {
      const daysMatch = task.match(/(\d+)\s*day/);
      const daysAgo = daysMatch ? parseInt(daysMatch[1]) : 30;
      const timestampMs = Date.now() - daysAgo * 24 * 60 * 60 * 1000;

      tools.push({
        tool_name: 'delete_traces',
        description: `Delete traces older than ${daysAgo} days`,
        suggested_parameters: {
          experiment_id: request.experiment_name,
          max_timestamp_millis: timestampMs,
        },
        example_usage: 'Clean up old test traces to save storage',
      });
    } else {
      tools.push({
        tool_name: 'delete_traces',
        description: 'Delete specific traces by ID',
        suggested_parameters: {
          experiment_id: request.experiment_name,
          trace_ids: ['<trace_id_1>', '<trace_id_2>'],
        },
        example_usage: 'Remove specific unwanted traces',
      });
    }
  }

  // Tagging and metadata
  if (task.includes('tag')) {
    if (task.includes('delete') || task.includes('remove')) {
      tools.push({
        tool_name: 'delete_trace_tag',
        description: 'Remove tags from traces',
        suggested_parameters: {
          trace_id: '<trace_id>',
          key: '<tag_key>',
        },
        example_usage: 'Clean up incorrect or outdated tags',
      });
    } else {
      tools.push({
        tool_name: 'set_trace_tag',
        description: 'Add custom tags to traces',
        suggested_parameters: {
          trace_id: '<trace_id>',
          key: 'environment',
          value: 'production',
        },
        example_usage: 'Organize traces with custom metadata',
      });
    }
  }

  // General search / exploration
  if (tools.length === 0 || task.includes('search') || task.includes('find') || task.includes('list')) {
    tools.push({
      tool_name: 'search_traces',
      description: 'Search and explore traces',
      suggested_parameters: {
        experiment_id: request.experiment_name,
        extract_fields: 'info.trace_id,info.state,info.execution_duration,info.tags.*',
        max_results: 100,
      },
      example_usage: 'General trace exploration and analysis',
    });
    extractFields = extractFields || 'info.trace_id,info.state,info.execution_duration,info.tags.*';
  }

  // Build workflow steps
  const workflowSteps: string[] = [];
  tools.forEach((tool, idx) => {
    workflowSteps.push(`${idx + 1}. ${tool.description} using ${tool.tool_name}`);
  });

  return {
    task: request.task_description,
    suggested_tools: tools,
    field_selection_strategy: {
      extract_fields: extractFields || 'info.trace_id,info.state',
      rationale: extractFields
        ? 'Optimized field selection reduces response size and improves query performance'
        : 'Default minimal field set for basic trace identification',
    },
    filter_strategy: filterString
      ? {
          filter_string: filterString,
          rationale: 'Filter applied based on task requirements to reduce result set',
        }
      : undefined,
    workflow_steps: workflowSteps,
  };
}

/**
 * Generate connection configuration for MLflow
 */
export function generateMLflowConnectionConfig(trackingUri: string): MLflowConnectionConfig {
  const config: MLflowConnectionConfig = {
    tracking_uri: trackingUri,
    environment_variables: {
      MLFLOW_TRACKING_URI: trackingUri,
    },
  };

  // Detect authentication type based on URI
  if (trackingUri.includes('databricks')) {
    config.authentication = {
      type: 'databricks',
      credentials: {
        DATABRICKS_HOST: 'Required environment variable',
        DATABRICKS_TOKEN: 'Required environment variable',
      },
    };
    config.environment_variables!.DATABRICKS_HOST = '${DATABRICKS_HOST}';
    config.environment_variables!.DATABRICKS_TOKEN = '${DATABRICKS_TOKEN}';
  } else if (trackingUri.includes('amazonaws.com')) {
    config.authentication = {
      type: 'aws',
      credentials: {
        AWS_ACCESS_KEY_ID: 'Required environment variable',
        AWS_SECRET_ACCESS_KEY: 'Required environment variable',
      },
    };
  } else if (trackingUri.includes('azure')) {
    config.authentication = {
      type: 'azure',
      credentials: {
        AZURE_STORAGE_CONNECTION_STRING: 'Required environment variable',
      },
    };
  }

  return config;
}

/**
 * Generate example code for the query plan
 */
export function generateMLflowExampleCode(plan: MLflowQueryPlan, trackingUri: string): {
  python: string;
  mcp_tool_call: string;
} {
  const primaryTool = plan.suggested_tools[0];

  const pythonCode = `import mlflow

# Set tracking URI
mlflow.set_tracking_uri("${trackingUri}")

# ${primaryTool.description}
${generatePythonToolCall(primaryTool)}
`;

  const mcpToolCall = `// MCP Tool Call
{
  "tool": "${primaryTool.tool_name}",
  "arguments": ${JSON.stringify(primaryTool.suggested_parameters, null, 2)}
}`;

  return {
    python: pythonCode,
    mcp_tool_call: mcpToolCall,
  };
}

/**
 * Helper to generate Python code for a tool
 */
function generatePythonToolCall(tool: MLflowToolSuggestion): string {
  switch (tool.tool_name) {
    case 'search_traces':
      return `from mlflow.tracking import MlflowClient

client = MlflowClient()
traces = client.search_traces(
    experiment_ids=["${tool.suggested_parameters.experiment_id}"],
    filter_string="${tool.suggested_parameters.filter_string || ''}",
    max_results=${tool.suggested_parameters.max_results || 100},
    extract_fields="${tool.suggested_parameters.extract_fields || ''}"
)

for trace in traces:
    print(f"Trace ID: {trace.info.trace_id}, State: {trace.info.state}")`;

    case 'get_trace':
      return `from mlflow.tracking import MlflowClient

client = MlflowClient()
trace = client.get_trace(
    trace_id="${tool.suggested_parameters.trace_id || '<trace_id>'}",
    extract_fields="${tool.suggested_parameters.extract_fields || ''}"
)
print(trace)`;

    case 'log_feedback':
      return `from mlflow.tracking import MlflowClient

client = MlflowClient()
client.log_feedback(
    trace_id="${tool.suggested_parameters.trace_id || '<trace_id>'}",
    name="${tool.suggested_parameters.name || 'feedback'}",
    value=${typeof tool.suggested_parameters.value === 'number' ? tool.suggested_parameters.value : `"${tool.suggested_parameters.value}"`},
    source_type="${tool.suggested_parameters.source_type || 'HUMAN'}",
    rationale="${tool.suggested_parameters.rationale || ''}"
)`;

    case 'log_expectation':
      return `from mlflow.tracking import MlflowClient

client = MlflowClient()
client.log_expectation(
    trace_id="${tool.suggested_parameters.trace_id || '<trace_id>'}",
    name="${tool.suggested_parameters.name || 'expected_output'}",
    value="${tool.suggested_parameters.value || ''}",
    source_type="${tool.suggested_parameters.source_type || 'HUMAN'}"
)`;

    case 'delete_traces':
      return `from mlflow.tracking import MlflowClient

client = MlflowClient()
client.delete_traces(
    experiment_id="${tool.suggested_parameters.experiment_id}",
    ${tool.suggested_parameters.trace_ids ? `trace_ids=${JSON.stringify(tool.suggested_parameters.trace_ids)}` : `max_timestamp_millis=${tool.suggested_parameters.max_timestamp_millis}`}
)`;

    case 'set_trace_tag':
      return `from mlflow.tracking import MlflowClient

client = MlflowClient()
client.set_trace_tag(
    trace_id="${tool.suggested_parameters.trace_id || '<trace_id>'}",
    key="${tool.suggested_parameters.key || 'tag_key'}",
    value="${tool.suggested_parameters.value || 'tag_value'}"
)`;

    default:
      return '# Tool implementation not yet supported';
  }
}

/**
 * Generate best practices based on the query plan
 */
export function generateBestPractices(plan: MLflowQueryPlan): string[] {
  const practices: string[] = [
    'Use extract_fields to retrieve only necessary data, reducing response size and latency',
    'Apply filters server-side using filter_string rather than filtering results client-side',
    'Use backticks for field names containing dots (e.g., info.tags.`mlflow.traceName`)',
    'Limit max_results to avoid overwhelming responses; paginate if needed',
  ];

  // Add task-specific practices
  if (plan.suggested_tools.some((t) => t.tool_name === 'search_traces')) {
    practices.push('Use order_by to sort results by relevant metrics (e.g., execution_time_ms DESC)');
    practices.push('Combine multiple field paths in extract_fields for comprehensive data retrieval');
  }

  if (plan.suggested_tools.some((t) => t.tool_name === 'log_feedback' || t.tool_name === 'log_expectation')) {
    practices.push('Always include rationale when logging feedback to provide context for scores');
    practices.push('Use consistent naming conventions for assessment metrics across experiments');
  }

  if (plan.suggested_tools.some((t) => t.tool_name === 'delete_traces')) {
    practices.push('Test deletion filters with search_traces first to verify correct traces are targeted');
    practices.push('Use timestamp-based deletion for cleanup rather than deleting by individual IDs');
  }

  return practices;
}

/**
 * Main function to generate complete MLflow agent output
 */
export function generateMLflowAgentOutput(request: MLflowAgentRequest): MLflowAgentOutput {
  const queryPlan = generateMLflowQueryPlan(request);
  const connectionConfig = generateMLflowConnectionConfig(request.tracking_uri);
  const exampleCode = generateMLflowExampleCode(queryPlan, request.tracking_uri);
  const bestPractices = generateBestPractices(queryPlan);

  return {
    query_plan: queryPlan,
    connection_config: connectionConfig,
    example_code: exampleCode,
    best_practices: bestPractices,
  };
}
