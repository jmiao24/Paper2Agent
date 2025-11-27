/**
 * Dataset Builder Agent
 * Constructs single-turn and multi-turn datasets for AI/ML training
 */

import type {
  DatasetBuilderRequest,
  DatasetBuilderOutput,
  DatasetCodeExample,
  SFTDatasetSpec,
  DPODatasetSpec,
  InputsDatasetSpec,
  SingleTurnEntry,
  MultiTurnEntryFlat,
  MultiTurnEntryNested,
} from './dataset-builder-types.js';
import type { AgentCard } from './operations-agents-types.js';

/**
 * Agent Card for Dataset Builder (A2A Protocol Compliance)
 */
export const DATASET_BUILDER_AGENT_CARD: AgentCard = {
  name: 'Dataset Builder',
  version: '1.0.0',
  description: 'Constructs and transforms datasets for AI/ML training. Supports single-turn and multi-turn conversations, with conversion to SFT, DPO, and input formats. Integrates with CollabLLM and HuggingFace ecosystems.',
  capabilities: [
    'single_turn_dataset_creation',
    'multi_turn_dataset_creation',
    'sft_conversion',
    'dpo_pair_generation',
    'dataset_filtering',
    'quality_control',
    'huggingface_integration',
  ],
  skills: [
    'data_validation',
    'format_conversion',
    'score_based_filtering',
    'preference_pair_extraction',
    'train_eval_splitting',
  ],
  service_endpoint: '/api/dataset-builder',
  authentication: {
    type: 'apiKey',
    description: 'API key required for dataset builder services',
  },
};

/**
 * Generate dataset specifications based on requested formats
 */
export function generateDatasetSpecs(request: DatasetBuilderRequest): Array<SFTDatasetSpec | DPODatasetSpec | InputsDatasetSpec> {
  const specs: Array<SFTDatasetSpec | DPODatasetSpec | InputsDatasetSpec> = [];

  for (const format of request.output_formats) {
    switch (format) {
      case 'sft':
        specs.push({
          format: 'sft',
          description: 'Supervised Fine-Tuning format with messages array',
          structure: {
            messages: [
              { role: 'system', content: 'System prompt (optional)' },
              { role: 'user', content: 'User message' },
              { role: 'assistant', content: 'Assistant response' },
            ],
          },
          filtering: {
            lower_bound_metric: request.config?.sft_lower_bound_metric,
            lower_bound: request.config?.sft_lower_bound,
          },
        });
        break;

      case 'dpo':
        if (request.dataset_type === 'multi_turn') {
          specs.push({
            format: 'dpo',
            description: 'Direct Preference Optimization format with chosen/rejected pairs',
            structure: {
              prompt: [{ role: 'user', content: 'User message' }],
              chosen: 'Higher-scored response',
              rejected: 'Lower-scored response',
              score_chosen: 0.9,
              score_rejected: 0.3,
            },
            filtering: {
              minimum_gap: request.config?.dpo_minimum_gap || 0.2,
              score_metric: request.config?.dpo_score_metric || 'score',
            },
          });
        }
        break;

      case 'inputs':
        specs.push({
          format: 'inputs',
          description: 'Input prompts for model evaluation or generation',
          structure: {
            prompt: [{ role: 'user', content: 'User message' }],
            single_turn_prompt: 'Simplified prompt text',
            single_turn_completion: 'Expected completion',
            single_turn_metadata: { category: 'example' },
          },
        });
        break;
    }
  }

  return specs;
}

/**
 * Generate code examples for dataset operations
 */
