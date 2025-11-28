/**
 * The Orchestrator - Meta-Agent for Swarm Analysis and Optimization
 * Analyzes current swarm composition and suggests improvements using ADK patterns
 */

import type {
  OrchestratorRequest,
  OrchestratorOutput,
  CapabilityGap,
  AgentSuggestion,
  WorkflowOptimization,
  HierarchyRecommendation,
  CurrentAgent,
} from './orchestrator-types.js';
import type { AgentCard } from './operations-agents-types.js';

/**
 * Agent Card for The Orchestrator (A2A Protocol Compliance)
 */
export const ORCHESTRATOR_AGENT_CARD: AgentCard = {
  name: 'The Orchestrator',
  version: '1.0.0',
  description: 'Meta-agent for swarm analysis and optimization. Analyzes current agent composition, identifies capability gaps, suggests new agents, and recommends multi-agent patterns using ADK primitives (Sequential, Parallel, Loop workflows, LLM delegation, AgentTool).',
  capabilities: [
    'capability_gap_analysis',
    'agent_suggestion',
    'workflow_optimization',
    'hierarchy_design',
    'pattern_recommendation',
    'adk_integration',
  ],
  skills: [
    'multi_agent_architecture',
    'adk_primitives',
    'coordinator_pattern',
    'pipeline_design',
    'parallel_orchestration',
  ],
  service_endpoint: '/api/orchestrator',
  authentication: {
    type: 'apiKey',
    description: 'API key required for orchestrator services',
  },
};

/**
 * Analyze capability gaps in current swarm
 */
export function analyzeCapabilityGaps(request: OrchestratorRequest): CapabilityGap[] {
  const gaps: CapabilityGap[] = [];
  const currentCapabilities = new Set<string>();

  // Collect all current capabilities
  for (const agent of request.current_agents) {
    agent.capabilities.forEach((cap) => currentCapabilities.add(cap));
  }

  // Research pipeline gaps
  if (!currentCapabilities.has('data_versioning') && !currentCapabilities.has('experiment_tracking')) {
    gaps.push({
      domain: 'Research Infrastructure',
      missing_capability: 'DVC/Git Integration for Data Versioning',
      priority: 'high',
      rationale: 'No agent currently handles data version control or reproducibility tracking',
      impact: 'Researchers cannot track dataset versions, leading to reproducibility issues',
    });
  }

  if (!currentCapabilities.has('model_monitoring') && !currentCapabilities.has('performance_analysis')) {
    gaps.push({
      domain: 'ML Operations',
      missing_capability: 'Model Performance Monitoring',
      priority: 'high',
      rationale: 'Missing continuous model performance tracking and drift detection',
      impact: 'Production models may degrade without detection',
    });
  }

  // Collaboration gaps
  if (!currentCapabilities.has('code_review') && !currentCapabilities.has('pr_analysis')) {
    gaps.push({
      domain: 'Development Workflow',
      missing_capability: 'Automated Code Review',
      priority: 'medium',
      rationale: 'No agent provides code review, linting, or PR analysis',
      impact: 'Code quality issues may slip through without systematic review',
    });
  }

  // Documentation gaps
  if (!currentCapabilities.has('documentation_generation')) {
    gaps.push({
      domain: 'Knowledge Management',
      missing_capability: 'Automated Documentation Generator',
      priority: 'medium',
      rationale: 'No agent generates or maintains technical documentation',
      impact: 'Manual documentation burden, potential knowledge loss',
    });
  }

  // Infrastructure gaps
  if (!currentCapabilities.has('infrastructure_provisioning') && !currentCapabilities.has('deployment')) {
    gaps.push({
      domain: 'DevOps',
      missing_capability: 'Infrastructure as Code (Terraform/Pulumi)',
      priority: 'high',
      rationale: 'No agent handles infrastructure provisioning or deployment automation',
      impact: 'Manual infrastructure management is error-prone and not reproducible',
    });
  }

  // Research-specific gaps
  if (request.research_domains?.includes('literature_review') && !currentCapabilities.has('literature_search')) {
    gaps.push({
      domain: 'Research Discovery',
      missing_capability: 'Automated Literature Review',
      priority: 'high',
      rationale: 'No agent performs systematic literature searches or citation analysis',
      impact: 'Researchers spend excessive time on manual literature review',
    });
  }

  // Data quality gaps
  if (!currentCapabilities.has('data_validation') && !currentCapabilities.has('quality_control')) {
    gaps.push({
      domain: 'Data Engineering',
      missing_capability: 'Data Quality Validation',
      priority: 'critical',
      rationale: 'No agent validates data quality or detects anomalies before training',
      impact: 'Poor data quality leads to unreliable models',
    });
  }

  return gaps;
}

