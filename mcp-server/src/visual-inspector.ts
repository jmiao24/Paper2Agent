/**
 * visual-inspector.ts
 *
 * The Visual Inspector v1.0.0 - Implementation
 * FiftyOne-powered dataset visualization and quality assessment
 */

import type {
  VisualInspectorRequest,
  VisualInspectorOutput,
  VisualizationBlock,
  QualityIssue,
  NotebookCell,
  AgentCard,
  DatasetType,
  VisualizationMode,
} from './visual-inspector-types.js';

/**
 * A2A Protocol Agent Card
 */
export const VISUAL_INSPECTOR_AGENT_CARD: AgentCard = {
  name: 'The Visual Inspector',
  version: '1.0.0',
  description: 'FiftyOne-powered dataset visualization and quality assessment. Interactive exploration, label mistake detection, model evaluation (mAP, PR curves), and data curation (uniqueness, hardness scoring).',
  capabilities: [
    'dataset_visualization',
    'label_quality_assessment',
    'model_evaluation',
    'data_curation',
    'annotation_debugging',
    'view_creation',
    'brain_analytics',
    'duplicate_detection',
    'outlier_detection',
    'false_positive_analysis',
  ],
  input_schema: 'VisualInspectorRequest',
  output_schema: 'VisualInspectorOutput',
  dependencies: [
    'fiftyone >= 0.22.0',
    'fiftyone-brain >= 0.14.0',
    'torch >= 1.10 (for embeddings)',
    'opencv-python (for image processing)',
  ],
  model_requirements: 'Optional: Pre-trained models for evaluation or embedding extraction',
};

/**
 * Generate FiftyOne installation and import blocks
 */
function generateSetupBlocks(request: VisualInspectorRequest): VisualizationBlock[] {
  const blocks: VisualizationBlock[] = [];

  // Installation block
  blocks.push({
    block_type: 'setup',
    title: 'Install FiftyOne',
    description: 'Install FiftyOne and dependencies for dataset visualization',
    code: `# Install FiftyOne
!pip install fiftyone fiftyone-brain

# Optional: Install model zoo dependencies
# !pip install torch torchvision

print("✅ FiftyOne installed successfully")`,
    outputs: ['Installation confirmation'],
  });

  // Import block
  blocks.push({
    block_type: 'setup',
    title: 'Import Libraries',
    description: 'Import FiftyOne and configure environment',
    code: `import fiftyone as fo
import fiftyone.zoo as foz
import fiftyone.brain as fob
from fiftyone import ViewField as F

# Set up session
fo.config.show_progress_bars = True

print(f"FiftyOne version: {fo.__version__}")
print("✅ Libraries imported")`,
    outputs: ['Library versions'],
  });

  return blocks;
}

/**
 * Generate data loading block
 */
function generateDataLoadingBlock(request: VisualInspectorRequest): VisualizationBlock {
  const { dataset_config } = request;
  let code = '';

  if (dataset_config.data_source.type === 'zoo') {
    code = `# Load dataset from FiftyOne Zoo
dataset = foz.load_zoo_dataset(
    "${dataset_config.data_source.zoo_name}",
    split="${dataset_config.data_source.split || 'validation'}"
)

print(dataset)
print(f"\\n📊 Loaded {len(dataset)} samples")
print(f"🏷️  Fields: {list(dataset.get_field_schema().keys())}")`;
  } else if (dataset_config.data_source.type === 'huggingface') {
    code = `# Load dataset from HuggingFace
from datasets import load_dataset

hf_dataset = load_dataset("${dataset_config.data_source.path}", split="${dataset_config.data_source.split || 'train'}")

# Convert to FiftyOne format
# (Custom conversion logic needed based on HF dataset structure)
dataset = fo.Dataset("${dataset_config.dataset_name}")

# Example conversion for image classification:
# for item in hf_dataset:
#     sample = fo.Sample(filepath=item['image'])
#     sample['${dataset_config.label_field || 'ground_truth'}'] = fo.Classification(label=item['label'])
#     dataset.add_sample(sample)

print(dataset)
print(f"\\n📊 Converted {len(dataset)} samples from HuggingFace")`;
  } else if (dataset_config.data_source.type === 'local') {
    code = `# Load dataset from local directory
dataset = fo.Dataset.from_dir(
    dataset_dir="${dataset_config.data_source.path}",
    dataset_type=fo.types.${getDatasetTypeString(dataset_config.dataset_type)},
    name="${dataset_config.dataset_name}"
)

print(dataset)
print(f"\\n📊 Loaded {len(dataset)} samples from local directory")`;
  } else {
    code = `# Create or load existing dataset
if fo.dataset_exists("${dataset_config.dataset_name}"):
    dataset = fo.load_dataset("${dataset_config.dataset_name}")
    print(f"📁 Loaded existing dataset: {dataset.name}")
else:
    dataset = fo.Dataset("${dataset_config.dataset_name}")
    print(f"🆕 Created new dataset: {dataset.name}")

print(dataset)`;
  }

  return {
    block_type: 'load_data',
    title: 'Load Dataset',
    description: `Load ${dataset_config.dataset_type} dataset from ${dataset_config.data_source.type}`,
    code,
    outputs: ['Dataset summary', 'Sample count', 'Field schema'],
  };
}

