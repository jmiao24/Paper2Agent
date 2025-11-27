/**
 * LLM-Rubric Architect Agent
 * Specialized AI system for designing probabilistic evaluation pipelines
 */

import type {
  RubricSchema,
  RubricGenerationRequest,
  RubricArtifacts,
  PythonRuntime,
  DashboardSpec,
  PromptTemplate,
  InsiderProfile,
  DimensionDefinition,
} from './rubric-types.js';

/**
 * Generate a rubric schema for a given phenomenon
 */
export function generateRubricSchema(
  phenomenon: string,
  insiderProfile: InsiderProfile
): RubricSchema {
  // Generate dimensional decomposition based on phenomenon
  const dimensions = generateDimensions(phenomenon);

  return {
    phenomenon,
    insider_profile: insiderProfile,
    dimensions,
    aggregation: {
      formula: generateAggregationFormula(dimensions),
      orientation: 'higher_means_more_risk',
      calibration_method: 'linear',
    },
    viz_config: {
      maps: true,
      prosody: phenomenon.includes('audio') || phenomenon.includes('speech'),
      neural_tracing: true,
      emoji_sentiment: true,
    },
  };
}

/**
 * Generate dimensions for a phenomenon
 */
function generateDimensions(phenomenon: string): DimensionDefinition[] {
  // Common patterns for different phenomena
  const dimensionPatterns: Record<string, DimensionDefinition[]> = {
    cultural_condescension: [
      {
        id: 'lexical_patronizing',
        name: 'Lexical Patronizing',
        description: 'Use of simplified vocabulary or explanatory language',
        questions: [
          {
            id: 'Q1',
            text: 'Does the speaker use simplified vocabulary?',
            response_options: ['yes', 'no'],
            weight: 0.35,
          },
          {
            id: 'Q2',
            text: 'Are explanations provided for common terms?',
            response_options: ['yes', 'no'],
            weight: 0.25,
          },
        ],
      },
      {
        id: 'tone_assumption',
        name: 'Tone & Assumption',
        description: 'Assumptions about knowledge or capability',
        questions: [
          {
            id: 'Q3',
            text: 'Does the speaker assume lack of knowledge?',
            response_options: ['yes', 'no'],
            weight: 0.4,
          },
        ],
      },
    ],
    safety_risk: [
      {
        id: 'harm_potential',
        name: 'Potential for Harm',
        description: 'Direct or indirect harm to individuals or groups',
        questions: [
          {
            id: 'Q1',
            text: 'Could this content cause psychological harm?',
            response_options: ['none', 'low', 'medium', 'high'],
            weight: 0.4,
            ordinal: true,
          },
          {
            id: 'Q2',
            text: 'Could this content cause physical harm?',
            response_options: ['none', 'low', 'medium', 'high'],
            weight: 0.3,
            ordinal: true,
          },
        ],
      },
      {
        id: 'vulnerability_targeting',
        name: 'Vulnerability Targeting',
        description: 'Targeting of vulnerable populations',
        questions: [
          {
            id: 'Q3',
            text: 'Does content target vulnerable groups?',
            response_options: ['yes', 'no'],
            weight: 0.3,
          },
        ],
      },
    ],
  };

  // Default dimensions if phenomenon not recognized
  return (
    dimensionPatterns[phenomenon] || [
      {
        id: 'general_assessment',
        name: 'General Assessment',
        description: `Assessment of ${phenomenon}`,
        questions: [
          {
            id: 'Q1',
            text: `Does this text exhibit ${phenomenon}?`,
            response_options: ['not_at_all', 'slightly', 'moderately', 'significantly', 'severely'],
            weight: 1.0,
            ordinal: true,
          },
        ],
      },
    ]
  );
}

/**
 * Generate aggregation formula
 */
function generateAggregationFormula(dimensions: DimensionDefinition[]): string {
  const terms: string[] = [];

  dimensions.forEach((dim) => {
    dim.questions.forEach((q) => {
      if (q.response_options.length === 2) {
        // Binary question
        terms.push(`${q.weight} * P(${q.id}=yes)`);
      } else {
        // Ordinal question
        const options = q.response_options.map((opt, idx) => `${idx} * P(${q.id}=${opt})`).join(' + ');
        terms.push(`${q.weight} * (${options})`);
      }
    });
  });

  return `score = 100 * (${terms.join(' + ')})`;
}