/**
 * Generate agent suggestions based on gaps and goals
 */
export function generateAgentSuggestions(
  gaps: CapabilityGap[],
  request: OrchestratorRequest
): AgentSuggestion[] {
  const suggestions: AgentSuggestion[] = [];

  // Map gaps to agent suggestions
  for (const gap of gaps) {
    if (gap.missing_capability.includes('Data Versioning')) {
      suggestions.push({
        name: 'The Archivist',
        role: 'Data Version Control and Reproducibility Manager',
        agent_type: 'LlmAgent',
        capabilities: ['data_versioning', 'dvc_integration', 'git_lfs', 'dataset_tracking', 'reproducibility'],
        description: 'Manages dataset versioning with DVC, tracks experiment artifacts, ensures reproducibility',
        tools_needed: ['DVC CLI', 'Git', 'Cloud Storage API'],
        integration_pattern: 'sequential_pipeline',
        communication_mechanism: ['shared_state', 'agent_tool'],
        example_use_case: 'Before training: Archivist versions dataset → Dataset Builder processes data → Training agent uses tracked version',
      });
    }

    if (gap.missing_capability.includes('Model Performance Monitoring')) {
      suggestions.push({
        name: 'The Sentinel',
        role: 'Model Performance Monitor and Drift Detector',
        agent_type: 'LlmAgent',
        capabilities: ['model_monitoring', 'drift_detection', 'performance_analysis', 'alerting', 'metrics_aggregation'],
        description: 'Continuously monitors model performance, detects data/concept drift, triggers retraining',
        tools_needed: ['MLflow API', 'Prometheus', 'Alerting System'],
        integration_pattern: 'iterative_refinement',
        communication_mechanism: ['shared_state', 'event_escalation'],
        example_use_case: 'LoopAgent runs Sentinel periodically → Detects drift → Escalates to trigger retraining pipeline',
      });
    }

    if (gap.missing_capability.includes('Code Review')) {
      suggestions.push({
        name: 'The Reviewer',
        role: 'Automated Code Review and Quality Assurance',
        agent_type: 'LlmAgent',
        capabilities: ['code_review', 'static_analysis', 'pr_analysis', 'linting', 'test_coverage'],
        description: 'Reviews pull requests, runs linters, checks test coverage, suggests improvements',
        tools_needed: ['GitHub API', 'Pylint', 'Pytest', 'SonarQube'],
        integration_pattern: 'generator_critic',
        communication_mechanism: ['shared_state', 'llm_delegation'],
        example_use_case: 'Developer commits code → Reviewer analyzes → Experimental Designer reviews methodology → Feedback to developer',
      });
    }

    if (gap.missing_capability.includes('Documentation')) {
      suggestions.push({
        name: 'The Scribe',
        role: 'Automated Documentation Generator',
        agent_type: 'LlmAgent',
        capabilities: ['documentation_generation', 'api_documentation', 'tutorial_creation', 'changelog_generation'],
        description: 'Generates README files, API docs, tutorials, and maintains changelogs from code and commits',
        tools_needed: ['Sphinx', 'Markdown Parser', 'Git History'],
        integration_pattern: 'sequential_pipeline',
        communication_mechanism: ['shared_state', 'agent_tool'],
        example_use_case: 'After code merge: Scribe extracts docstrings → Generates API docs → Updates changelog',
      });
    }

    if (gap.missing_capability.includes('Infrastructure as Code')) {
      suggestions.push({
        name: 'The Provisioner',
        role: 'Infrastructure as Code Manager',
        agent_type: 'LlmAgent',
        capabilities: ['infrastructure_provisioning', 'terraform', 'kubernetes', 'deployment', 'scaling'],
        description: 'Provisions cloud infrastructure, manages Kubernetes clusters, handles deployment automation',
        tools_needed: ['Terraform', 'Kubectl', 'AWS/GCP/Azure CLI'],
        integration_pattern: 'coordinator_dispatcher',
        communication_mechanism: ['llm_delegation', 'agent_tool'],
        example_use_case: 'Comptroller calculates resource needs → Provisioner creates infrastructure → Administrator configures access',
      });
    }

    if (gap.missing_capability.includes('Literature Review')) {
      suggestions.push({
        name: 'The Librarian',
        role: 'Automated Literature Review and Citation Analysis',
        agent_type: 'LlmAgent',
        capabilities: ['literature_search', 'citation_analysis', 'paper_summarization', 'knowledge_graph'],
        description: 'Searches academic databases, analyzes citations, summarizes papers, builds knowledge graphs',
        tools_needed: ['Semantic Scholar API', 'arXiv API', 'Citation Network Analyzer'],
        integration_pattern: 'parallel_fanout',
        communication_mechanism: ['shared_state', 'agent_tool'],
        example_use_case: 'ParallelAgent: Librarian searches multiple databases concurrently → Synthesizes results → Experimental Designer uses insights',
      });
    }

    if (gap.missing_capability.includes('Data Quality')) {
      suggestions.push({
        name: 'The Validator',
        role: 'Data Quality Assurance and Anomaly Detection',
        agent_type: 'LlmAgent',
        capabilities: ['data_validation', 'quality_control', 'anomaly_detection', 'schema_enforcement', 'profiling'],
        description: 'Validates data schemas, detects anomalies, profiles datasets, enforces quality constraints',
        tools_needed: ['Great Expectations', 'Pandera', 'Profiling Libraries'],
        integration_pattern: 'sequential_pipeline',
        communication_mechanism: ['shared_state', 'event_escalation'],
        example_use_case: 'Before training pipeline: Validator checks data → Escalates if quality threshold not met → Blocks training',
      });
    }
  }

  // Add strategic coordinator if many agents exist
  if (request.current_agents.length + suggestions.length > 8) {
    suggestions.push({
      name: 'The Conductor',
      role: 'High-Level Workflow Coordinator',
      agent_type: 'LlmAgent',
      capabilities: ['workflow_orchestration', 'task_routing', 'priority_management', 'resource_allocation'],
      description: 'Top-level coordinator that routes complex tasks to appropriate specialist agents',
      sub_agents_needed: request.current_agents.map((a) => a.name),
      integration_pattern: 'coordinator_dispatcher',
      communication_mechanism: ['llm_delegation'],
      example_use_case: 'User: "Set up new ML project" → Conductor delegates: Archivist (DVC init) → Provisioner (infra) → CISO (security)',
    });
  }

  return suggestions;
}