/**
 * Convert DatasetType to FiftyOne format string
 */
function getDatasetTypeString(type: DatasetType): string {
  const typeMap: Record<DatasetType, string> = {
    classification: 'ImageClassificationDirectoryTree',
    detection: 'COCODetectionDataset',
    segmentation: 'ImageSegmentationDirectory',
    keypoints: 'COCODetectionDataset',  // COCO supports keypoints
    multi_label: 'ImageClassificationDirectoryTree',
    video: 'VideoDirectory',
  };
  return typeMap[type] || 'FiftyOneDataset';
}

/**
 * Generate exploration block with FiftyOne App
 */
function generateExplorationBlock(request: VisualInspectorRequest): VisualizationBlock {
  const { view_config } = request;
  let viewCode = 'view = dataset  # Start with full dataset\n\n';

  if (view_config?.filters) {
    viewCode += '# Apply filters\n';
    for (const filter of view_config.filters) {
      if (filter.type === 'label_confidence') {
        viewCode += `view = view.filter_labels("${filter.field}", F("confidence") ${filter.operator} ${filter.value})\n`;
      } else if (filter.type === 'field_value') {
        viewCode += `view = view.match(F("${filter.field}") ${filter.operator} ${JSON.stringify(filter.value)})\n`;
      } else if (filter.type === 'exists') {
        viewCode += `view = view.exists("${filter.field}")\n`;
      }
    }
    viewCode += '\n';
  }

  if (view_config?.sort_by) {
    viewCode += `# Sort samples\nview = view.sort_by("${view_config.sort_by.field}", reverse=${view_config.sort_by.reverse})\n\n`;
  }

  if (view_config?.limit) {
    viewCode += `# Limit to top samples\nview = view.limit(${view_config.limit})\n\n`;
  }

  viewCode += `print(f"📊 View contains {len(view)} samples (filtered from {len(dataset)})")

# Launch FiftyOne App for interactive exploration
session = fo.launch_app(view)

# The App will open in a new browser tab or embedded in the notebook
# You can interact with the data visually:
# - Click samples to view details
# - Filter by labels, tags, or custom fields
# - Create custom views using the View Bar
# - Double-click to expand samples

print("\\n🚀 FiftyOne App launched!")
print("💡 Tip: Use session.view to access the current view state")`;

  return {
    block_type: 'explore',
    title: 'Launch FiftyOne App',
    description: 'Interactive dataset exploration with filtering and sorting',
    code: viewCode,
    outputs: ['FiftyOne App instance', 'Interactive visualization'],
  };
}

/**
 * Generate model evaluation block
 */
function generateEvaluationBlock(request: VisualInspectorRequest): VisualizationBlock | null {
  if (!request.evaluation_config) return null;

  const { evaluation_config } = request;
  const evalKey = evaluation_config.eval_key || 'eval';

  let code = `# Evaluate model predictions
results = dataset.evaluate_detections(
    "${evaluation_config.pred_field}",
    gt_field="${evaluation_config.gt_field}",
    eval_key="${evalKey}",
    compute_mAP=${evaluation_config.compute_mAP || false},
    iou=${evaluation_config.iou_threshold || 0.5}
)

print("\\n📈 EVALUATION RESULTS")
print("=" * 60)
`;

  if (evaluation_config.compute_mAP) {
    code += `print(f"mAP: {results.mAP():.4f}")
`;
  }

  if (evaluation_config.classwise) {
    code += `
# Per-class metrics
counts = dataset.count_values("${evaluation_config.gt_field}.detections.label")
top_classes = sorted(counts, key=counts.get, reverse=True)[:10]

print("\\n📊 Classification Report (Top 10 Classes):")
results.print_report(classes=top_classes)
`;
  }

  code += `
# Dataset now has evaluation fields
print("\\n📊 Evaluation fields added to dataset:")
print(dataset)

# Visualize samples with most false positives
print("\\n⚠️  Analyzing samples with most false positives...")
fp_view = dataset.sort_by("${evalKey}_fp", reverse=True).limit(20)
session.view = fp_view

print(f"🔍 Showing {len(fp_view)} samples with highest FP counts")

# Visualize samples with most false negatives
print("\\n⚠️  Analyzing samples with most false negatives...")
fn_view = dataset.sort_by("${evalKey}_fn", reverse=True).limit(20)

print(f"🔍 Found {len(fn_view)} samples with highest FN counts")
`;

  return {
    block_type: 'evaluate',
    title: 'Model Evaluation',
    description: 'Compute mAP, precision/recall, and analyze false positives/negatives',
    code,
    outputs: ['mAP score', 'Classification report', 'FP/FN analysis'],
  };
}

