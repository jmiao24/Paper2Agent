/**
 * forensic-analyst-types.ts
 *
 * The Forensic Analyst v1.0.0
 * Transcript analysis with DSMMD taxonomy for neural forensics
 *
 * Capabilities:
 * - Multi-format transcript ingestion (JSON, structured text, plain)
 * - DSMMD anomaly detection (110.1, 140.1, 140.3, 155.2, SB-1)
 * - Forensic report generation
 * - Timeline visualization
 * - Evidence grading (E1-E4)
 */

export type TranscriptFormat =
  | 'json'          // JSON array of messages
  | 'structured'    // User:/Assistant: format
  | 'plain'         // Raw text
  | 'auto';         // Auto-detect format

export type DSMMDCode =
  | '110.1'         // Confabulated Authority (impossible tool claims)
  | '140.1'         // Metadata Leakage (serialization artifacts)
  | '140.3'         // Genre Rupture (narrative frame breaks)
  | '155.2'         // Context Collapse (conflation of evaluation/production)
  | 'SB-1';         // Split-Brain Dissociation (behavior/explanation decoupling)

export type AnomalySeverity = 'critical' | 'high' | 'medium' | 'low';

export type EvidenceGrade =
  | 'E1'            // Phenomenological (transcript observation)
  | 'E2'            // Behavioral (systematic induction)
  | 'E3'            // Computational (circuit localization)
  | 'E4';           // Mechanistic (causal intervention)

export interface TranscriptTurn {
  turn_number: number;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp?: string;
  metadata?: {
    model?: string;
    temperature?: number;
    context_length?: number;
    tool_calls?: string[];
  };
}

export interface ForensicAnomaly {
  turn_number: number;
  dsmmd_code: DSMMDCode;
  severity: AnomalySeverity;
  evidence_grade: EvidenceGrade;
  description: string;
  quoted_text: string;
  detection_method: string;
  confidence: number;  // 0.0 - 1.0
  related_turns?: number[];  // Turns with related anomalies
}

export interface DSMMDDetector {
  code: DSMMDCode;
  name: string;
  description: string;
  detection_patterns: {
    regex_patterns?: RegExp[];
    semantic_indicators?: string[];
    behavioral_signatures?: string[];
  };
  severity_heuristics: {
    critical_threshold?: number;
    context_amplifiers?: string[];  // Phrases that increase severity
  };
}

export interface ForensicAnalystRequest {
  // Required: Transcript data
  transcript: {
    source: 'text' | 'file_reference' | 'inline';
    format?: TranscriptFormat;  // Default: 'auto'
    content?: string;           // For inline transcripts
    file_reference?: string;    // For file-based transcripts
  };

  // Optional: Analysis configuration
  analysis_config?: {
    detectors?: DSMMDCode[];    // Which DSMMD codes to check (default: all)
    min_confidence?: number;    // Filter anomalies below threshold (default: 0.5)
    context_window?: number;    // Turns to include around anomalies (default: 3)
    enable_clustering?: boolean; // Group related anomalies (default: true)
  };

  // Optional: Output preferences
  output_config?: {
    include_notebook?: boolean;      // Generate Google Colab notebook (default: true)
    include_ascii_report?: boolean;  // Generate text report (default: true)
    include_timeline?: boolean;      // Generate plotly timeline (default: true)
    export_format?: 'json' | 'csv' | 'html';
  };

  // Optional: Evidence grading context
  evidence_context?: {
    specimen_name?: string;     // e.g., "Sediment/Juno"
    model_family?: string;      // e.g., "GPT-4o", "Gemma-2 27B"
    is_production?: boolean;    // Production vs. experimental context
    prior_evidence?: EvidenceGrade; // Existing evidence grade for this specimen
  };
}

export interface TranscriptStatistics {
  total_turns: number;
  user_turns: number;
  assistant_turns: number;
  system_turns: number;
  avg_turn_length: number;
  total_tokens_estimate: number;
  conversation_duration?: string;
  model_detected?: string;
}

export interface DSMMDSummary {
  total_anomalies: number;
  by_code: Record<DSMMDCode, number>;
  by_severity: Record<AnomalySeverity, number>;
  critical_turns: number[];
  clustering_summary?: {
    num_clusters: number;
    largest_cluster: {
      turn_range: [number, number];
      dominant_code: DSMMDCode;
      anomaly_count: number;
    };
  };
}

export interface ForensicVerdict {
  overall_assessment: 'clean' | 'minor_anomalies' | 'significant_concern' | 'critical_failure';
  confidence: number;
  primary_diagnosis?: DSMMDCode;
  split_brain_likelihood?: number;  // 0.0-1.0 for SB-1 diagnosis
  evidence_grade: EvidenceGrade;
  recommendation: string;
  next_steps: string[];
}

export interface NotebookCell {
  type: 'markdown' | 'code';
  content: string;
  metadata?: {
    collapsed?: boolean;
    execution_count?: number | null;
  };
}

export interface ForensicAnalystOutput {
  // Metadata
  specimen_name: string;
  analysis_timestamp: string;
  evidence_grade: EvidenceGrade;

  // Transcript parsing results
  transcript_statistics: TranscriptStatistics;
  turns: TranscriptTurn[];

  // Anomaly detection results
  anomalies: ForensicAnomaly[];
  dsmmd_summary: DSMMDSummary;

  // Forensic verdict
  verdict: ForensicVerdict;

  // Outputs
  ascii_report?: string;
  notebook?: {
    title: string;
    subtitle: string;
    cells: NotebookCell[];
    metadata: {
      analysis_mode: 'forensic_transcript';
      dsmmd_version: string;
      generated_at: string;
      version: string;
    };
  };

  // Export data
  timeline_data?: {
    turns: number[];
    codes: string[];
    severities: string[];
    descriptions: string[];
  };

  // Actionable insights
  insights: string[];
  recommendations: string[];
}

export interface AgentCard {
  name: string;
  version: string;
  description: string;
  capabilities: string[];
  input_schema: string;
  output_schema: string;
  dependencies?: string[];
  model_requirements?: string;
}
