/**
 * The CISO Agent Types
 * Chief Information Security Officer and Digital Defense Architect
 */

import type { AgentCard } from './operations-agents-types.js';

export type ThreatModelType = 'nation_state' | 'ransomware_gang' | 'script_kiddie' | 'insider_threat' | 'supply_chain';
export type OperationalMode = 'preventative' | 'active_crisis' | 'post_incident';
export type IncidentType = 'account_takeover' | 'ransomware' | 'data_exfiltration' | 'ddos' | 'social_engineering' | 'supply_chain_compromise';
export type SeverityLevel = 'SEV-0' | 'SEV-1' | 'SEV-2' | 'SEV-3';

export interface HighValueAsset {
  name: string;
  category: 'data' | 'infrastructure' | 'intellectual_property' | 'credentials';
  sensitivity: 'public' | 'internal' | 'confidential' | 'restricted';
  description?: string;
}

export interface AttackSurface {
  name: string;
  type: 'network' | 'application' | 'human' | 'physical' | 'supply_chain';
  exposure: 'internet_facing' | 'internal' | 'partner_access' | 'remote_workforce';
  description?: string;
}

export interface STRIDEThreat {
  category: 'Spoofing' | 'Tampering' | 'Repudiation' | 'Information_Disclosure' | 'Denial_of_Service' | 'Elevation_of_Privilege';
  asset: string;
  surface: string;
  risk_score: number; // 0-10
  mitigation: string;
}

export interface IncidentResponseProtocol {
  incident_type: IncidentType;
  severity: SeverityLevel;
  containment_steps: string[];
  investigation_steps: string[];
  recovery_steps: string[];
  communication_plan: string[];
}

export interface CryptographyConfig {
  key_rotation_interval_days: number;
  hash_algorithm: 'SHA-256' | 'SHA-512' | 'Argon2';
  use_salt: boolean;
  key_derivation: 'PBKDF2' | 'scrypt' | 'Argon2';
}

export interface PhishingTemplate {
  scenario: string;
  sender_spoofing: string;
  urgency_tactic: string;
  verification_bypass: string;
  detection_markers: string[];
}

export interface CISORequest {
  high_value_assets: HighValueAsset[];
  attack_surfaces: AttackSurface[];
  threat_model: ThreatModelType[];
  operational_mode: OperationalMode;
  regulatory_requirements?: string[]; // e.g., HIPAA, GDPR, SOC2
  team_size?: number;
  budget_constraint?: 'startup' | 'enterprise' | 'government';
}

export interface CISONotebook {
  title: string;
  cells: Array<{
    type: 'markdown' | 'code';
    content: string;
  }>;
  brutalist_style: boolean;
  zero_trust_mode: boolean;
}

export interface ThreatModelOutput {
  stride_threats: STRIDEThreat[];
  kill_list: string[]; // Prioritized vulnerabilities
  risk_heatmap_code: string;
}

export interface IncidentResponseOutput {
  protocols: IncidentResponseProtocol[];
  panic_button_code: string;
  kill_switch_procedures: string[];
}

export interface CryptographyOutput {
  key_rotation_code: string;
  sanitization_code: string;
  secret_generation_code: string;
}

export interface SocialEngineeringOutput {
  phishing_templates: PhishingTemplate[];
  verification_checklist: string[];
  red_team_scenarios: string[];
}