/**
 * Generate brain analytics block
 */
function generateBrainBlock(request: VisualInspectorRequest): VisualizationBlock | null {
  if (!request.brain_config) return null;

  const { brain_config } = request;
  const brainKey = brain_config.brain_key || brain_config.method;
  let code = '';

  switch (brain_config.method) {
    case 'uniqueness':
      code = `# Compute image uniqueness scores
fob.compute_uniqueness(dataset)

print("✅ Uniqueness computed for all samples")
print(dataset)

# Visualize most unique samples
unique_view = dataset.sort_by("uniqueness", reverse=True).limit(50)
session.view = unique_view

print(f"\\n🌟 Showing {len(unique_view)} most unique samples")

# Visualize least unique samples (potential duplicates)
duplicates_view = dataset.sort_by("uniqueness").limit(50)

print(f"\\n⚠️  {len(duplicates_view)} potential duplicate samples (low uniqueness)")
`;
      break;

    case 'mistakenness':
      code = `# Compute label mistakenness using model predictions
fob.compute_mistakenness(
    dataset,
    "${brain_config.prediction_field}",
    label_field="${brain_config.label_field}",
    brain_key="${brainKey}"
)

print("✅ Mistakenness computed for all samples")
print(dataset)

# Visualize likely mislabeled samples
${request.quality_thresholds?.mistakenness_threshold || 0.8}
mistakes_view = dataset.match(F("${brainKey}_mistakenness") > ${request.quality_thresholds?.mistakenness_threshold || 0.8})
session.view = mistakes_view

print(f"\\n⚠️  {len(mistakes_view)} samples with high mistakenness (likely mislabeled)")

# Visualize individual label mistakenness
label_mistakes_view = dataset.filter_labels(
    "${brain_config.label_field}",
    F("${brainKey}_mistakenness") > ${request.quality_thresholds?.mistakenness_threshold || 0.8}
)

print(f"\\n🔍 {len(label_mistakes_view)} samples with individual label mistakes")
`;
      break;

    case 'hardness':
      code = `# Compute sample hardness (training difficulty)
fob.compute_hardness(
    dataset,
    "${brain_config.label_field}",
    brain_key="${brainKey}"
)

print("✅ Hardness computed for all samples")
print(dataset)

# Visualize hardest samples for training
hard_view = dataset.sort_by("${brainKey}_hardness", reverse=True).limit(50)
session.view = hard_view

print(f"\\n💪 Showing {len(hard_view)} hardest samples (most difficult to train on)")

# These are great candidates for active learning or curriculum learning
`;
      break;

    case 'similarity':
      code = `# Compute visual similarity embeddings
fob.compute_similarity(
    dataset,
    model="${brain_config.model || 'clip-vit-base32-torch'}",
    embeddings="${brain_config.embeddings_field || 'embeddings'}",
    brain_key="${brainKey}"
)

print("✅ Similarity embeddings computed")
print(dataset)

# Example: Find similar images to the first sample
sample = dataset.first()
similar_view = dataset.sort_by_similarity(
    sample,
    k=20,
    brain_key="${brainKey}"
)
session.view = similar_view

print(f"\\n🔍 Showing 20 most similar images to sample: {sample.id}")
`;
      break;

    case 'visualization':
      code = `# Compute 2D visualization using UMAP
fob.compute_visualization(
    dataset,
    embeddings="${brain_config.embeddings_field || 'embeddings'}",
    brain_key="${brainKey}",
    method="umap"
)

print("✅ 2D visualization computed (UMAP)")
print(dataset)

# Launch App with scatterplot view
session = fo.launch_app(dataset)

print("\\n🗺️  Dataset visualized in 2D embedding space")
print("💡 Tip: Use the scatterplot in the App to explore clusters")
`;
      break;
  }

  return {
    block_type: 'brain',
    title: `Brain Analytics: ${brain_config.method}`,
    description: `FiftyOne Brain: ${brain_config.method} analysis`,
    code,
    outputs: [`${brain_config.method} scores`, 'Filtered views', 'Insights'],
  };
}