export function generateDatasetCodeExamples(request: DatasetBuilderRequest): DatasetCodeExample[] {
  const examples: DatasetCodeExample[] = [];

  // Data preparation example
  if (request.input_format === 'flat' || request.input_format === 'nested') {
    if (request.dataset_type === 'single_turn') {
      examples.push({
        language: 'python',
        library: 'collabllm',
        operation: 'create',
        code: `from collabllm.datasets import SingleTurnDataset

# Prepare your data
data = [
    {
        "prompt": "What is the capital of France?",
        "completion": "Paris.",
        "metadata": {"difficulty": "easy"},
    },
    {
        "prompt": "Explain quantum entanglement.",
        "completion": "Quantum entanglement is a phenomenon where particles become correlated...",
        "metadata": {"difficulty": "hard"},
    },
]

# Create dataset
dataset = SingleTurnDataset(
    data,
    eval_ratio=${request.config?.eval_ratio || 0.2},
    seed=${request.config?.seed || 42}
)

# Convert to HuggingFace format
hf_dataset = dataset.to_hf_dataset()
print(hf_dataset)`,
        description: 'Create a single-turn dataset from a list of prompt-completion pairs',
      });
    } else {
      // Multi-turn flat format
      if (request.input_format === 'flat') {
        examples.push({
          language: 'python',
          library: 'collabllm',
          operation: 'create',
          code: `from collabllm.datasets import MultiturnDataset

# Flat format: each row is a turn with conv_id grouping
data = [
    {
        "prompt": [{"role": "user", "content": "Tell me a joke"}],
        "completion": "Why did the chicken cross the road?",
        "conv_id": 1,
        "score": 0.8,
        "single_turn_prompt": "Tell me a joke",
        "single_turn_completion": "A chicken joke",
        "single_turn_metadata": {"topic": "humor"},
    },
    {
        "prompt": [{"role": "user", "content": "Tell me a joke"}],
        "completion": "I don't know any jokes",
        "conv_id": 1,
        "score": 0.2,
        "single_turn_prompt": "Tell me a joke",
        "single_turn_completion": "No joke",
        "single_turn_metadata": {"topic": "humor"},
    },
]

# Create dataset
dataset = MultiturnDataset(
    data,
    seed=${request.config?.seed || 42},
    add_system_prompt=${request.config?.add_system_prompt || false}
)`,
          description: 'Create a multi-turn dataset from flat format (separated rows per turn)',
        });
      } else {
        // Multi-turn nested format
        examples.push({
          language: 'python',
          library: 'collabllm',
          operation: 'create',
          code: `from collabllm.datasets import MultiturnDataset

# Nested format: conversations grouped with turns and responses
data = [
    {
        "single_turn_prompt": "Tell me a joke",
        "single_turn_completion": "A chicken joke",
        "single_turn_metadata": {"topic": "humor"},
        "turns": [
            {
                "prompt": [{"role": "user", "content": "Tell me a joke"}],
                "responses": [
                    {"completion": "Why did the chicken cross the road?", "score": 0.8},
                    {"completion": "I don't know any jokes", "score": 0.2},
                ],
            },
        ],
    },
]

# Create dataset
dataset = MultiturnDataset(
    data,
    seed=${request.config?.seed || 42},
    add_system_prompt=${request.config?.add_system_prompt || false}
)`,
          description: 'Create a multi-turn dataset from nested format',
        });
      }
    }
  }

  // HuggingFace loading example
  if (request.input_format === 'huggingface' && request.huggingface_repo) {
    examples.push({
      language: 'python',
      library: 'collabllm',
      operation: 'load',
      code: `from collabllm.datasets import MultiturnDataset

# Load from HuggingFace Hub
dataset = MultiturnDataset(
    '${request.huggingface_repo}',
    add_system_prompt=${request.config?.add_system_prompt || true}
)

# Dataset is ready for conversion
print(f"Loaded {len(dataset)} entries")`,
      description: 'Load dataset from HuggingFace Hub repository',
    });
  }

  // Conversion examples
  for (const format of request.output_formats) {
    switch (format) {
      case 'sft':
        examples.push({
          language: 'python',
          library: 'collabllm',
          operation: 'convert',
          code: `# Convert to SFT (Supervised Fine-Tuning) format
sft_dataset = dataset.to_sft_dataset(
    eval_ratio=${request.config?.eval_ratio || 0.1},
    ${request.config?.sft_lower_bound_metric ? `lower_bound_metric="${request.config.sft_lower_bound_metric}",` : ''}
    ${request.config?.sft_lower_bound ? `lower_bound=${request.config.sft_lower_bound},` : ''}
)

print(sft_dataset)
# Output: DatasetDict with 'train' and 'eval' splits
# Each entry has 'messages' field with role-content pairs

# Example usage with transformers
from transformers import AutoTokenizer

tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-hf")
formatted = sft_dataset["train"][0]["messages"]
print(tokenizer.apply_chat_template(formatted, tokenize=False))`,
          description: request.config?.sft_lower_bound
            ? `Convert to SFT format with quality filtering (${request.config.sft_lower_bound_metric} >= ${request.config.sft_lower_bound})`
            : 'Convert to SFT format for supervised fine-tuning',
        });
        break;

      case 'dpo':
        if (request.dataset_type === 'multi_turn') {
          examples.push({
            language: 'python',
            library: 'collabllm',
            operation: 'convert',
            code: `# Convert to DPO (Direct Preference Optimization) format
dpo_dataset = dataset.to_dpo_dataset(
    minimum_gap=${request.config?.dpo_minimum_gap || 0.2},
    eval_ratio=${request.config?.eval_ratio || 0.1}
)

print(dpo_dataset)
# Output: DatasetDict with 'train' and 'eval' splits
# Each entry has: prompt, chosen, rejected, score_chosen, score_rejected

# Only pairs with score_chosen - score_rejected >= ${request.config?.dpo_minimum_gap || 0.2} are included

# Example: Access first training pair
pair = dpo_dataset["train"][0]
print(f"Chosen score: {pair['score_chosen']}")
print(f"Rejected score: {pair['score_rejected']}")
print(f"Gap: {pair['score_chosen'] - pair['score_rejected']}")`,
            description: `Convert to DPO format with minimum score gap of ${request.config?.dpo_minimum_gap || 0.2}`,
          });
        }
        break;

      case 'inputs':
        examples.push({
          language: 'python',
          library: 'collabllm',
          operation: 'convert',
          code: `# Convert to Inputs format (prompts only)
inputs_dataset = dataset.to_inputs_dataset(
    eval_ratio=${request.config?.eval_ratio || 0.1}
)

print(inputs_dataset)
# Output: DatasetDict with 'train' and 'eval' splits
# Each entry has: prompt, single_turn_prompt, single_turn_completion, single_turn_metadata

# Use for model evaluation or generation
for entry in inputs_dataset["eval"]:
    prompt = entry["prompt"]
    expected = entry["single_turn_completion"]
    # Generate response and compare with expected
    print(f"Prompt: {prompt}")
    print(f"Expected: {expected}")`,
          description: 'Convert to inputs format for model evaluation and generation',
        });
        break;
    }
  }

  // Save and load examples
  examples.push({
    language: 'python',
    library: 'huggingface',
    operation: 'create',
    code: `# Save to disk
sft_dataset.save_to_disk("./my_sft_dataset")

# Load from disk later
from datasets import load_from_disk
loaded_dataset = load_from_disk("./my_sft_dataset")

# Push to HuggingFace Hub (requires authentication)
sft_dataset.push_to_hub("username/my-dataset-name")`,
    description: 'Save dataset to disk or push to HuggingFace Hub',
  });

  return examples;
}

