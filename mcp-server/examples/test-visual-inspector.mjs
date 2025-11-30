#!/usr/bin/env node

/**
 * Example: Testing The Visual Inspector Agent
 *
 * This script demonstrates how to use the Visual Inspector agent
 * programmatically without Claude Desktop.
 */

import { generateVisualInspectorOutput, VISUAL_INSPECTOR_AGENT_CARD } from '../dist/visual-inspector.js';

console.log('🔍 Testing The Visual Inspector Agent\n');
console.log('Agent Card:', VISUAL_INSPECTOR_AGENT_CARD);
console.log('\n' + '='.repeat(60) + '\n');

// Example 1: Quality Check Mode
console.log('📊 Example 1: Quality Check with Mistakenness Detection\n');

const qualityCheckRequest = {
  mode: 'quality_check',
  dataset_config: {
    dataset_name: 'coco_quickstart',
    dataset_type: 'detection',
    data_source: {
      type: 'zoo',
      zoo_name: 'quickstart',
      split: 'validation'
    },
    label_field: 'ground_truth',
    prediction_field: 'predictions'
  },
  brain_config: {
    method: 'mistakenness',
    prediction_field: 'predictions',
    label_field: 'ground_truth'
  },
  quality_thresholds: {
    mistakenness_threshold: 0.85,
    uniqueness_threshold: 0.1,
    confidence_threshold: 0.5
  }
};

const output1 = generateVisualInspectorOutput(qualityCheckRequest);

console.log('Generated Notebook:');
console.log('  Title:', output1.notebook.title);
console.log('  Cells:', output1.notebook.cells.length);
console.log('  Mode:', output1.notebook.metadata.visualization_mode);
console.log('\nDataset Statistics:');
console.log('  Total samples:', output1.dataset_statistics.total_samples);
console.log('  Samples in view:', output1.dataset_statistics.samples_in_view);
console.log('  Label distribution:', output1.dataset_statistics.label_distribution);
console.log('\nQuality Issues Found:', output1.quality_issues?.length || 0);
if (output1.quality_issues && output1.quality_issues.length > 0) {
  console.log('\nTop Issues:');
  output1.quality_issues.slice(0, 3).forEach((issue, idx) => {
    console.log(`  ${idx + 1}. [${issue.severity.toUpperCase()}] ${issue.issue_type}`);
    console.log(`     Score: ${issue.score}`);
    console.log(`     ${issue.description}`);
    console.log(`     Action: ${issue.suggested_action}`);
  });
}

console.log('\n📌 Insights:');
output1.insights.forEach(insight => console.log(`  - ${insight}`));

console.log('\n💡 Recommendations:');
output1.recommendations.forEach(rec => console.log(`  - ${rec}`));

console.log('\n' + '='.repeat(60) + '\n');

// Example 2: Model Evaluation Mode
console.log('📈 Example 2: Model Evaluation with mAP\n');

const evaluationRequest = {
  mode: 'model_evaluation',
  dataset_config: {
    dataset_name: 'my_detections',
    dataset_type: 'detection',
    data_source: {
      type: 'zoo',
      zoo_name: 'quickstart'
    },
    label_field: 'ground_truth',
    prediction_field: 'predictions'
  },
  evaluation_config: {
    gt_field: 'ground_truth',
    pred_field: 'predictions',
    metrics: ['mAP', 'precision_recall', 'f1_score'],
    compute_mAP: true,
    iou_threshold: 0.5,
    classwise: true
  }
};

const output2 = generateVisualInspectorOutput(evaluationRequest);

console.log('Evaluation Results:');
if (output2.evaluation_results) {
  console.log('  Metrics:', output2.evaluation_results.metrics);
  console.log('  Classification Report:', output2.evaluation_results.classification_report);
}

console.log('\n📌 Insights:');
output2.insights.forEach(insight => console.log(`  - ${insight}`));

console.log('\n' + '='.repeat(60) + '\n');

// Example 3: Data Curation with Uniqueness
console.log('🎨 Example 3: Data Curation (Uniqueness-based)\n');

const curationRequest = {
  mode: 'data_curation',
  dataset_config: {
    dataset_name: 'training_images',
    dataset_type: 'classification',
    data_source: {
      type: 'zoo',
      zoo_name: 'quickstart'
    }
  },
  brain_config: {
    method: 'uniqueness'
  },
  quality_thresholds: {
    uniqueness_threshold: 0.15
  },
  export_config: {
    export_view: true,
    export_format: 'json'
  }
};

const output3 = generateVisualInspectorOutput(curationRequest);

console.log('Brain Analytics:');
if (output3.brain_results) {
  console.log('  Method:', output3.brain_results.method);
  console.log('  Statistics:', output3.brain_results.statistics);
  console.log('\n  Top Samples:');
  output3.brain_results.top_samples.forEach((sample, idx) => {
    console.log(`    ${idx + 1}. ${sample.sample_id} (score: ${sample.score}) - ${sample.reason}`);
  });
}

console.log('\n📌 Insights:');
output3.insights.forEach(insight => console.log(`  - ${insight}`));

console.log('\n' + '='.repeat(60) + '\n');

// Save a notebook to disk
console.log('💾 Saving notebook to disk...\n');

import { writeFileSync } from 'fs';

const notebookJSON = {
  cells: output1.notebook.cells,
  metadata: {
    kernelspec: {
      display_name: 'Python 3',
      language: 'python',
      name: 'python3'
    },
    language_info: {
      name: 'python',
      version: '3.8.0'
    },
    ...output1.notebook.metadata
  },
  nbformat: 4,
  nbformat_minor: 4
};

writeFileSync('visual-inspector-demo.ipynb', JSON.stringify(notebookJSON, null, 2));

console.log('✅ Saved notebook to: visual-inspector-demo.ipynb');
console.log('   Upload this to Google Colab to run interactively!\n');

console.log('🎉 Test Complete!\n');