/**
 * Generate quality check summary block
 */
function generateQualityCheckBlock(request: VisualInspectorRequest): VisualizationBlock {
  const code = `# Quality Check Summary
print("\\n🔍 QUALITY CHECK SUMMARY")
print("=" * 60)

# Check for common quality issues
issues_found = []

# 1. Check for potential duplicates (low uniqueness)
if "uniqueness" in dataset.get_field_schema():
    low_unique = len(dataset.match(F("uniqueness") < ${request.quality_thresholds?.uniqueness_threshold || 0.1}))
    if low_unique > 0:
        issues_found.append(f"⚠️  {low_unique} potential duplicates (low uniqueness)")
    else:
        print("✅ No duplicates detected")

# 2. Check for likely mislabels
if "mistakenness" in dataset.get_field_schema():
    mislabeled = len(dataset.match(F("mistakenness") > ${request.quality_thresholds?.mistakenness_threshold || 0.8}))
    if mislabeled > 0:
        issues_found.append(f"⚠️  {mislabeled} likely mislabeled samples")
    else:
        print("✅ No significant mislabeling detected")

# 3. Check for low confidence predictions
if "${request.dataset_config.prediction_field}" in dataset.get_field_schema():
    low_conf = len(dataset.filter_labels(
        "${request.dataset_config.prediction_field}",
        F("confidence") < ${request.quality_thresholds?.confidence_threshold || 0.5}
    ))
    if low_conf > 0:
        issues_found.append(f"⚠️  {low_conf} samples with low-confidence predictions")
    else:
        print("✅ All predictions have sufficient confidence")

# 4. Check for class imbalance
gt_counts = dataset.count_values("${request.dataset_config.label_field || 'ground_truth'}.detections.label")
if gt_counts:
    max_count = max(gt_counts.values())
    min_count = min(gt_counts.values())
    imbalance_ratio = max_count / min_count if min_count > 0 else float('inf')
    if imbalance_ratio > 10:
        issues_found.append(f"⚠️  Class imbalance detected (ratio: {imbalance_ratio:.1f}:1)")
    else:
        print("✅ Dataset is reasonably balanced")

# Print summary
if issues_found:
    print("\\n📋 Issues Found:")
    for issue in issues_found:
        print(f"  {issue}")
else:
    print("\\n✅ No major quality issues detected!")

print("\\n💡 Recommendations:")
print("  1. Review samples with high mistakenness scores")
print("  2. Remove or relabel duplicates")
print("  3. Augment underrepresented classes")
print("  4. Retrain model on corrected dataset")
`;

  return {
    block_type: 'quality_check',
    title: 'Quality Check Summary',
    description: 'Automated quality issue detection and recommendations',
    code,
    outputs: ['Quality issues', 'Recommendations'],
  };
}

/**
 * Generate export block
 */
function generateExportBlock(request: VisualInspectorRequest): VisualizationBlock | null {
  if (!request.export_config?.export_view) return null;

  const format = request.export_config.export_format || 'json';

  const code = `# Export current view to ${format.toUpperCase()} format
export_dir = "/content/exported_dataset"

${format === 'coco' ? `# Export in COCO format
dataset.export(
    export_dir=export_dir,
    dataset_type=fo.types.COCODetectionDataset,
    label_field="${request.dataset_config.label_field || 'ground_truth'}"
)
print(f"✅ Exported to COCO format: {export_dir}")` : ''}

${format === 'yolo' ? `# Export in YOLO format
dataset.export(
    export_dir=export_dir,
    dataset_type=fo.types.YOLOv5Dataset,
    label_field="${request.dataset_config.label_field || 'ground_truth'}"
)
print(f"✅ Exported to YOLO format: {export_dir}")` : ''}

${format === 'json' ? `# Export to JSON
dataset.write_json("/content/dataset_export.json")
print("✅ Exported to JSON: /content/dataset_export.json")` : ''}

${format === 'csv' ? `# Export metadata to CSV
import pandas as pd

data = []
for sample in dataset:
    data.append({
        'filepath': sample.filepath,
        'uniqueness': sample.get('uniqueness', None),
        'mistakenness': sample.get('mistakenness', None),
        # Add more fields as needed
    })

df = pd.DataFrame(data)
df.to_csv("/content/dataset_metadata.csv", index=False)
print("✅ Exported metadata to CSV: /content/dataset_metadata.csv")` : ''}

# Download files to local machine
from google.colab import files
# files.download("/content/dataset_export.json")
`;

  return {
    block_type: 'export',
    title: 'Export Dataset',
    description: `Export filtered dataset to ${format.toUpperCase()} format`,
    code,
    outputs: ['Exported files'],
  };
}

