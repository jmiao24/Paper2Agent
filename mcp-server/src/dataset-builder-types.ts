/**
 * Dataset Builder Agent Types
 * For constructing single-turn and multi-turn datasets for AI/ML training
 */

export type DatasetFormat = 'sft' | 'dpo' | 'inputs';
export type DatasetType = 'single_turn' | 'multi_turn';
export type MessageRole = 'system' | 'user' | 'assistant';

export interface Message {
  role: MessageRole;
  content: string;
}

export interface SingleTurnEntry {
  prompt: string;
  completion: string;
  metadata?: Record<string, any>;
}

export interface MultiTurnResponse {
  completion: string;
  score?: number;
}

export interface MultiTurnTurn {
  prompt: Message[];
  responses: MultiTurnResponse[];
}

export interface MultiTurnEntryNested {
  single_turn_prompt: string;
  single_turn_completion: string;
  single_turn_metadata?: Record<string, any>;
  turns: MultiTurnTurn[];
}

export interface MultiTurnEntryFlat {
  prompt: Message[];
  completion: string;
  conv_id: number | string;
  score?: number;
  single_turn_prompt?: string;
  single_turn_completion?: string;
  single_turn_metadata?: Record<string, any>;
}

export interface DatasetBuilderRequest {
  dataset_type: DatasetType;
  input_format: 'nested' | 'flat' | 'huggingface';
  data?: SingleTurnEntry[] | MultiTurnEntryNested[] | MultiTurnEntryFlat[];
  huggingface_repo?: string;
  local_directory?: string;
  output_formats: DatasetFormat[];
  config?: {
    eval_ratio?: number;
    seed?: number;
    add_system_prompt?: boolean;
    system_prompt?: string;
    // SFT config
    sft_lower_bound_metric?: string;
    sft_lower_bound?: number;
    // DPO config
    dpo_minimum_gap?: number;
    dpo_score_metric?: string;
  };
}

export interface SFTDatasetSpec {
  format: 'sft';
  description: 'Supervised Fine-Tuning format with messages array';
  structure: {
    messages: Message[];
  };
  filtering: {
    lower_bound_metric?: string;
    lower_bound?: number;
  };
}

export interface DPODatasetSpec {
  format: 'dpo';
  description: 'Direct Preference Optimization format with chosen/rejected pairs';
  structure: {
    prompt: Message[];
    chosen: string;
    rejected: string;
    score_chosen: number;
    score_rejected: number;
  };
  filtering: {
    minimum_gap: number;
    score_metric?: string;
  };
}

export interface InputsDatasetSpec {
  format: 'inputs';
  description: 'Input prompts for model evaluation or generation';
  structure: {
    prompt: Message[];
    single_turn_prompt: string;
    single_turn_completion: string;
    single_turn_metadata: Record<string, any>;
  };
}

export interface DatasetCodeExample {
  language: 'python';
  library: 'collabllm' | 'huggingface';
  operation: 'create' | 'load' | 'convert' | 'filter';
  code: string;
  description: string;
}

export interface DatasetBuilderOutput {
  dataset_type: DatasetType;
  input_format: string;
  dataset_specs: Array<SFTDatasetSpec | DPODatasetSpec | InputsDatasetSpec>;
  code_examples: DatasetCodeExample[];
  data_statistics: {
    total_entries?: number;
    total_conversations?: number;
    total_turns?: number;
    estimated_train_size?: number;
    estimated_eval_size?: number;
    dpo_pair_ratio?: number;
  };
  best_practices: string[];
  warnings: string[];
}

export interface DatasetQualityMetrics {
  retention_ratio?: number;
  filtered_count?: number;
  score_distribution?: {
    min: number;
    max: number;
    mean: number;
    median: number;
  };
  gap_statistics?: {
    min_gap: number;
    max_gap: number;
    mean_gap: number;
  };
}
