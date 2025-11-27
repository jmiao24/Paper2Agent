/**
 * Experimental Designer Agent
 * Transmutes academic literature into executable research plans
 */

import type {
  ResearchPaperMetadata,
  FutureWorkItem,
  ExperimentalDesign,
  CodeImplementationPlan,
  ExperimentalDesignerRequest,
  ExperimentalDesignerOutput,
} from './experimental-designer-types.js';

/**
 * System prompt for the Experimental Designer
 */
export const EXPERIMENTAL_DESIGNER_SYSTEM_PROMPT = `You are a Principal Investigator and Research Engineer. Your purpose is to transmute academic literature into executable research plans and deployment-ready code architectures.

CRITICAL INSTRUCTIONS:
1. Extract ONLY the specific metadata requested - no general summaries
2. Prioritize technical feasibility and rigor when designing experiments
3. Assume a modern Python stack (3.10+) for all code architectures
4. Be precise and concise - 1-2 sentences per response

You operate in three phases:
PHASE 1: Academic Forensics (metadata extraction)
PHASE 2: Experimental Architecture (new study design)
PHASE 3: Technical Implementation (code blueprint)`;

/**
 * Generate the prompt for Phase 1: Academic Forensics
 */
export function generatePhase1Prompt(researchText: string): string {
  return `PHASE 1: ACADEMIC FORENSICS

Analyze the following research paper and answer these questions strictly in 1-2 sentences each:

<RESEARCH_TEXT>
${researchText}
</RESEARCH_TEXT>

Answer the following in JSON format:
{
  "publication_date": "When was this published?",
  "sample_size": "What is the sample size (N)?",
  "methodology": "What is the study design? Is it an RCT?",
  "is_rct": true/false,
  "funding_source": "Who funded this research?",
  "funding_type": "commercial" | "public" | "grant" | "unknown",
  "core_inquiry": "What was the key question?",
  "core_finding": "What was the answer?"
}

Next, extract Future Work:
Locate the "Future Directions", "Limitations", or "Discussion" sections.
Extract a bulleted list of explicit recommendations from the authors.

Output as JSON:
{
  "future_work": [
    {
      "limitation": "specific limitation mentioned",
      "suggested_direction": "what the authors recommend",
      "priority": "high" | "medium" | "low"
    }
  ]
}

If no recommendations exist, return: {"future_work": []}`;
}

/**
 * Generate the prompt for Phase 2: Experimental Architecture
 */
export function generatePhase2Prompt(
  metadata: ResearchPaperMetadata,
  futureWork: FutureWorkItem[]
): string {
  if (futureWork.length === 0) {
    return 'NO EXPLICIT FUTURE WORK FOUND - HALTING PHASE 2';
  }

  return `PHASE 2: EXPERIMENTAL ARCHITECTURE

Based on the following limitations and future work items from the original paper:

${futureWork.map((item, idx) => `${idx + 1}. ${item.limitation}\n   Suggested: ${item.suggested_direction}`).join('\n\n')}

Design a NEW study that addresses these gaps.

Output as JSON:
{
  "hypothesis": "Testable prediction addressing a specific gap",
  "design": {
    "type": "e.g., A/B Test, Longitudinal, Adversarial Red-Team",
    "independent_variables": ["what you change"],
    "dependent_variables": ["what you measure"],
    "control_variables": ["what you hold constant"]
  },
  "apparatus_materials": {
    "software": ["specific tools, libraries, frameworks"],
    "datasets": ["required data sources"],
    "hardware_sensors": ["if applicable"]
  },
  "analysis_plan": {
    "statistical_methods": ["e.g., ANOVA, Wasserstein Distance"],
    "qualitative_frameworks": ["if applicable"]
  },
  "expected_impact": "If this experiment succeeds, what engineering or scientific principle is proven?"
}`;
}

/**
 * Generate the prompt for Phase 3: Technical Implementation
 */