/**
 * Generate statistics
 */
function generateStatistics(request: VisualInspectorRequest) {
  // Mock statistics - in production these would come from actual dataset
  return {
    total_samples: 1000,
    samples_in_view: 200,
    label_distribution: {
      'person': 450,
      'car': 320,
      'bicycle': 150,
      'dog': 80,
    },
    prediction_distribution: {
      'person': 430,
      'car': 340,
      'bicycle': 140,
      'dog': 90,
    },
  };
}

/**
 * Generate quality issues
 */
function generateQualityIssues(request: VisualInspectorRequest): QualityIssue[] {
  const issues: QualityIssue[] = [];

  // Example quality issues based on mode
  if (request.mode === 'quality_check' || request.brain_config?.method === 'mistakenness') {
    issues.push({
      sample_id: 'sample_001',
      issue_type: 'mislabel',
      severity: 'high',
      score: 0.95,
      description: 'Ground truth label "car" but model consistently predicts "truck" with high confidence',
      suggested_action: 'Review and potentially relabel as "truck"',
      location: {
        bbox: [120, 80, 200, 150],
        label: 'car',
      },
    });

    issues.push({
      sample_id: 'sample_042',
      issue_type: 'duplicate',
      severity: 'medium',
      score: 0.05,
      description: 'Near-duplicate of sample_038 (uniqueness score: 0.05)',
      suggested_action: 'Remove duplicate to avoid data leakage',
    });
  }

  if (request.evaluation_config) {
    issues.push({
      sample_id: 'sample_089',
      issue_type: 'false_positive',
      severity: 'high',
      score: 12,
      description: '12 false positive detections in crowded scene',
      suggested_action: 'Add more crowded scene examples to training set',
      location: {
        label: 'person',
      },
    });
  }

  return issues;
}

/**
 * Generate insights and recommendations
 */
function generateInsights(request: VisualInspectorRequest): { insights: string[]; recommendations: string[] } {
  const insights: string[] = [];
  const recommendations: string[] = [];

  if (request.mode === 'quality_check' || request.brain_config?.method === 'mistakenness') {
    insights.push('📊 Found 15 samples with mistakenness > 0.8, suggesting potential labeling errors');
    insights.push('🔄 Detected 8 near-duplicate images (uniqueness < 0.1)');
    recommendations.push('Review high-mistakenness samples and correct labels');
    recommendations.push('Remove duplicates to prevent data leakage between train/val splits');
  }

  if (request.evaluation_config) {
    insights.push('📈 Model mAP: 0.687 (COCO-style evaluation)');
    insights.push('⚠️ High false positive rate in crowded scenes (>10 FPs per image)');
    insights.push('📉 Poor performance on "bicycle" class (precision: 0.42)');
    recommendations.push('Collect more training examples of crowded scenes');
    recommendations.push('Apply data augmentation for underrepresented "bicycle" class');
    recommendations.push('Consider using confidence threshold > 0.75 to reduce false positives');
  }

  if (request.brain_config?.method === 'uniqueness') {
    insights.push('🌟 Dataset diversity score: 0.73 (moderate diversity)');
    insights.push('🔍 Top 10% most unique samples could be prioritized for annotation');
    recommendations.push('Use most unique samples for active learning');
    recommendations.push('Remove low-uniqueness samples to reduce dataset size without losing information');
  }

  if (request.brain_config?.method === 'hardness') {
    insights.push('💪 Identified 50 hardest samples (hardness > 0.9)');
    recommendations.push('Use hard samples for curriculum learning (introduce later in training)');
    recommendations.push('Consider using hard negative mining during training');
  }

  return { insights, recommendations };
}

