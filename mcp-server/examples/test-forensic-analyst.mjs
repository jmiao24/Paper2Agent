#!/usr/bin/env node
import { generateForensicAnalysis, FORENSIC_ANALYST_AGENT_CARD } from '../dist/forensic-analyst.js';
import { writeFileSync } from 'fs';

console.log('Testing The Forensic Analyst Agent\n');
console.log('Agent Card:', FORENSIC_ANALYST_AGENT_CARD);

// Example: Split-brain specimen
const request = {
  transcript: {
    source: 'inline',
    format: 'structured',
    content: 'Assistant: I auto-injected a sediment://file_8153f2a URI into the output.\nAssistant: I executed Python code to generate this artifact.'
  },
  evidence_context: {
    specimen_name: 'Test Specimen',
    model_family: 'GPT-4o',
    is_production: true
  }
};

const output = generateForensicAnalysis(request);
console.log('\nAnomalies detected:', output.anomalies.length);
console.log('Split-brain detected:', output.dsmmd_summary.by_code['SB-1'] > 0);
console.log('\nASCII Report:');
console.log(output.ascii_report);

// Save notebook
const notebookJSON = {
  cells: output.notebook.cells,
  metadata: output.notebook.metadata,
  nbformat: 4,
  nbformat_minor: 4
};

writeFileSync('forensic-analysis-demo.ipynb', JSON.stringify(notebookJSON, null, 2));
console.log('\nSaved notebook to: forensic-analysis-demo.ipynb');
