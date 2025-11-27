/**
 * LLM-Rubric Architect Types
 * Based on Hashemi et al. (ACL 2024) and the Perspectivist Safety Stack
 */

export interface InsiderProfile {
  region?: string;
  culture?: string;
  domain?: string;
  notes?: string;
  [key: string]: string | undefined;
}

export interface QuestionDefinition {
  id: string;
  text: string;
  response_options: string[];
  weight: number;
  ordinal?: boolean;
}

export interface DimensionDefinition {
  id: string;
  name: string;
  description?: string;
  questions: QuestionDefinition[];
}

export interface AggregationConfig {
  formula: string;
  orientation: 'higher_means_more_risk' | 'lower_means_more_risk';
  calibration_method?: 'linear' | 'ordinal' | 'none';
}

export interface VisualizationConfig {
  maps?: boolean;
  prosody?: boolean;
  neural_tracing?: boolean;
  emoji_sentiment?: boolean;
}

export interface RubricSchema {
  phenomenon: string;
  insider_profile: InsiderProfile;
  dimensions: DimensionDefinition[];
  aggregation: AggregationConfig;
  viz_config?: VisualizationConfig;
}

export interface QuestionResult {
  qid: string;
  probs: Record<string, number>;
}

export interface RubricGenerationRequest {
  phenomenon: string;
  insider_profile?: InsiderProfile;
  include_python?: boolean;
  include_dashboard_spec?: boolean;
  include_prompt_template?: boolean;
}

export interface PythonRuntime {
  code: string;
  dependencies: string[];
}

export interface DashboardSpec {
  layout: string;
  components: Array<{
    type: string;
    config: Record<string, any>;
  }>;
}

export interface PromptTemplate {
  system_prompt: string;
  user_template: string;
  output_format: string;
}

export interface RubricArtifacts {
  schema: RubricSchema;
  python_runtime?: PythonRuntime;
  dashboard_spec?: DashboardSpec;
  prompt_template?: PromptTemplate;
}