/**
 * Recommend workflow optimizations using ADK patterns
 */
export function recommendWorkflows(request: OrchestratorRequest): WorkflowOptimization[] {
  const workflows: WorkflowOptimization[] = [];

  // Sequential Pipeline: Research → Budget → Security
  workflows.push({
    pattern: 'sequential_pipeline',
    workflow_type: 'SequentialAgent',
    parent_agent: 'ResearchProjectSetup',
    child_agents: ['Experimental Designer', 'Budget Agent', 'The CISO'],
    execution_order: 'sequential',
    state_keys: ['experiment_design', 'budget_plan', 'security_checklist'],
    rationale: 'Project setup requires sequential steps: design → budgeting → security',
    benefits: [
      'Clear data flow through shared state',
      'Each agent builds on previous output',
      'Easy to track progress through pipeline',
    ],
    code_example: `from google.adk.agents import SequentialAgent, LlmAgent

experiment_designer = LlmAgent(
    name="ExperimentalDesigner",
    instruction="Design experiment methodology",
    output_key="experiment_design"
)

budget_agent = LlmAgent(
    name="BudgetAgent",
    instruction="Create budget using {experiment_design}",
    output_key="budget_plan"
)

ciso = LlmAgent(
    name="CISO",
    instruction="Security audit for {experiment_design}",
    output_key="security_checklist"
)

project_setup = SequentialAgent(
    name="ResearchProjectSetup",
    sub_agents=[experiment_designer, budget_agent, ciso]
)`,
  });

  // Parallel Pattern: Data gathering
  workflows.push({
    pattern: 'parallel_fanout',
    workflow_type: 'ParallelAgent',
    parent_agent: 'DataGatheringCoordinator',
    child_agents: ['Dataset Builder', 'MLflow Agent', 'The Archivist'],
    execution_order: 'parallel',
    state_keys: ['dataset_metadata', 'experiment_logs', 'version_info'],
    rationale: 'Independent data collection tasks can run concurrently',
    benefits: [
      'Reduced latency through parallelization',
      'Independent data sources processed simultaneously',
      'Results aggregated in subsequent step',
    ],
    code_example: `from google.adk.agents import ParallelAgent, SequentialAgent, LlmAgent

dataset_builder = LlmAgent(name="DatasetBuilder", output_key="dataset_metadata")
mlflow_agent = LlmAgent(name="MLflowAgent", output_key="experiment_logs")
archivist = LlmAgent(name="Archivist", output_key="version_info")

gather_parallel = ParallelAgent(
    name="ParallelGathering",
    sub_agents=[dataset_builder, mlflow_agent, archivist]
)

synthesizer = LlmAgent(
    name="Synthesizer",
    instruction="Combine {dataset_metadata}, {experiment_logs}, {version_info}"
)

full_workflow = SequentialAgent(
    name="DataGatheringCoordinator",
    sub_agents=[gather_parallel, synthesizer]
)`,
  });

  // Coordinator Pattern: Main dispatcher
  workflows.push({
    pattern: 'coordinator_dispatcher',
    parent_agent: 'The Conductor',
    child_agents: request.current_agents.map((a) => a.name),
    execution_order: 'conditional',
    state_keys: ['task_type', 'delegation_target'],
    rationale: 'Central coordinator routes tasks to specialized agents based on request type',
    benefits: [
      'Single entry point for users',
      'Dynamic routing based on task analysis',
      'Specialists remain modular and focused',
    ],
    code_example: `from google.adk.agents import LlmAgent

# Specialist agents
budget_agent = LlmAgent(name="BudgetAgent", description="Handles budgeting")
ciso = LlmAgent(name="CISO", description="Security operations")
dataset_builder = LlmAgent(name="DatasetBuilder", description="Dataset construction")

# Coordinator with transfer capability
conductor = LlmAgent(
    name="Conductor",
    model="gemini-2.0-flash",
    instruction="Route tasks: budgeting to BudgetAgent, security to CISO, datasets to DatasetBuilder",
    sub_agents=[budget_agent, ciso, dataset_builder],
    # AutoFlow enables LLM-driven delegation via transfer_to_agent()
)
# User: "Create a budget" → Conductor transfers to BudgetAgent
# User: "Security audit" → Conductor transfers to CISO`,
  });

  // Generator-Critic: Quality assurance
  workflows.push({
    pattern: 'generator_critic',
    workflow_type: 'SequentialAgent',
    parent_agent: 'QualityAssuredOutput',
    child_agents: ['Dataset Builder', 'The Validator'],
    execution_order: 'sequential',
    state_keys: ['generated_dataset', 'validation_report'],
    rationale: 'Generated artifacts should be validated before use',
    benefits: [
      'Quality gates prevent bad data propagation',
      'Automated review reduces manual oversight',
      'Validation feedback improves generation',
    ],
    code_example: `from google.adk.agents import SequentialAgent, LlmAgent

generator = LlmAgent(
    name="DatasetBuilder",
    instruction="Generate training dataset",
    output_key="generated_dataset"
)

validator = LlmAgent(
    name="Validator",
    instruction="Validate {generated_dataset} quality. Output 'pass' or 'fail'",
    output_key="validation_report"
)

qa_pipeline = SequentialAgent(
    name="QualityAssuredOutput",
    sub_agents=[generator, validator]
)`,
  });

  // Iterative Refinement: Model tuning
  workflows.push({
    pattern: 'iterative_refinement',
    workflow_type: 'LoopAgent',
    parent_agent: 'ModelRefinementLoop',
    child_agents: ['Experimental Designer', 'The Sentinel', 'StopChecker'],
    execution_order: 'sequential',
    state_keys: ['current_model_config', 'performance_metrics', 'refinement_status'],
    rationale: 'Model hyperparameters require iterative tuning until performance threshold met',
    benefits: [
      'Automated hyperparameter search',
      'Stops when quality threshold reached',
      'Progressive improvement tracked in state',
    ],
    code_example: `from google.adk.agents import LoopAgent, LlmAgent, BaseAgent
from google.adk.events import Event, EventActions

designer = LlmAgent(
    name="ExperimentalDesigner",
    instruction="Refine model config in {current_model_config}",
    output_key="current_model_config"
)

sentinel = LlmAgent(
    name="Sentinel",
    instruction="Evaluate model performance. Save metrics.",
    output_key="performance_metrics"
)

class StopChecker(BaseAgent):
    async def _run_async_impl(self, ctx):
        metrics = ctx.session.state.get("performance_metrics", {})
        meets_threshold = metrics.get("accuracy", 0) >= 0.95
        yield Event(author=self.name, actions=EventActions(escalate=meets_threshold))

refinement_loop = LoopAgent(
    name="ModelRefinementLoop",
    max_iterations=10,
    sub_agents=[designer, sentinel, StopChecker(name="StopChecker")]
)`,
  });

  return workflows;
}