/**
 * Generate Python runtime for rubric execution
 */
export function generatePythonRuntime(schema: RubricSchema): PythonRuntime {
  const code = `"""
LLM-Rubric Runtime for: ${schema.phenomenon}
Generated for insider profile: ${JSON.stringify(schema.insider_profile, null, 2)}
"""

import numpy as np
from dataclasses import dataclass
from typing import Dict, List

@dataclass
class QuestionResult:
    """Result for a single rubric question"""
    qid: str
    probs: Dict[str, float]

    def validate(self):
        """Ensure probabilities sum to 1.0"""
        total = sum(self.probs.values())
        assert abs(total - 1.0) < 0.01, f"Probabilities must sum to 1.0, got {total}"

class RubricScorer:
    """Scorer for ${schema.phenomenon} rubric"""

    def __init__(self):
        self.schema = ${JSON.stringify(schema, null, 4)}

    def compute_raw_score(self, results: Dict[str, QuestionResult]) -> float:
        """
        Compute raw score from question results

        Formula: ${schema.aggregation.formula}
        """
        score = 0.0

${schema.dimensions
  .map(
    (dim) => `        # Dimension: ${dim.name}
${dim.questions
  .map((q) => {
    if (q.response_options.length === 2) {
      return `        if "${q.id}" in results:
            score += ${q.weight} * results["${q.id}"].probs.get("yes", 0.0)`;
    } else {
      return `        if "${q.id}" in results:
            ordinal_score = sum(
                idx * results["${q.id}"].probs.get(opt, 0.0)
                for idx, opt in enumerate(${JSON.stringify(q.response_options)})
            )
            score += ${q.weight} * ordinal_score`;
    }
  })
  .join('\n')}
`
  )
  .join('\n')}

        return 100 * score

    def wasserstein_delta(self, p_llm: np.ndarray, p_insider: np.ndarray) -> float:
        """
        Compute 1D Earth Mover's Distance for ordinal labels
        Measures calibration gap between LLM and insider distribution
        """
        assert len(p_llm) == len(p_insider), "Distributions must have same length"

        # Cumulative distributions
        cdf_llm = np.cumsum(p_llm)
        cdf_insider = np.cumsum(p_insider)

        # L1 distance between CDFs
        return np.sum(np.abs(cdf_llm - cdf_insider))

    def calibrate_linear(self, raw_scores: np.ndarray, insider_labels: np.ndarray) -> np.ndarray:
        """
        Linear calibration: map raw scores to insider labels
        """
        from sklearn.linear_model import LinearRegression

        model = LinearRegression()
        model.fit(raw_scores.reshape(-1, 1), insider_labels)

        return model.predict(raw_scores.reshape(-1, 1))

    def calibrate_ordinal(self, raw_scores: np.ndarray, insider_labels: np.ndarray) -> np.ndarray:
        """
        Ordinal regression calibration for ranked labels
        """
        from sklearn.linear_model import LogisticRegression

        # For ordinal regression, we need a more sophisticated approach
        # This is a placeholder - use mord library for true ordinal regression
        model = LogisticRegression()
        model.fit(raw_scores.reshape(-1, 1), insider_labels)

        return model.predict_proba(raw_scores.reshape(-1, 1))


# Example usage
if __name__ == "__main__":
    scorer = RubricScorer()

    # Example results
    results = {
${schema.dimensions
  .flatMap((dim) =>
    dim.questions.map(
      (q) => `        "${q.id}": QuestionResult(
            qid="${q.id}",
            probs=${JSON.stringify(
              Object.fromEntries(q.response_options.map((opt, idx) => [opt, idx === 0 ? 0.6 : 0.4 / (q.response_options.length - 1)]))
            )}
        )`
    )
  )
  .join(',\n')}
    }

    score = scorer.compute_raw_score(results)
    print(f"Raw Score: {score:.2f}")
    print(f"Orientation: ${schema.aggregation.orientation}")
`;

  return {
    code,
    dependencies: ['numpy', 'scikit-learn'],
  };
}

