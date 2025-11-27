/**
 * Budget Agent Types
 * For research budgeting, grant proposals, and investor decks
 */

export type BudgetAudience = 'grant' | 'investor';
export type ResearchType = 'academic' | 'corporate' | 'startup' | 'nonprofit';
export type FundingAgency = 'NIH' | 'NSF' | 'DARPA' | 'DOE' | 'VC' | 'angel' | 'internal' | 'other';

export interface DirectCosts {
  salaries_wages: {
    principal_investigator: number;
    research_assistants: number;
    project_managers: number;
    data_scientists: number;
    ml_engineers: number;
  };
  fringe_benefits: number; // Calculated as % of salaries
  equipment: {
    compute_infrastructure: number; // GPUs, servers
    software_licenses: number;
    other_equipment: number;
  };
  travel: {
    conferences: number;
    field_work: number;
    collaboration: number;
  };
  data_costs: {
    acquisition: number;
    labeling: number;
    quality_control: number;
    governance: number;
  };
  compute_costs: {
    cloud_services: number; // AWS, GCP, Azure
    api_usage: number; // Per-token, per-call
    storage: number;
  };
  supplies_materials: number;
  other_direct_costs: {
    publication_fees: number;
    consultant_services: number;
    ethics_review: number;
  };
}

export interface IndirectCosts {
  rate: number; // Institutional F&A rate (usually 50-60%)
  base_amount: number;
  total: number;
}

export interface ContingencyFund {
  percentage: number; // 10-15% recommended
  amount: number;
  justification: string;
}

export interface BudgetMetrics {
  // For grants
  total_project_cost?: number;
  cost_per_aim?: number;
  cost_per_year?: number;

  // For investors
  monthly_recurring_revenue?: number;
  annual_recurring_revenue?: number;
  customer_acquisition_cost?: number;
  lifetime_value?: number;
  ltv_cac_ratio?: number;
  churn_rate?: number;
  net_revenue_retention?: number;
  gross_margin?: number;
}

export interface BudgetTemplate {
  audience: BudgetAudience;
  research_type: ResearchType;
  funding_agency?: FundingAgency;
  project_duration_years: number;
  direct_costs: DirectCosts;
  indirect_costs: IndirectCosts;
  contingency: ContingencyFund;
  total_budget: number;
  metrics: BudgetMetrics;
  justification: string;
}

export interface BudgetComparison {
  grant_version: BudgetTemplate;
  investor_version: BudgetTemplate;
  key_differences: Array<{
    category: string;
    grant_approach: string;
    investor_approach: string;
    rationale: string;
  }>;
}

export interface BudgetAnalysisRequest {
  research_description: string;
  audience: BudgetAudience;
  research_type?: ResearchType;
  funding_agency?: FundingAgency;
  project_duration_years?: number;
  estimated_team_size?: number;
  generate_comparison?: boolean; // Generate both grant and investor versions
}

export interface ROIProjection {
  service_type: 'benchmark' | 'red_team' | 'consulting' | 'saas' | 'other';
  cost_savings: number;
  revenue_uplift: number;
  avoided_losses: number;
  productivity_gains: number;
  total_roi_percentage: number;
  payback_period_months: number;
}

export interface BudgetGuidance {
  best_practices: string[];
  template_sources: string[];
  key_considerations: string[];
  common_pitfalls: string[];
  emerging_trends: string[];
}