/**
 * Design hierarchical agent structure
 */
export function designHierarchy(request: OrchestratorRequest): HierarchyRecommendation {
  const hierarchy: HierarchyRecommendation['hierarchy'] = [];

  // Level 0: Root Coordinator
  hierarchy.push({
    agent: 'The Conductor',
    level: 0,
    children: ['ResearchCluster', 'OperationsCluster', 'SecurityCluster'],
    role_in_hierarchy: 'Top-level task router and workflow orchestrator',
  });

  // Level 1: Domain Clusters
  hierarchy.push({
    agent: 'ResearchCluster',
    level: 1,
    parent: 'The Conductor',
    children: ['Experimental Designer', 'Dataset Builder', 'MLflow Agent', 'LLM-Rubric Architect'],
    role_in_hierarchy: 'Coordinates research methodology and experimentation',
  });

  hierarchy.push({
    agent: 'OperationsCluster',
    level: 1,
    parent: 'The Conductor',
    children: ['The Comptroller', 'The Administrator', 'Budget Agent'],
    role_in_hierarchy: 'Manages resource allocation and organizational governance',
  });

  hierarchy.push({
    agent: 'SecurityCluster',
    level: 1,
    parent: 'The Conductor',
    children: ['The CISO'],
    role_in_hierarchy: 'Handles all security, compliance, and risk management',
  });

  // Level 2: Specialist Agents (already defined above in children arrays)
  const specialists = [
    'Experimental Designer',
    'Dataset Builder',
    'MLflow Agent',
    'LLM-Rubric Architect',
    'The Comptroller',
    'The Administrator',
    'Budget Agent',
    'The CISO',
  ];

  for (const specialist of specialists) {
    const parent = hierarchy.find((h) => h.children.includes(specialist));
    hierarchy.push({
      agent: specialist,
      level: 2,
      parent: parent?.agent,
      children: [],
      role_in_hierarchy: 'Specialist execution agent',
    });
  }

  return {
    root_agent: 'The Conductor',
    hierarchy,
    delegation_strategy: 'LLM-driven delegation from Conductor to clusters, then clusters to specialists. Use transfer_to_agent() for dynamic routing based on task analysis.',
    state_management_approach: 'Shared session state for data flow. Each specialist uses output_key to save results. Clusters aggregate results from specialists.',
  };
}