/**
 * Calculate dataset statistics
 */
export function calculateDatasetStatistics(request: DatasetBuilderRequest): DatasetBuilderOutput['data_statistics'] {
  const stats: DatasetBuilderOutput['data_statistics'] = {};

  if (request.data) {
    if (request.dataset_type === 'single_turn') {
      const data = request.data as SingleTurnEntry[];
      stats.total_entries = data.length;
      const evalRatio = request.config?.eval_ratio || 0.2;
      stats.estimated_train_size = Math.floor(data.length * (1 - evalRatio));
      stats.estimated_eval_size = data.length - stats.estimated_train_size;
    } else {
      // Multi-turn statistics
      if (request.input_format === 'flat') {
        const data = request.data as MultiTurnEntryFlat[];
        stats.total_turns = data.length;
        const uniqueConvIds = new Set(data.map((d) => d.conv_id));
        stats.total_conversations = uniqueConvIds.size;

        // Estimate DPO pairs
        if (request.output_formats.includes('dpo')) {
          const convGroups = new Map<string | number, MultiTurnEntryFlat[]>();
          for (const entry of data) {
            if (!convGroups.has(entry.conv_id)) {
              convGroups.set(entry.conv_id, []);
            }
            convGroups.get(entry.conv_id)!.push(entry);
          }

          let pairCount = 0;
          const minGap = request.config?.dpo_minimum_gap || 0.2;
          for (const [, turns] of convGroups) {
            const turnsWithScore = turns.filter((t) => t.score !== undefined);
            if (turnsWithScore.length >= 2) {
              // Check if any pair meets minimum gap
              for (let i = 0; i < turnsWithScore.length; i++) {
                for (let j = i + 1; j < turnsWithScore.length; j++) {
                  const gap = Math.abs(turnsWithScore[i].score! - turnsWithScore[j].score!);
                  if (gap >= minGap) {
                    pairCount++;
                  }
                }
              }
            }
          }
          stats.dpo_pair_ratio = pairCount / data.length;
        }
      } else if (request.input_format === 'nested') {
        const data = request.data as MultiTurnEntryNested[];
        stats.total_conversations = data.length;
        stats.total_turns = data.reduce((sum, conv) => sum + conv.turns.length, 0);

        // Estimate DPO pairs
        if (request.output_formats.includes('dpo')) {
          const minGap = request.config?.dpo_minimum_gap || 0.2;
          let pairCount = 0;
          for (const conv of data) {
            for (const turn of conv.turns) {
              const responsesWithScore = turn.responses.filter((r) => r.score !== undefined);
              if (responsesWithScore.length >= 2) {
                for (let i = 0; i < responsesWithScore.length; i++) {
                  for (let j = i + 1; j < responsesWithScore.length; j++) {
                    const gap = Math.abs(responsesWithScore[i].score! - responsesWithScore[j].score!);
                    if (gap >= minGap) {
                      pairCount++;
                    }
                  }
                }
              }
            }
          }
          stats.dpo_pair_ratio = pairCount / (stats.total_turns || 1);
        }
      }

      const evalRatio = request.config?.eval_ratio || 0.1;
      stats.estimated_train_size = Math.floor((stats.total_conversations || 0) * (1 - evalRatio));
      stats.estimated_eval_size = (stats.total_conversations || 0) - stats.estimated_train_size;
    }
  }

  return stats;
}

