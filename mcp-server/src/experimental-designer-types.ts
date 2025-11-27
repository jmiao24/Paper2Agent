/**
 * Experimental Designer Types
 * For dissecting research papers and designing new experiments
 */

export interface ResearchPaperMetadata {
  publication_date: string;
  sample_size: string;
  methodology: string;
  is_rct: boolean;
  funding_source: string;
  funding_type: 'commercial' | 'public' | 'grant' | 'unknown';
  core_inquiry: string;
  core_finding: string;
}

export interface FutureWorkItem {
  limitation: string;
  suggested_direction: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ExperimentalDesign {
  hypothesis: string;
  design: {
    type: string; // e.g., "A/B Test", "Longitudinal", "Adversarial Red-Team"
    independent_variables: string[];
    dependent_variables: string[];
    control_variables: string[];
  };
  apparatus_materials: {
    software: string[];
    datasets: string[];
    hardware_sensors: string[];
  };
  analysis_plan: {
    statistical_methods: string[];
    qualitative_frameworks: string[];
  };
  expected_impact: string;
}

export interface CodeImplementationPlan {
  replication_mode: 'replicate' | 'innovate';
  requirements: string[]; // Python packages
  architecture: {
    modules: Array<{
      name: string;
      purpose: string;
      dependencies: string[];
    }>;
    data_flow: string; // Description of data pipeline
  };
  file_structure: Record<string, string>; // filename -> purpose
  experiment_runner_pseudocode: string;
}

export interface ExperimentalDesignerRequest {
  research_text: string;
  codebase_context?: {
    github_url?: string;
    file_list?: string[];
  };
  mode?: 'replicate' | 'innovate';
}

export interface ExperimentalDesignerOutput {
  phase1_metadata: ResearchPaperMetadata;
  phase1_future_work: FutureWorkItem[];
  phase2_experimental_design: ExperimentalDesign;
  phase3_implementation: CodeImplementationPlan;
}