/**
 * Main function to generate orchestrator output
 */
export function generateOrchestratorOutput(request: OrchestratorRequest): OrchestratorOutput {
  const gaps = request.analyze_gaps !== false ? analyzeCapabilityGaps(request) : [];
  const suggestions = gaps.length > 0 ? generateAgentSuggestions(gaps, request) : [];
  const workflows = request.suggest_workflows !== false ? recommendWorkflows(request) : [];
  const hierarchy = request.suggest_hierarchy !== false ? designHierarchy(request) : undefined;

  return {
    analysis: {
      current_swarm_size: request.current_agents.length,
      capability_coverage: Array.from(
        new Set(request.current_agents.flatMap((a) => a.capabilities))
      ),
      identified_gaps: gaps,
      redundancies: [], // Could analyze for overlapping capabilities
    },
    agent_suggestions: suggestions,
    workflow_optimizations: workflows,
    hierarchy_recommendation: hierarchy,
    integration_guide: {
      new_agent_integration_steps: [
        '1. Define agent class inheriting from BaseAgent or LlmAgent',
        '2. Specify capabilities, description, and tools',
        '3. Add to appropriate parent agent via sub_agents parameter',
        '4. Configure communication: output_key for state, or AgentTool for explicit calls',
        '5. Test isolation: Verify agent works standalone before integration',
        '6. Update hierarchy: Ensure parent can delegate to new agent (via description for LLM transfer)',
        '7. Deploy: Add to MCP server tool registry',
      ],
      communication_patterns: [
        'Shared State: Use output_key to write, {state_key} in instructions to read',
        'LLM Delegation: Configure sub_agents and clear descriptions for transfer_to_agent()',
        'AgentTool: Wrap agent in AgentTool, add to parent tools list for explicit invocation',
        'Event Escalation: Use EventActions(escalate=True) to signal workflow termination',
      ],
      state_management_best_practices: [
        'Use descriptive state keys: "experiment_design" not "data"',
        'Document state schema in agent descriptions',
        'Clean up temp state after workflow completion',
        'Use namespaced keys for parallel agents to avoid conflicts',
        'Validate state before critical operations',
      ],
    },
    adk_primitives_used: [
      {
        primitive: 'SequentialAgent',
        purpose: 'Execute agents in fixed order for pipelines',
        implementation_note: 'Pass InvocationContext sequentially, enables state sharing',
      },
      {
        primitive: 'ParallelAgent',
        purpose: 'Execute independent agents concurrently',
        implementation_note: 'Different branches per child, but shared session.state',
      },
      {
        primitive: 'LoopAgent',
        purpose: 'Iterate agents until condition met or max_iterations',
        implementation_note: 'Use EventActions(escalate=True) to break loop',
      },
      {
        primitive: 'LLM-Driven Delegation (transfer_to_agent)',
        purpose: 'Dynamic task routing based on LLM understanding',
        implementation_note: 'Requires clear agent descriptions and sub_agents configuration',
      },
      {
        primitive: 'AgentTool',
        purpose: 'Explicit agent invocation as a callable tool',
        implementation_note: 'Wrap agent in AgentTool, add to parent tools list',
      },
      {
        primitive: 'Shared Session State',
        purpose: 'Pass data between agents in same invocation',
        implementation_note: 'Use output_key to write, read via context.state.get()',
      },
    ],
  };
}
