/**
 * visual-inspector-types.ts
 *
 * The Visual Inspector v1.0.0
 * FiftyOne-powered dataset visualization and quality assessment
 *
 * Integrates FiftyOne for:
 * - Interactive dataset exploration
 * - Label quality assessment (mistakenness)
 * - Model evaluation (mAP, precision/recall)
 * - Data curation (uniqueness, hardness)
 */

export type VisualizationMode =
  | 'exploration'        // General dataset browsing
  | 'quality_check'      // Label mistake detection
  | 'model_evaluation'   // Performance analysis
  | 'data_curation'      // Uniqueness/hardness filtering
  | 'annotation_debug';  // FP/FN investigation

export type DatasetType =
  | 'classification'     // Image classification
  | 'detection'          // Object detection
  | 'segmentation'       // Instance/semantic segmentation
  | 'keypoints'          // Pose estimation
  | 'multi_label'        // Multi-label classification
  | 'video';             // Video understanding

export type EvaluationMetric =
  | 'mAP'                // Mean Average Precision (detection)
  | 'precision_recall'   // PR curves
  | 'confusion_matrix'   // Class confusion
  | 'f1_score'           // Harmonic mean
  | 'top_k_accuracy'     // Top-k accuracy (classification)
  | 'iou'                // Intersection over Union
  | 'detection_curves';  // Precision-recall-confidence curves

export type BrainMethod =
  | 'uniqueness'         // Image similarity/uniqueness
  | 'mistakenness'       // Label mistake likelihood
  | 'hardness'           // Sample training difficulty
  | 'similarity'         // Visual similarity search
  | 'visualization';     // Dimensionality reduction (UMAP/t-SNE)

export interface DatasetConfig {
  dataset_name: string;
  dataset_type: DatasetType;
  data_source: {
    type: 'local' | 'huggingface' | 'zoo' | 'custom';
    path?: string;                    // Local path or HF dataset ID
    zoo_name?: string;                // FiftyOne Zoo dataset name
    split?: string;                   // train/val/test
  };
  label_field?: string;               // Ground truth field name
  prediction_field?: string;          // Model predictions field name
  image_field?: string;               // Image path field (default: 'filepath')
}

export interface ViewConfiguration {
  filters?: ViewFilter[];
  sort_by?: {
    field: string;
    reverse: boolean;
  };
  limit?: number;
  match?: {
    field: string;
    value: any;
  };
  exclude_fields?: string[];
}

export interface ViewFilter {
  type: 'label_confidence' | 'field_value' | 'sample_tags' | 'label_tags' | 'exists';
  field: string;
  operator: '>' | '<' | '>=' | '<=' | '==' | '!=' | 'in' | 'contains';
  value: any;
}

export interface EvaluationConfig {
  gt_field: string;                   // Ground truth label field
  pred_field: string;                 // Prediction label field
  metrics: EvaluationMetric[];
  eval_key?: string;                  // Where to store eval results
  compute_mAP?: boolean;
  iou_threshold?: number;             // For detection (default: 0.5)
  classwise?: boolean;                // Per-class metrics
  confidence_thresholds?: number[];   // For PR curves
}

export interface BrainConfig {
  method: BrainMethod;
  model?: string;                     // Embedding model for similarity
  embeddings_field?: string;          // Where to store embeddings
  label_field?: string;               // For mistakenness/hardness
  prediction_field?: string;          // Reference for mistakenness
  brain_key?: string;                 // Identifier for brain results
}

export interface QualityIssue {
  sample_id: string;
  issue_type: 'mislabel' | 'duplicate' | 'outlier' | 'low_confidence' | 'false_positive' | 'false_negative';
  severity: 'critical' | 'high' | 'medium' | 'low';
  score: number;                      // Mistakenness/uniqueness/hardness score
  description: string;
  suggested_action: string;
  location?: {                        // For detection/segmentation
    bbox?: number[];                  // [x, y, w, h]
    label?: string;
  };
}

export interface VisualizationBlock {
  block_type: 'setup' | 'load_data' | 'explore' | 'evaluate' | 'brain' | 'quality_check' | 'export';
  title: string;
  code: string;
  description: string;
  outputs?: string[];                 // Expected outputs/visualizations
}

export interface VisualInspectorRequest {
  mode: VisualizationMode;
  dataset_config: DatasetConfig;

  // Optional: View configuration
  view_config?: ViewConfiguration;

  // Optional: Evaluation configuration
  evaluation_config?: EvaluationConfig;

  // Optional: Brain analytics
  brain_config?: BrainConfig;

  // Optional: Quality checking
  quality_thresholds?: {
    mistakenness_threshold?: number;  // Default: 0.8
    uniqueness_threshold?: number;    // Default: 0.1 (low uniqueness = duplicates)
    hardness_threshold?: number;      // Default: 0.9 (hard samples)
    confidence_threshold?: number;    // Default: 0.5
  };

  // Optional: Export configuration
  export_config?: {
    export_view?: boolean;            // Export filtered view
    export_format?: 'json' | 'csv' | 'coco' | 'yolo' | 'voc';
    include_embeddings?: boolean;
  };
}

export interface NotebookCell {
  type: 'markdown' | 'code';
  content: string;
  metadata?: {
    collapsed?: boolean;
    execution_count?: number | null;
  };
}

export interface VisualInspectorOutput {
  dataset_name: string;
  mode: VisualizationMode;

  // Statistics
  dataset_statistics: {
    total_samples: number;
    samples_in_view: number;
    label_distribution: Record<string, number>;
    prediction_distribution?: Record<string, number>;
  };

  // Evaluation results (if applicable)
  evaluation_results?: {
    metrics: Record<EvaluationMetric, number>;
    per_class_metrics?: Record<string, any>;
    classification_report?: string;
    confusion_matrix?: number[][];
  };

  // Brain analytics results (if applicable)
  brain_results?: {
    method: BrainMethod;
    top_samples: {
      sample_id: string;
      score: number;
      reason: string;
    }[];
    statistics: {
      mean_score: number;
      std_score: number;
      min_score: number;
      max_score: number;
    };
  };

  // Quality issues found (if applicable)
  quality_issues?: QualityIssue[];

  // Notebook with FiftyOne code
  notebook: {
    title: string;
    subtitle: string;
    cells: NotebookCell[];
    css_styling: string;
    metadata: {
      visualization_mode: VisualizationMode;
      dataset_type: DatasetType;
      generated_at: string;
      version: string;
    };
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