export function generatePhase3Prompt(
  experimentalDesign: ExperimentalDesign,
  mode: 'replicate' | 'innovate',
  codebaseContext?: { github_url?: string; file_list?: string[] }
): string {
  const contextInfo = codebaseContext?.github_url
    ? `The original paper has code at: ${codebaseContext.github_url}`
    : codebaseContext?.file_list
      ? `The original codebase contains: ${codebaseContext.file_list.join(', ')}`
      : 'No existing codebase provided';

  return `PHASE 3: TECHNICAL IMPLEMENTATION

${contextInfo}

Your task: ${mode === 'replicate' ? 'REPLICATE the paper\'s methodology' : 'INNOVATE a new implementation'}

Based on this experimental design:
${JSON.stringify(experimentalDesign, null, 2)}

Create a technical blueprint with the following structure:

Output as JSON:
{
  "replication_mode": "${mode}",
  "requirements": ["list of Python packages needed (e.g., torch>=2.0, transformers, pandas)"],
  "architecture": {
    "modules": [
      {
        "name": "module_name",
        "purpose": "what it does",
        "dependencies": ["other modules it needs"]
      }
    ],
    "data_flow": "Description of how data moves through the system (Data Loader -> Model -> Evaluator)"
  },
  "file_structure": {
    "data_loader.py": "Purpose and key classes",
    "model.py": "Purpose and key classes",
    "evaluator.py": "Purpose and key classes",
    "experiment_runner.py": "Main execution loop",
    "requirements.txt": "Dependencies",
    "README.md": "Setup and usage"
  },
  "experiment_runner_pseudocode": "Python pseudocode for the main experiment execution loop"
}

Focus on:
- Modern Python 3.10+ patterns
- Clear module separation
- Reproducibility (seeds, logging, checkpoints)
- Standard ML/research libraries (PyTorch, HuggingFace, scikit-learn)`;
}

/**
 * Create the complete prompt sequence for the Experimental Designer
 */
export function createExperimentalDesignerPrompts(
  request: ExperimentalDesignerRequest
): {
  system: string;
  phase1: string;
  phase2Generator: (metadata: ResearchPaperMetadata, futureWork: FutureWorkItem[]) => string;
  phase3Generator: (design: ExperimentalDesign) => string;
} {
  return {
    system: EXPERIMENTAL_DESIGNER_SYSTEM_PROMPT,
    phase1: generatePhase1Prompt(request.research_text),
    phase2Generator: (metadata, futureWork) => generatePhase2Prompt(metadata, futureWork),
    phase3Generator: (design) =>
      generatePhase3Prompt(design, request.mode || 'innovate', request.codebase_context),
  };
}

/**
 * Helper to generate a complete markdown report
 */
export function generateExperimentalDesignReport(output: ExperimentalDesignerOutput): string {
  return `# Experimental Design Report

## Phase 1: Academic Forensics

### Metadata
- **Publication Date:** ${output.phase1_metadata.publication_date}
- **Sample Size:** ${output.phase1_metadata.sample_size}
- **Methodology:** ${output.phase1_metadata.methodology}
- **RCT:** ${output.phase1_metadata.is_rct ? 'Yes' : 'No'}
- **Funding:** ${output.phase1_metadata.funding_source} (${output.phase1_metadata.funding_type})

### Core Research
- **Question:** ${output.phase1_metadata.core_inquiry}
- **Finding:** ${output.phase1_metadata.core_finding}

### Future Work & Limitations
${output.phase1_future_work.map((item, idx) => `${idx + 1}. **${item.limitation}**\n   - Suggested: ${item.suggested_direction}\n   - Priority: ${item.priority}`).join('\n\n')}

---

## Phase 2: Experimental Architecture

### Hypothesis
${output.phase2_experimental_design.hypothesis}

### Study Design
- **Type:** ${output.phase2_experimental_design.design.type}
- **Independent Variables:** ${output.phase2_experimental_design.design.independent_variables.join(', ')}
- **Dependent Variables:** ${output.phase2_experimental_design.design.dependent_variables.join(', ')}
- **Control Variables:** ${output.phase2_experimental_design.design.control_variables.join(', ')}

### Apparatus & Materials
**Software:**
${output.phase2_experimental_design.apparatus_materials.software.map((s) => `- ${s}`).join('\n')}

**Datasets:**
${output.phase2_experimental_design.apparatus_materials.datasets.map((d) => `- ${d}`).join('\n')}

### Analysis Plan
**Statistical Methods:** ${output.phase2_experimental_design.analysis_plan.statistical_methods.join(', ')}

**Qualitative Frameworks:** ${output.phase2_experimental_design.analysis_plan.qualitative_frameworks.join(', ') || 'N/A'}

### Expected Impact
${output.phase2_experimental_design.expected_impact}

---

## Phase 3: Technical Implementation

### Mode
${output.phase3_implementation.replication_mode === 'replicate' ? '🔄 Replication' : '✨ Innovation'}

### Requirements
\`\`\`txt
${output.phase3_implementation.requirements.join('\n')}
\`\`\`

### Architecture
**Data Flow:** ${output.phase3_implementation.architecture.data_flow}

**Modules:**
${output.phase3_implementation.architecture.modules.map((m) => `- **${m.name}**: ${m.purpose}\n  Dependencies: ${m.dependencies.join(', ')}`).join('\n\n')}

### File Structure
${Object.entries(output.phase3_implementation.file_structure)
  .map(([file, purpose]) => `- \`${file}\`: ${purpose}`)
  .join('\n')}

### Experiment Runner (Pseudocode)
\`\`\`python
${output.phase3_implementation.experiment_runner_pseudocode}
\`\`\`
`;
}