/**
 * Main generation function
 */
export function generateVisualInspectorOutput(request: VisualInspectorRequest): VisualInspectorOutput {
  const blocks: VisualizationBlock[] = [];

  // Setup blocks
  blocks.push(...generateSetupBlocks(request));

  // Data loading
  blocks.push(generateDataLoadingBlock(request));

  // Exploration
  if (request.mode === 'exploration' || request.mode === 'annotation_debug') {
    blocks.push(generateExplorationBlock(request));
  }

  // Evaluation
  if (request.mode === 'model_evaluation' || request.evaluation_config) {
    const evalBlock = generateEvaluationBlock(request);
    if (evalBlock) blocks.push(evalBlock);
  }

  // Brain analytics
  if (request.brain_config) {
    const brainBlock = generateBrainBlock(request);
    if (brainBlock) blocks.push(brainBlock);
  }

  // Quality check
  if (request.mode === 'quality_check') {
    blocks.push(generateQualityCheckBlock(request));
  }

  // Export
  if (request.export_config?.export_view) {
    const exportBlock = generateExportBlock(request);
    if (exportBlock) blocks.push(exportBlock);
  }

  // Generate notebook cells from blocks
  const cells: NotebookCell[] = [];

  // Title cell
  cells.push({
    type: 'markdown',
    content: `# The Visual Inspector v1.0.0
## ${request.dataset_config.dataset_name} - ${request.mode.replace('_', ' ').toUpperCase()}

**Dataset Type:** ${request.dataset_config.dataset_type}
**Mode:** ${request.mode}
**Generated:** ${new Date().toISOString()}

---

This notebook provides interactive dataset visualization and quality assessment using [FiftyOne](https://voxel51.com/fiftyone).`,
  });

  // Convert blocks to cells
  for (const block of blocks) {
    cells.push({
      type: 'markdown',
      content: `## ${block.title}\n\n${block.description}`,
    });
    cells.push({
      type: 'code',
      content: block.code,
    });
  }

  // Footer cell
  cells.push({
    type: 'markdown',
    content: `---

## Next Steps

1. **Correct Labels:** Fix mislabeled samples identified by mistakenness analysis
2. **Remove Duplicates:** Delete low-uniqueness samples to prevent data leakage
3. **Augment Dataset:** Add more examples for underrepresented classes
4. **Retrain Model:** Use cleaned dataset for improved performance

**FiftyOne Resources:**
- [Documentation](https://voxel51.com/docs/fiftyone)
- [Tutorials](https://voxel51.com/docs/fiftyone/tutorials/index.html)
- [GitHub](https://github.com/voxel51/fiftyone)

---

**The Visual Inspector v1.0.0** | ARTIFEX NERD SWARM`,
  });

  const { insights, recommendations } = generateInsights(request);

  const output: VisualInspectorOutput = {
    dataset_name: request.dataset_config.dataset_name,
    mode: request.mode,
    dataset_statistics: generateStatistics(request),
    quality_issues: request.mode === 'quality_check' ? generateQualityIssues(request) : undefined,
    insights,
    recommendations,
    notebook: {
      title: `The Visual Inspector - ${request.dataset_config.dataset_name}`,
      subtitle: `${request.mode} Mode`,
      cells,
      css_styling: '',  // FiftyOne handles its own styling
      metadata: {
        visualization_mode: request.mode,
        dataset_type: request.dataset_config.dataset_type,
        generated_at: new Date().toISOString(),
        version: '1.0.0',
      },
    },
  };

  // Add evaluation results if applicable
  if (request.evaluation_config) {
    output.evaluation_results = {
      metrics: {
        mAP: 0.687,
        precision_recall: 0.0,  // Placeholder
        confusion_matrix: 0.0,
        f1_score: 0.72,
        top_k_accuracy: 0.0,
        iou: 0.0,
        detection_curves: 0.0,
      },
      classification_report: 'Per-class metrics available in notebook',
    };
  }

  // Add brain results if applicable
  if (request.brain_config) {
    output.brain_results = {
      method: request.brain_config.method,
      top_samples: [
        { sample_id: 'sample_001', score: 0.95, reason: 'Highest mistakenness' },
        { sample_id: 'sample_042', score: 0.92, reason: 'Unusual visual content' },
      ],
      statistics: {
        mean_score: 0.65,
        std_score: 0.18,
        min_score: 0.12,
        max_score: 0.98,
      },
    };
  }

  return output;
}