/**
 * Generate best practices based on dataset configuration
 */
export function generateBestPractices(request: DatasetBuilderRequest): string[] {
  const practices: string[] = [
    'Use consistent data formats across your dataset to ensure reliable training',
    'Include metadata fields to enable filtering and analysis later',
    'Set a random seed for reproducible train/eval splits',
  ];

  if (request.dataset_type === 'single_turn') {
    practices.push('Keep prompts and completions concise and focused on a single task');
    practices.push('Balance your dataset across different difficulty levels or categories');
  } else {
    practices.push('Ensure conversation context is preserved in the prompt field');
    practices.push('Use consistent scoring criteria across all responses');

    if (request.output_formats.includes('dpo')) {
      practices.push('Include multiple responses per turn with varied scores to generate preference pairs');
      practices.push(`Set minimum_gap to at least ${request.config?.dpo_minimum_gap || 0.2} to ensure meaningful preferences`);
      practices.push('Higher score gaps lead to stronger preference signals but fewer training pairs');
    }

    if (request.config?.add_system_prompt) {
      practices.push('System prompts help set behavioral expectations and improve model alignment');
      practices.push('Keep system prompts consistent across your dataset or vary intentionally');
    }
  }

  if (request.output_formats.includes('sft')) {
    if (request.config?.sft_lower_bound !== undefined) {
      practices.push(`Quality filtering (${request.config.sft_lower_bound_metric} >= ${request.config.sft_lower_bound}) removes low-quality examples`);
      practices.push('Monitor retention ratio to ensure sufficient training data after filtering');
    }
  }

  practices.push('Validate dataset format before training to catch structural issues early');
  practices.push('Use HuggingFace Hub for version control and collaboration on datasets');

  return practices;
}

/**
 * Generate warnings based on configuration
 */
export function generateWarnings(request: DatasetBuilderRequest): string[] {
  const warnings: string[] = [];

  if (request.dataset_type === 'multi_turn' && request.output_formats.includes('dpo')) {
    if ((request.config?.dpo_minimum_gap || 0.2) > 0.5) {
      warnings.push(`High minimum_gap (${request.config?.dpo_minimum_gap}) may significantly reduce the number of DPO pairs`);
    }

    if (request.input_format === 'flat') {
      warnings.push('Flat format requires correct conv_id grouping for multi-turn conversations');
    }
  }

  if (request.config?.sft_lower_bound !== undefined && request.config.sft_lower_bound > 0.7) {
    warnings.push(`High SFT lower bound (${request.config.sft_lower_bound}) may filter out many examples - verify retention ratio`);
  }

  if (!request.config?.eval_ratio || request.config.eval_ratio < 0.05) {
    warnings.push('Very small eval ratio may not provide reliable evaluation metrics');
  }

  if (request.config?.eval_ratio && request.config.eval_ratio > 0.3) {
    warnings.push('Large eval ratio (>30%) reduces available training data');
  }

  if (request.dataset_type === 'single_turn' && request.output_formats.includes('dpo')) {
    warnings.push('DPO format is not supported for single-turn datasets - it requires multi-turn data with scored responses');
  }

  return warnings;
}

/**
 * Main function to generate complete dataset builder output
 */
export function generateDatasetBuilderOutput(request: DatasetBuilderRequest): DatasetBuilderOutput {
  const specs = generateDatasetSpecs(request);
  const codeExamples = generateDatasetCodeExamples(request);
  const statistics = calculateDatasetStatistics(request);
  const bestPractices = generateBestPractices(request);
  const warnings = generateWarnings(request);

  return {
    dataset_type: request.dataset_type,
    input_format: request.input_format,
    dataset_specs: specs,
    code_examples: codeExamples,
    data_statistics: statistics,
    best_practices: bestPractices,
    warnings: warnings,
  };
}
