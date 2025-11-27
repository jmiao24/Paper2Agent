/**
 * Operations Agents Types
 * For The Comptroller and The Administrator
 */

// The Comptroller Types
export interface ResourceLedger {
  labor_matrix: Array<{
    name: string;
    hourly_rate: number;
    skills: string[];
    availability_hours: number;
  }>;
  task_list: Array<{
    id: string;
    dependencies: string[];
    estimated_duration: number;
    required_skills: string[];
  }>;
  financial_stream: {
    receipts: Array<{ date: string; amount: number; category: string }>;
    invoices: Array<{ vendor: string; amount: number; due_date: string }>;
  };
}

export interface OptimizationProtocol {
  name: 'alpha' | 'beta' | 'gamma';
  description: string;
  constraints: {
    budget_cap?: number;
    hard_deadline?: string;
    quality_threshold?: number;
  };
}

export interface ComptrollerRequest {
  total_budget_cap: number;
  hard_deadline: string;
  primary_resource_sink: string;
  team_size?: number;
  ledger_data?: ResourceLedger;
}

export interface ComptrollerNotebook {
  title: string;
  cells: Array<{
    type: 'markdown' | 'code';
    content: string;
  }>;
  brutalist_style: boolean;
}

// The Administrator Types
export interface GovernanceParameters {
  project_scope: string;
  team_locations: string[];
  key_risks: string[];
  team_size: 'small' | 'medium' | 'large';
  domain: 'interdisciplinary' | 'niche';
}

export interface OrganizationalStructure {
  type: 'matrix' | 'projectized' | 'functional';
  hierarchy: Array<{
    role: string;
    reports_to?: string;
    responsibilities: string[];
  }>;
}

export interface CommunicationProtocol {
  golden_hours: Array<{ start: string; end: string; timezone: string }>;
  async_first: boolean;
  primary_platforms: string[];
  escalation_path: string[];
}

export interface StandardOperatingProcedure {
  title: string;
  security_level: 'LOW' | 'MEDIUM' | 'HIGH';
  sections: Array<{
    number: string;
    title: string;
    content: string;
  }>;
}

export interface AdministratorRequest {
  team_size: number;
  domain: 'ai_research' | 'ml_engineering' | 'data_science' | 'interdisciplinary';
  distributed_locations?: string[];
  regulatory_constraints?: string[];
  project_scope?: string;
  team_locations?: string[];
  key_risks?: string[];
}

export interface AdministratorNotebook {
  title: string;
  cells: Array<{
    type: 'markdown' | 'code';
    content: string;
  }>;
  brutalist_style: boolean;
}

// A2A Protocol Compliance
export interface AgentCard {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  skills: string[];
  service_endpoint: string;
  authentication: {
    type: 'apiKey' | 'oauth2' | 'openid';
    description: string;
  };
}

export interface A2AMessage {
  jsonrpc: '2.0';
  method: string;
  params?: Record<string, any>;
  id: string | number;
}

export interface A2ATask {
  task_id: string;
  description: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed';
  messages: A2AMessage[];
}
