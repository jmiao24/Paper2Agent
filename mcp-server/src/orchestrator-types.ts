/**
 * The Orchestrator Agent Types
 * Meta-agent for swarm analysis, optimization, and agent recommendations
 */

export type AgentPatternType =
  | 'coordinator_dispatcher'
  | 'sequential_pipeline'
  | 'parallel_fanout'
  | 'hierarchical_decomposition'
  | 'generator_critic'
  | 'iterative_refinement'
  | 'human_in_loop';

export type CommunicationMechanism =
  | 'shared_state'
  | 'llm_delegation'
  | 'agent_tool'
  | 'event_escalation';

export type WorkflowAgentType =
  | 'SequentialAgent'
  | 'ParallelAgent'
  | 'LoopAgent';

export interface CurrentAgent {
  name: string;
  type: 'llm' | 'workflow' | 'custom';
  capabilities: string[];
  description: string;
  sub_agents?: string[];
}

export interface CapabilityGap {
  domain: string;
  missing_capability: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  rationale: string;
  impact: string;
}

export interface AgentSuggestion {
  name: string;
  role: string;
  agent_type: 'LlmAgent' | 'WorkflowAgent' | 'CustomAgent';
  capabilities: string[];
  description: string;
  tools_needed?: string[];
  sub_agents_needed?: string[];
  integration_pattern: AgentPatternType;
  communication_mechanism: CommunicationMechanism[];
  example_use_case: string;
}

export interface WorkflowOptimization {
  pattern: AgentPatternType;
  workflow_type?: WorkflowAgentType;
  parent_agent: string;
  child_agents: string[];
  execution_order?: 'sequential' | 'parallel' | 'conditional';
  state_keys: string[];
  rationale: string;
  benefits: string[];
  code_example: string;
}

export interface HierarchyRecommendation {
  root_agent: string;
  hierarchy: {
    agent: string;
    level: number;
    parent?: string;
    children: string[];
    role_in_hierarchy: string;
  }[];
  delegation_strategy: string;
  state_management_approach: string;
}

export interface OrchestratorRequest {
  current_agents: CurrentAgent[];
  project_goals: string[];
  research_domains?: string[];
  team_size?: number;
  optimization_focus: 'performance' | 'modularity' | 'maintainability' | 'scalability' | 'all';
  analyze_gaps?: boolean;
  suggest_workflows?: boolean;
  suggest_hierarchy?: boolean;
}

export interface OrchestratorOutput {
  analysis: {
    current_swarm_size: number;
    capability_coverage: string[];
    identified_gaps: CapabilityGap[];
    redundancies?: string[];
  };
  agent_suggestions: AgentSuggestion[];
  workflow_optimizations: WorkflowOptimization[];
  hierarchy_recommendation?: HierarchyRecommendation;
  integration_guide: {
    new_agent_integration_steps: string[];
    communication_patterns: string[];
    state_management_best_practices: string[];
  };
  adk_primitives_used: {
    primitive: string;
    purpose: string;
    implementation_note: string;
  }[];
}
