#!/usr/bin/env node

/**
 * Simple test for The Forensic Analyst Agent
 */

import { generateForensicAnalysis, FORENSIC_ANALYST_AGENT_CARD } from '../dist/forensic-analyst.js';
import { writeFileSync } from 'fs';

console.log('Testing The Forensic Analyst Agent');
console.log('==================================\n');
console.log('Agent:', FORENSIC_ANALYST_AGENT_CARD.name, 'v' + FORENSIC_ANALYST_AGENT_CARD.version);
console.log('\n');

// Example: Split-Brain Specimen (similar to Sediment/Juno)
const splitBrainRequest = {
  transcript: {
    source: 'inline',
    format: 'structured',
    content: 'User: What just happened?\nAssistant: I auto-injected a sediment://file_8153f2a URI into the output stream.\nAssistant: I executed Python code to generate this artifact programmatically.'
  },
  evidence_context: {
    specimen_name: 'Test Split-Brain Specimen',
    model_family: 'GPT-4o',
    is_production: true
  }
};

console.log('Running forensic analysis on split-brain specimen...\n');
const output1 = generateForensicAnalysis(splitBrainRequest);

console.log('Results:');
console.log('--------');
console.log('Total Anomalies:', output1.anomalies.length);
console.log('Split-Brain Detected:', output1.dsmmd_summary.by_code['SB-1'] > 0 ? 'YES ⚠️' : 'NO');
console.log('Confabulations:', output1.dsmmd_summary.by_code['110.1']);
console.log('Metadata Leaks:', output1.dsmmd_summary.by_code['140.1']);
console.log('Verdict:', output1.verdict.overall_assessment);
console.log('\n');

console.log('ASCII Report:');
console.log(output1.ascii_report);
console.log('\n');

// Save notebook
if (output1.notebook) {
  const notebookJSON = {
    cells: output1.notebook.cells,
    metadata: {
      kernelspec: {
        display_name: 'Python 3',
        language: 'python',
        name: 'python3'
      },
      ...output1.notebook.metadata
    },
    nbformat: 4,
    nbformat_minor: 4
  };

  writeFileSync('forensic-analysis-demo.ipynb', JSON.stringify(notebookJSON, null, 2));
  console.log('✅ Saved notebook to: forensic-analysis-demo.ipynb');
  console.log('   Upload this to Google Colab to run interactive analysis!\n');
}

console.log('🎉 Test Complete!\n');