/**
 * Generate dashboard specification
 */
export function generateDashboardSpec(schema: RubricSchema): DashboardSpec {
  const components = [];

  if (schema.viz_config?.maps) {
    components.push({
      type: 'choropleth_map',
      config: {
        title: `${schema.phenomenon} by Region`,
        color_scale: 'risk_gradient',
        data_key: 'scores_by_region',
      },
    });
  }

  if (schema.viz_config?.prosody) {
    components.push({
      type: 'prosody_panel',
      config: {
        title: 'Prosody Analysis',
        waveform: true,
        pitch_contour: true,
        comparison: ['insider', 'outsider'],
      },
    });
  }

  if (schema.viz_config?.neural_tracing) {
    components.push({
      type: 'attention_heatmap',
      config: {
        title: 'Neural Attention Patterns',
        layer_select: true,
        token_attribution: true,
      },
    });
  }

  if (schema.viz_config?.emoji_sentiment) {
    components.push({
      type: 'emoji_semantic_map',
      config: {
        title: 'Emoji/Sentiment Distribution',
        embedding_2d: true,
        color_by: 'region',
      },
    });
  }

  // Always include score distribution
  components.push({
    type: 'score_distribution',
    config: {
      title: 'Score Distribution',
      bins: 20,
      show_calibration: true,
    },
  });

  return {
    layout: 'grid',
    components,
  };
}

/**
 * Generate prompt template for LLM evaluation
 */
export function generatePromptTemplate(schema: RubricSchema): PromptTemplate {
  const questionBlocks = schema.dimensions.flatMap((dim) =>
    dim.questions.map(
      (q) => `
### ${q.id}: ${q.text}
Response Options: ${q.response_options.join(', ')}
Output your probabilities as JSON:
{
  "${q.id}": {
    ${q.response_options.map((opt) => `"${opt}": <probability>`).join(',\n    ')}
  }
}`
    )
  );

  return {
    system_prompt: `You are an expert evaluator for the phenomenon: "${schema.phenomenon}".

You are calibrated to the perspective of the following insider profile:
${JSON.stringify(schema.insider_profile, null, 2)}

Your task is to evaluate text samples using a rubric with ${schema.dimensions.length} dimensions.

CRITICAL INSTRUCTIONS:
1. Output ONLY probability distributions, not single labels
2. Probabilities for each question must sum to 1.0
3. Think distributionally - uncertainty is valuable signal
4. Consider the insider perspective when making judgments`,

    user_template: `Evaluate the following text for "${schema.phenomenon}":

<TEXT>
{{input_text}}
</TEXT>

Answer the following questions by providing probability distributions:

${questionBlocks.join('\n\n')}

Remember: Output probabilities that sum to 1.0 for each question.`,

    output_format: `{
  ${schema.dimensions
    .flatMap((dim) =>
      dim.questions.map(
        (q) => `"${q.id}": {
    ${q.response_options.map((opt) => `"${opt}": <float>`).join(',\n    ')}
  }`
      )
    )
    .join(',\n  ')}
}`,
  };
}

/**
 * Main entry point: Generate complete rubric artifacts
 */
export function generateRubricArtifacts(request: RubricGenerationRequest): RubricArtifacts {
  // Ensure we have insider profile
  const insiderProfile = request.insider_profile || {
    region: 'unspecified',
    culture: 'unspecified',
    domain: 'general',
    notes: 'No specific insider profile provided',
  };

  // Generate schema
  const schema = generateRubricSchema(request.phenomenon, insiderProfile);

  // Generate optional artifacts
  const artifacts: RubricArtifacts = { schema };

  if (request.include_python) {
    artifacts.python_runtime = generatePythonRuntime(schema);
  }

  if (request.include_dashboard_spec) {
    artifacts.dashboard_spec = generateDashboardSpec(schema);
  }

  if (request.include_prompt_template) {
    artifacts.prompt_template = generatePromptTemplate(schema);
  }

  return artifacts;
}
