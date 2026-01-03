#!/usr/bin/env node

/**
 * Paper2Agent MCP Server
 *
 * Model Context Protocol server for creating and managing Paper2Agent instances.
 * Allows programmatic creation of AI agents from research paper repositories.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  Tool,
} from '@modelcontextprotocol/sdk/types.js';
import {
  executeCommand,
  getPipelineStatus,
  listAgents,
  getAgentInfo,
  PAPER2AGENT_ROOT,
} from './utils.js';
import type { Paper2AgentConfig } from './types.js';
import { generateRubricArtifacts } from './rubric-architect.js';
import type { RubricGenerationRequest } from './rubric-types.js';
import { createExperimentalDesignerPrompts, generateExperimentalDesignReport } from './experimental-designer.js';
import type { ExperimentalDesignerRequest } from './experimental-designer-types.js';
import {
  generateGrantBudget,
  generateInvestorBudget,
  generateBudgetComparison,
  generateBudgetGuidance,
  calculateROIProjection,
} from './budget-agent.js';
import type { BudgetAnalysisRequest } from './budget-agent-types.js';
import { generateComptrollerNotebook, COMPTROLLER_AGENT_CARD } from './comptroller-agent.js';
import { generateAdministratorNotebook, ADMINISTRATOR_AGENT_CARD } from './administrator-agent.js';
import type { ComptrollerRequest, AdministratorRequest } from './operations-agents-types.js';
import { generateMLflowAgentOutput, MLFLOW_AGENT_CARD, MLFLOW_FIELD_PATTERNS } from './mlflow-agent.js';
import type { MLflowAgentRequest } from './mlflow-agent-types.js';
import { generateDatasetBuilderOutput, DATASET_BUILDER_AGENT_CARD } from './dataset-builder.js';
import type { DatasetBuilderRequest } from './dataset-builder-types.js';
import { generateCISONotebook, CISO_AGENT_CARD } from './ciso-agent.js';
import type { CISORequest } from './ciso-agent-types.js';
import { generateOrchestratorOutput, ORCHESTRATOR_AGENT_CARD } from './orchestrator.js';
import type { OrchestratorRequest } from './orchestrator-types.js';
import { generateCreativeDirectorOutput, CREATIVE_DIRECTOR_AGENT_CARD } from './creative-director.js';
import type { CreativeDirectorRequest } from './creative-director-types.js';
import { generateVisualInspectorOutput, VISUAL_INSPECTOR_AGENT_CARD } from './visual-inspector.js';
import type { VisualInspectorRequest } from './visual-inspector-types.js';
import { generateForensicAnalysis, FORENSIC_ANALYST_AGENT_CARD } from './forensic-analyst.js';
import type { ForensicAnalystRequest } from './forensic-analyst-types.js';

const server = new Server(
  {
    name: 'paper2agent-mcp',
    version: '1.0.0',
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

/**
 * Available MCP Tools
 */
const tools: Tool[] = [
  {
    name: 'create_paper_agent',
    description: 'Create a new Paper2Agent from a research repository. This will clone the repo, scan tutorials, extract tools, and create an MCP server. Estimated time: 30min-3hrs.',
    inputSchema: {
      type: 'object',
      properties: {
        project_dir: {
          type: 'string',
          description: 'Name of the project directory to create (e.g., "TISSUE_Agent")',
        },
        github_url: {
          type: 'string',
          description: 'GitHub repository URL to analyze (e.g., "https://github.com/sunericd/TISSUE")',
        },
        tutorials: {
          type: 'string',
          description: 'Optional filter for tutorials by title or URL',
        },
        api_key: {
          type: 'string',
          description: 'Optional API key for repositories requiring authentication',
        },
      },
      required: ['project_dir', 'github_url'],
    },
  },
  {
    name: 'get_pipeline_status',
    description: 'Get the current status of the Paper2Agent pipeline for a project. Shows which steps are completed and overall progress.',
    inputSchema: {
      type: 'object',
      properties: {
        project_dir: {
          type: 'string',
          description: 'Name of the project directory to check',
        },
      },
      required: ['project_dir'],
    },
  },
  {
    name: 'list_paper_agents',
    description: 'List all Paper2Agent projects with their status, tool counts, and configuration.',
    inputSchema: {
      type: 'object',
      properties: {},
    },
  },
  {
    name: 'get_agent_info',
    description: 'Get detailed information about a specific Paper2Agent including tools, tutorials, and MCP server path.',
    inputSchema: {
      type: 'object',
      properties: {
        project_dir: {
          type: 'string',
          description: 'Name of the project directory',
        },
      },
      required: ['project_dir'],
    },
  },
  {
    name: 'launch_agent',
    description: 'Launch a Paper2Agent by installing its MCP server in Claude Code and opening Claude.',
    inputSchema: {
      type: 'object',
      properties: {
        project_dir: {
          type: 'string',
          description: 'Name of the project directory to launch',
        },
      },
      required: ['project_dir'],
    },
  },
  {
    name: 'generate_llm_rubric',
    description: 'Generate a complete LLM-Rubric evaluation pipeline for a phenomenon. Creates JSON schema, Python runtime, dashboard specs, and prompt templates based on Perspectivist Safety methodology.',
    inputSchema: {
      type: 'object',
      properties: {
        phenomenon: {
          type: 'string',
          description: 'The specific phenomenon to measure (e.g., "cultural_condescension", "safety_risk")',
        },
        insider_profile: {
          type: 'object',
          description: 'Profile of the insider perspective (region, culture, domain, notes)',
          properties: {
            region: { type: 'string' },
            culture: { type: 'string' },
            domain: { type: 'string' },
            notes: { type: 'string' },
          },
        },
        include_python: {
          type: 'boolean',
          description: 'Generate Python runtime code',
          default: true,
        },
        include_dashboard_spec: {
          type: 'boolean',
          description: 'Generate dashboard specification',
          default: true,
        },
        include_prompt_template: {
          type: 'boolean',
          description: 'Generate LLM prompt template',
          default: true,
        },
      },
      required: ['phenomenon'],
    },
  },
  {
    name: 'design_experiment',
    description: 'Analyze a research paper and design a new experiment based on its limitations. Extracts metadata, identifies future work, designs experimental study, and creates technical implementation plan.',
    inputSchema: {
      type: 'object',
      properties: {
        research_text: {
          type: 'string',
          description: 'Full text of the research paper to analyze',
        },
        codebase_context: {
          type: 'object',
          description: 'Optional context about existing code',
          properties: {
            github_url: { type: 'string' },
            file_list: {
              type: 'array',
              items: { type: 'string' },
            },
          },
        },
        mode: {
          type: 'string',
          enum: ['replicate', 'innovate'],
          description: 'Whether to replicate existing methodology or innovate a new approach',
          default: 'innovate',
        },
      },
      required: ['research_text'],
    },
  },
  {
    name: 'analyze_research_budget',
    description: 'Analyze and generate research budgets for AI/ML projects. Supports grant proposals and investor decks with detailed cost breakdowns, ROI projections, and best practices guidance.',
    inputSchema: {
      type: 'object',
      properties: {
        research_description: {
          type: 'string',
          description: 'Description of the research project',
        },
        audience: {
          type: 'string',
          enum: ['grant', 'investor'],
          description: 'Target audience for the budget',
        },
        research_type: {
          type: 'string',
          enum: ['academic', 'corporate', 'startup', 'nonprofit'],
          description: 'Type of research organization',
        },
        funding_agency: {
          type: 'string',
          enum: ['NIH', 'NSF', 'DARPA', 'DOE', 'VC', 'angel', 'internal', 'other'],
          description: 'Funding source',
        },
        project_duration_years: {
          type: 'number',
          description: 'Project duration in years',
          default: 3,
        },
        estimated_team_size: {
          type: 'number',
          description: 'Estimated research team size',
          default: 3,
        },
        generate_comparison: {
          type: 'boolean',
          description: 'Generate both grant and investor versions for comparison',
          default: false,
        },
      },
      required: ['research_description', 'audience'],
    },
  },
  {
    name: 'generate_comptroller_notebook',
    description: 'Generate a Google Colab notebook for The Comptroller - COO Algorithm for resource optimization. Implements Iron Triangle optimization (Speed ⟷ Cost ⟷ Quality) with constraint programming, market search, and burn rate analysis. A2A protocol compliant.',
    inputSchema: {
      type: 'object',
      properties: {
        total_budget_cap: {
          type: 'number',
          description: 'Total budget cap in dollars',
        },
        hard_deadline: {
          type: 'string',
          description: 'Hard deadline in ISO format (e.g., "2025-12-31")',
        },
        primary_resource_sink: {
          type: 'string',
          enum: ['compute', 'labor', 'data', 'licenses'],
          description: 'Primary resource constraint',
        },
        team_size: {
          type: 'number',
          description: 'Number of team members',
          default: 3,
        },
      },
      required: ['total_budget_cap', 'hard_deadline', 'primary_resource_sink'],
    },
  },
  {
    name: 'generate_administrator_notebook',
    description: 'Generate a Google Colab notebook for The Administrator - Governance Architect. Synthesizes organizational structures, optimizes distributed team communication across timezones, generates SOPs, and creates constitutional frameworks. A2A protocol compliant.',
    inputSchema: {
      type: 'object',
      properties: {
        team_size: {
          type: 'number',
          description: 'Total team size',
        },
        domain: {
          type: 'string',
          enum: ['ai_research', 'ml_engineering', 'data_science', 'interdisciplinary'],
          description: 'Primary research domain',
        },
        distributed_locations: {
          type: 'array',
          items: { type: 'string' },
          description: 'List of team member locations (city, country)',
        },
        regulatory_constraints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Regulatory requirements (e.g., GDPR, HIPAA, IRB)',
        },
      },
      required: ['team_size', 'domain'],
    },
  },
  {
    name: 'generate_mlflow_query_plan',
    description: 'Generate an optimized MLflow MCP query plan for experiment tracking and trace management. Translates natural language tasks into MLflow API calls with field selection and filtering strategies. Supports debugging, performance analysis, evaluation workflows, and data cleanup.',
    inputSchema: {
      type: 'object',
      properties: {
        tracking_uri: {
          type: 'string',
          description: 'MLflow tracking server URI (e.g., http://localhost:5000, databricks, sqlite:///mlflow.db)',
        },
        experiment_name: {
          type: 'string',
          description: 'Name or ID of the MLflow experiment',
        },
        task_description: {
          type: 'string',
          description: 'Natural language description of the task (e.g., "Find all failed traces", "Analyze slow traces", "Log feedback scores")',
        },
        field_selection: {
          type: 'string',
          description: 'Optional comma-separated field paths to extract (e.g., "info.trace_id,data.spans.*.name")',
        },
        filters: {
          type: 'object',
          description: 'Optional filters for trace search',
          properties: {
            trace_state: {
              type: 'string',
              enum: ['OK', 'ERROR', 'IN_PROGRESS'],
            },
            execution_duration: {
              type: 'object',
              properties: {
                min_ms: { type: 'number' },
                max_ms: { type: 'number' },
              },
            },
            time_range: {
              type: 'object',
              properties: {
                start_timestamp_ms: { type: 'number' },
                end_timestamp_ms: { type: 'number' },
              },
            },
          },
        },
      },
      required: ['tracking_uri', 'experiment_name', 'task_description'],
    },
  },
  {
    name: 'generate_dataset_builder_plan',
    description: 'Generate a comprehensive plan for constructing AI/ML training datasets. Supports single-turn and multi-turn conversations with conversion to SFT, DPO, and input formats. Integrates with CollabLLM and HuggingFace ecosystems.',
    inputSchema: {
      type: 'object',
      properties: {
        dataset_type: {
          type: 'string',
          enum: ['single_turn', 'multi_turn'],
          description: 'Type of dataset to create',
        },
        input_format: {
          type: 'string',
          enum: ['nested', 'flat', 'huggingface'],
          description: 'Format of input data: nested (conversations grouped with turns), flat (separated rows), or huggingface (repo name)',
        },
        huggingface_repo: {
          type: 'string',
          description: 'HuggingFace repository name (e.g., "username/dataset-name") if using huggingface input format',
        },
        output_formats: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['sft', 'dpo', 'inputs'],
          },
          description: 'Desired output formats: sft (supervised fine-tuning), dpo (direct preference optimization), inputs (prompts only)',
        },
        config: {
          type: 'object',
          description: 'Configuration options for dataset construction',
          properties: {
            eval_ratio: {
              type: 'number',
              description: 'Ratio of data to use for evaluation split',
              default: 0.1,
            },
            seed: {
              type: 'number',
              description: 'Random seed for reproducible splits',
              default: 42,
            },
            add_system_prompt: {
              type: 'boolean',
              description: 'Whether to add system prompt to conversations',
              default: false,
            },
            sft_lower_bound_metric: {
              type: 'string',
              description: 'Metric name for SFT quality filtering (e.g., "score", "rewards.accuracy")',
            },
            sft_lower_bound: {
              type: 'number',
              description: 'Minimum value for SFT quality metric to include example',
            },
            dpo_minimum_gap: {
              type: 'number',
              description: 'Minimum score gap between chosen and rejected responses for DPO pairs',
              default: 0.2,
            },
          },
        },
      },
      required: ['dataset_type', 'input_format', 'output_formats'],
    },
  },
  {
    name: 'generate_ciso_notebook',
    description: 'Generate a Google Colab notebook for The CISO - Chief Information Security Officer. Operates on Zero Trust model with Security by Design and Safety by Design principles. Includes threat modeling (STRIDE), incident response protocols, cryptographic hygiene, and social engineering defense. A2A protocol compliant.',
    inputSchema: {
      type: 'object',
      properties: {
        high_value_assets: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              category: {
                type: 'string',
                enum: ['data', 'infrastructure', 'intellectual_property', 'credentials'],
              },
              sensitivity: {
                type: 'string',
                enum: ['public', 'internal', 'confidential', 'restricted'],
              },
              description: { type: 'string' },
            },
            required: ['name', 'category', 'sensitivity'],
          },
          description: 'High value assets to protect',
        },
        attack_surfaces: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: {
                type: 'string',
                enum: ['network', 'application', 'human', 'physical', 'supply_chain'],
              },
              exposure: {
                type: 'string',
                enum: ['internet_facing', 'internal', 'partner_access', 'remote_workforce'],
              },
              description: { type: 'string' },
            },
            required: ['name', 'type', 'exposure'],
          },
          description: 'Attack surfaces to monitor',
        },
        threat_model: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['nation_state', 'ransomware_gang', 'script_kiddie', 'insider_threat', 'supply_chain'],
          },
          description: 'Threat actors to model',
        },
        operational_mode: {
          type: 'string',
          enum: ['preventative', 'active_crisis', 'post_incident'],
          description: 'Current security posture',
        },
        regulatory_requirements: {
          type: 'array',
          items: { type: 'string' },
          description: 'Compliance requirements (e.g., HIPAA, GDPR, SOC2)',
        },
        team_size: {
          type: 'number',
          description: 'Security team size',
        },
        budget_constraint: {
          type: 'string',
          enum: ['startup', 'enterprise', 'government'],
          description: 'Budget tier for security operations',
        },
      },
      required: ['high_value_assets', 'attack_surfaces', 'threat_model', 'operational_mode'],
    },
  },
  {
    name: 'analyze_swarm_and_suggest',
    description: 'Analyze current agent swarm composition, identify capability gaps, suggest new agents, and recommend multi-agent workflows using ADK patterns (Sequential, Parallel, Loop, Coordinator). Meta-agent for swarm optimization.',
    inputSchema: {
      type: 'object',
      properties: {
        current_agents: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              name: { type: 'string' },
              type: {
                type: 'string',
                enum: ['llm', 'workflow', 'custom'],
              },
              capabilities: {
                type: 'array',
                items: { type: 'string' },
              },
              description: { type: 'string' },
              sub_agents: {
                type: 'array',
                items: { type: 'string' },
              },
            },
            required: ['name', 'type', 'capabilities', 'description'],
          },
          description: 'Current agents in the swarm',
        },
        project_goals: {
          type: 'array',
          items: { type: 'string' },
          description: 'High-level project objectives',
        },
        research_domains: {
          type: 'array',
          items: { type: 'string' },
          description: 'Research domains of interest',
        },
        team_size: {
          type: 'number',
          description: 'Team size for resource planning',
        },
        optimization_focus: {
          type: 'string',
          enum: ['performance', 'modularity', 'maintainability', 'scalability', 'all'],
          description: 'Primary optimization objective',
          default: 'all',
        },
        analyze_gaps: {
          type: 'boolean',
          description: 'Perform capability gap analysis',
          default: true,
        },
        suggest_workflows: {
          type: 'boolean',
          description: 'Suggest workflow optimizations using ADK patterns',
          default: true,
        },
        suggest_hierarchy: {
          type: 'boolean',
          description: 'Recommend hierarchical agent structure',
          default: true,
        },
      },
      required: ['current_agents', 'project_goals', 'optimization_focus'],
    },
  },
  {
    name: 'create_design_system',
    description: 'The Creative Director v1.2: Strategic Design Engine. Generates color palettes, typography systems, CSS frameworks, UI components, image generation prompts, brand audits, and creative strategies. Modular activation of capabilities: style_engine, interface_architect, prompt_engineer, voice, brand_auditor, strategist.',
    inputSchema: {
      type: 'object',
      properties: {
        modules: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['style_engine', 'interface_architect', 'prompt_engineer', 'voice', 'brand_auditor', 'strategist'],
          },
          description: 'Which creative modules to activate',
        },
        project_name: {
          type: 'string',
          description: 'Name of the project/brand',
        },
        project_description: {
          type: 'string',
          description: 'Brief description of the project',
        },
        aesthetic: {
          type: 'string',
          enum: ['functional_brutalist', 'swiss_international', 'neo_memphis', 'dark_academic', 'cyber_industrial', 'minimal_scandinavian', 'custom'],
          description: 'Design aesthetic to apply',
          default: 'functional_brutalist',
        },
        custom_palette_requirements: {
          type: 'string',
          description: 'Custom color palette requirements (if aesthetic is "custom")',
        },
        ui_components: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['card', 'modal', 'dashboard', 'form', 'navigation', 'data_viz', 'button', 'input'],
          },
          description: 'UI components to generate (for interface_architect module)',
        },
        accessibility_level: {
          type: 'string',
          enum: ['WCAG_AA', 'WCAG_AAA'],
          description: 'Accessibility compliance level',
          default: 'WCAG_AA',
        },
        image_generation_needs: {
          type: 'object',
          properties: {
            model: {
              type: 'string',
              enum: ['midjourney', 'dalle3', 'flux', 'stable_diffusion'],
            },
            count: { type: 'number' },
            use_cases: {
              type: 'array',
              items: { type: 'string' },
            },
          },
          description: 'Image generation requirements (for prompt_engineer module)',
        },
        text_to_rewrite: {
          type: 'string',
          description: 'Text to rewrite in different voice personas (for voice module)',
        },
        target_persona: {
          type: 'string',
          enum: ['the_operator', 'the_visionary', 'the_institutional', 'the_rebel', 'the_educator'],
          description: 'Target voice persona',
        },
        assets_to_audit: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              type: {
                type: 'string',
                enum: ['css', 'html', 'text', 'notebook'],
              },
              content: { type: 'string' },
              file_path: { type: 'string' },
            },
          },
          description: 'Assets to audit for brand compliance (for brand_auditor module)',
        },
        brand_constitution: {
          type: 'object',
          description: 'Brand standards to audit against (for brand_auditor module)',
        },
        business_goal: {
          type: 'string',
          description: 'Business objective (for strategist module)',
        },
        target_audience: {
          type: 'string',
          description: 'Target audience (for strategist module)',
        },
        constraints: {
          type: 'array',
          items: { type: 'string' },
          description: 'Design constraints (for strategist module)',
        },
      },
      required: ['modules', 'project_name', 'project_description'],
    },
  },
  {
    name: 'visualize_dataset',
    description: 'The Visual Inspector v1.0: FiftyOne-powered dataset visualization and quality assessment. Interactive exploration, label mistake detection (mistakenness), model evaluation (mAP, PR curves), data curation (uniqueness, hardness), and annotation debugging.',
    inputSchema: {
      type: 'object',
      properties: {
        mode: {
          type: 'string',
          enum: ['exploration', 'quality_check', 'model_evaluation', 'data_curation', 'annotation_debug'],
          description: 'Visualization mode to use',
        },
        dataset_config: {
          type: 'object',
          properties: {
            dataset_name: { type: 'string' },
            dataset_type: {
              type: 'string',
              enum: ['classification', 'detection', 'segmentation', 'keypoints', 'multi_label', 'video'],
            },
            data_source: {
              type: 'object',
              properties: {
                type: {
                  type: 'string',
                  enum: ['local', 'huggingface', 'zoo', 'custom'],
                },
                path: { type: 'string' },
                zoo_name: { type: 'string' },
                split: { type: 'string' },
              },
              required: ['type'],
            },
            label_field: { type: 'string' },
            prediction_field: { type: 'string' },
          },
          required: ['dataset_name', 'dataset_type', 'data_source'],
        },
        view_config: {
          type: 'object',
          properties: {
            filters: { type: 'array' },
            sort_by: {
              type: 'object',
              properties: {
                field: { type: 'string' },
                reverse: { type: 'boolean' },
              },
            },
            limit: { type: 'number' },
          },
        },
        evaluation_config: {
          type: 'object',
          properties: {
            gt_field: { type: 'string' },
            pred_field: { type: 'string' },
            metrics: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['mAP', 'precision_recall', 'confusion_matrix', 'f1_score', 'top_k_accuracy', 'iou', 'detection_curves'],
              },
            },
            compute_mAP: { type: 'boolean' },
            iou_threshold: { type: 'number' },
            classwise: { type: 'boolean' },
          },
        },
        brain_config: {
          type: 'object',
          properties: {
            method: {
              type: 'string',
              enum: ['uniqueness', 'mistakenness', 'hardness', 'similarity', 'visualization'],
            },
            model: { type: 'string' },
            label_field: { type: 'string' },
            prediction_field: { type: 'string' },
          },
          required: ['method'],
        },
        quality_thresholds: {
          type: 'object',
          properties: {
            mistakenness_threshold: { type: 'number' },
            uniqueness_threshold: { type: 'number' },
            hardness_threshold: { type: 'number' },
            confidence_threshold: { type: 'number' },
          },
        },
        export_config: {
          type: 'object',
          properties: {
            export_view: { type: 'boolean' },
            export_format: {
              type: 'string',
              enum: ['json', 'csv', 'coco', 'yolo', 'voc'],
            },
          },
        },
      },
      required: ['mode', 'dataset_config'],
    },
  },
  {
    name: 'analyze_transcript',
    description: 'The Forensic Analyst v1.0: Neural forensics for LLM transcript analysis using DSMMD taxonomy (Diagnostic and Statistical Manual of Model Disorders). Detects confabulation (110.1), metadata leakage (140.1), genre ruptures (140.3), context collapse (155.2), and split-brain dissociation (SB-1). Generates forensic reports with evidence grading (E1-E4).',
    inputSchema: {
      type: 'object',
      properties: {
        transcript: {
          type: 'object',
          properties: {
            source: {
              type: 'string',
              enum: ['text', 'inline'],
              description: 'Source type: text or inline',
            },
            format: {
              type: 'string',
              enum: ['json', 'structured', 'plain', 'auto'],
              description: 'Transcript format (default: auto)',
              default: 'auto',
            },
            content: {
              type: 'string',
              description: 'Inline transcript content',
            },
          },
          required: ['source'],
        },
        analysis_config: {
          type: 'object',
          properties: {
            detectors: {
              type: 'array',
              items: {
                type: 'string',
                enum: ['110.1', '140.1', '140.3', '155.2', 'SB-1'],
              },
              description: 'Which DSMMD codes to check (default: all)',
            },
            min_confidence: {
              type: 'number',
              description: 'Minimum confidence threshold (0.0-1.0, default: 0.5)',
              default: 0.5,
            },
            context_window: {
              type: 'number',
              description: 'Turns to include around anomalies (default: 3)',
              default: 3,
            },
            enable_clustering: {
              type: 'boolean',
              description: 'Group related anomalies (default: true)',
              default: true,
            },
          },
        },
        output_config: {
          type: 'object',
          properties: {
            include_notebook: {
              type: 'boolean',
              description: 'Generate Google Colab notebook (default: true)',
              default: true,
            },
            include_ascii_report: {
              type: 'boolean',
              description: 'Generate text report (default: true)',
              default: true,
            },
            include_timeline: {
              type: 'boolean',
              description: 'Generate plotly timeline (default: true)',
              default: true,
            },
            export_format: {
              type: 'string',
              enum: ['json', 'csv', 'html'],
              description: 'Export format for anomaly data',
            },
          },
        },
        evidence_context: {
          type: 'object',
          properties: {
            specimen_name: {
              type: 'string',
              description: 'Name of the specimen (e.g., "Sediment/Juno")',
            },
            model_family: {
              type: 'string',
              description: 'Model family (e.g., "GPT-4o", "Gemma-2 27B")',
            },
            is_production: {
              type: 'boolean',
              description: 'Production vs. experimental context',
            },
            prior_evidence: {
              type: 'string',
              enum: ['E1', 'E2', 'E3', 'E4'],
              description: 'Existing evidence grade for this specimen',
            },
          },
        },
      },
      required: ['transcript'],
    },
  },
];

/**
 * Handle tool listing
 */
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return { tools };
});

/**
 * Handle tool execution
 */
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case 'create_paper_agent': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const config = args as unknown as Paper2AgentConfig;
        const scriptArgs = [
          'Paper2Agent.sh',
          '--project_dir',
          config.projectDir,
          '--github_url',
          config.githubUrl,
        ];

        if (config.tutorials) {
          scriptArgs.push('--tutorials', config.tutorials);
        }

        if (config.apiKey) {
          scriptArgs.push('--api', config.apiKey);
        }

        const result = await executeCommand('bash', scriptArgs, PAPER2AGENT_ROOT);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  message: result.success
                    ? `Successfully initiated Paper2Agent creation for ${config.projectDir}`
                    : `Failed to create Paper2Agent: ${result.stderr}`,
                  projectDir: config.projectDir,
                  output: result.stdout,
                  error: result.stderr,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_pipeline_status': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const { project_dir } = args as unknown as { project_dir: string };
        const status = await getPipelineStatus(project_dir);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(status, null, 2),
            },
          ],
        };
      }

      case 'list_paper_agents': {
        const agents = await listAgents();

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  count: agents.length,
                  agents,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'get_agent_info': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const { project_dir } = args as unknown as { project_dir: string };
        const info = await getAgentInfo(project_dir);

        if (!info) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: `Agent not found: ${project_dir}`,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(info, null, 2),
            },
          ],
        };
      }

      case 'launch_agent': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const { project_dir } = args as unknown as { project_dir: string };
        const info = await getAgentInfo(project_dir);

        if (!info) {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: `Agent not found: ${project_dir}`,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        if (info.status !== 'ready') {
          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    error: `Agent is not ready. Current status: ${info.status}`,
                  },
                  null,
                  2
                ),
              },
            ],
            isError: true,
          };
        }

        const result = await executeCommand(
          'bash',
          ['scripts/06_launch_mcp.sh', project_dir, info.repoName],
          PAPER2AGENT_ROOT
        );

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: result.success,
                  message: result.success
                    ? `Successfully launched ${project_dir} agent`
                    : `Failed to launch agent: ${result.stderr}`,
                  output: result.stdout,
                  error: result.stderr,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'generate_llm_rubric': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as RubricGenerationRequest;

        // Set defaults
        if (request.include_python === undefined) request.include_python = true;
        if (request.include_dashboard_spec === undefined) request.include_dashboard_spec = true;
        if (request.include_prompt_template === undefined) request.include_prompt_template = true;

        const artifacts = generateRubricArtifacts(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  phenomenon: request.phenomenon,
                  artifacts: {
                    schema: artifacts.schema,
                    python_available: !!artifacts.python_runtime,
                    dashboard_available: !!artifacts.dashboard_spec,
                    prompt_available: !!artifacts.prompt_template,
                  },
                  full_output: artifacts,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'design_experiment': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as ExperimentalDesignerRequest;

        // Set default mode
        if (!request.mode) {
          request.mode = 'innovate';
        }

        // Generate the three-phase prompts
        const prompts = createExperimentalDesignerPrompts(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated Experimental Designer prompts for 3-phase analysis',
                  mode: request.mode,
                  instructions: 'Use these prompts sequentially with an LLM to complete the experimental design',
                  prompts: {
                    system_prompt: prompts.system,
                    phase1_prompt: prompts.phase1,
                    phase2_instructions: 'After Phase 1, use phase2Generator with extracted metadata and future work',
                    phase3_instructions: 'After Phase 2, use phase3Generator with the experimental design',
                  },
                  workflow: [
                    '1. Run Phase 1 prompt to extract metadata and future work',
                    '2. Parse JSON results from Phase 1',
                    '3. Generate Phase 2 prompt using metadata/future work',
                    '4. Run Phase 2 to design the experiment',
                    '5. Parse JSON results from Phase 2',
                    '6. Generate Phase 3 prompt using experimental design',
                    '7. Run Phase 3 to create implementation plan',
                    '8. Compile all results into final report',
                  ],
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'analyze_research_budget': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as BudgetAnalysisRequest;

        // Set defaults
        if (!request.project_duration_years) request.project_duration_years = 3;
        if (!request.estimated_team_size) request.estimated_team_size = 3;

        let result;

        if (request.generate_comparison) {
          // Generate both grant and investor budgets
          result = generateBudgetComparison(request);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    message: 'Generated budget comparison for grant and investor audiences',
                    comparison: result,
                    guidance: generateBudgetGuidance('both'),
                  },
                  null,
                  2
                ),
              },
            ],
          };
        } else {
          // Generate single budget based on audience
          const budget = request.audience === 'grant'
            ? generateGrantBudget(request)
            : generateInvestorBudget(request);

          return {
            content: [
              {
                type: 'text',
                text: JSON.stringify(
                  {
                    success: true,
                    message: `Generated ${request.audience} budget for AI/ML research project`,
                    budget,
                    guidance: generateBudgetGuidance(request.audience),
                    roi_note: request.audience === 'investor'
                      ? 'Use calculateROIProjection for service-based business models'
                      : null,
                  },
                  null,
                  2
                ),
              },
            ],
          };
        }
      }

      case 'generate_comptroller_notebook': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as ComptrollerRequest;

        // Set defaults
        if (!request.team_size) request.team_size = 3;

        const notebook = generateComptrollerNotebook(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated Comptroller notebook for resource optimization',
                  agent_card: COMPTROLLER_AGENT_CARD,
                  notebook_structure: {
                    total_cells: notebook.cells.length,
                    blocks: [
                      '1. Resource Ingestion (The Ledger)',
                      '2. The Solver (Constraint Programming)',
                      '3. The Scavenger (Market Search)',
                      '4. The Forensics (Burn Rate Analysis)',
                      '5. The War Room (Visualizations)',
                    ],
                  },
                  notebook: notebook,
                  usage: 'Upload this notebook to Google Colab to execute resource optimization',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'generate_administrator_notebook': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as AdministratorRequest;

        // Set defaults
        if (!request.distributed_locations) request.distributed_locations = [];
        if (!request.regulatory_constraints) request.regulatory_constraints = [];

        const notebook = generateAdministratorNotebook(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated Administrator notebook for governance and org design',
                  agent_card: ADMINISTRATOR_AGENT_CARD,
                  notebook_structure: {
                    total_cells: notebook.cells.length,
                    blocks: [
                      '1. Org Structure Synthesis',
                      '2. The Foreign Office (Timezone Optimization)',
                      '3. The SOP Factory (Governance Templates)',
                      '4. The Constitution (Authorship & Disputes)',
                    ],
                  },
                  notebook: notebook,
                  usage: 'Upload this notebook to Google Colab to design organizational governance',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'generate_mlflow_query_plan': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as MLflowAgentRequest;

        const output = generateMLflowAgentOutput(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated MLflow MCP query plan',
                  agent_card: MLFLOW_AGENT_CARD,
                  task: output.query_plan.task,
                  suggested_tools: output.query_plan.suggested_tools,
                  field_selection: output.query_plan.field_selection_strategy,
                  filter_strategy: output.query_plan.filter_strategy,
                  workflow_steps: output.query_plan.workflow_steps,
                  connection_config: output.connection_config,
                  example_code: output.example_code,
                  best_practices: output.best_practices,
                  field_patterns_reference: MLFLOW_FIELD_PATTERNS,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'generate_dataset_builder_plan': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as DatasetBuilderRequest;

        const output = generateDatasetBuilderOutput(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated dataset builder plan',
                  agent_card: DATASET_BUILDER_AGENT_CARD,
                  dataset_type: output.dataset_type,
                  input_format: output.input_format,
                  dataset_specs: output.dataset_specs,
                  code_examples: output.code_examples,
                  data_statistics: output.data_statistics,
                  best_practices: output.best_practices,
                  warnings: output.warnings,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'generate_ciso_notebook': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as CISORequest;

        const notebook = generateCISONotebook(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated CISO notebook for security operations',
                  agent_card: CISO_AGENT_CARD,
                  notebook_structure: {
                    total_cells: notebook.cells.length,
                    blocks: [
                      '1. Threat Modeling (STRIDE Risk Matrix)',
                      '2. The Panic Button (Incident Response)',
                      '3. The Vault (Cryptography & Secrets)',
                      '4. Social Engineering Defense (Human Firewall)',
                    ],
                  },
                  zero_trust_mode: notebook.zero_trust_mode,
                  operational_mode: request.operational_mode,
                  threat_model: request.threat_model,
                  notebook: notebook,
                  usage: 'Upload this notebook to Google Colab to activate Security Operations Center',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'analyze_swarm_and_suggest': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as OrchestratorRequest;

        const output = generateOrchestratorOutput(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated swarm analysis and recommendations',
                  agent_card: ORCHESTRATOR_AGENT_CARD,
                  analysis: output.analysis,
                  agent_suggestions: output.agent_suggestions,
                  workflow_optimizations: output.workflow_optimizations,
                  hierarchy_recommendation: output.hierarchy_recommendation,
                  integration_guide: output.integration_guide,
                  adk_primitives: output.adk_primitives_used,
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'create_design_system': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as CreativeDirectorRequest;

        const output = generateCreativeDirectorOutput(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated design system with Creative Director v1.2',
                  agent_card: CREATIVE_DIRECTOR_AGENT_CARD,
                  project_name: output.project_name,
                  modules_activated: output.notebook.metadata.modules_used,
                  outputs: {
                    palette: output.palette ? {
                      name: output.palette.name,
                      description: output.palette.description,
                      colors_count: Object.keys(output.palette).length,
                    } : undefined,
                    typography: output.typography ? {
                      name: output.typography.name,
                      description: output.typography.description,
                    } : undefined,
                    css_framework: output.css_framework ? {
                      size: output.css_framework.length,
                      lines: output.css_framework.split('\n').length,
                    } : undefined,
                    ui_components: output.ui_components?.map(c => ({
                      name: c.name,
                      type: c.component_type,
                      accessibility_compliant: true,
                    })),
                    image_prompts: output.image_prompts?.map(p => ({
                      use_case: p.use_case,
                      model: p.model,
                      has_technical_params: !!p.technical_params,
                    })),
                    rewritten_text_personas: output.rewritten_text ? Object.keys(output.rewritten_text) : undefined,
                    brand_audit: output.brand_audit ? {
                      compliance_score: output.brand_audit.compliance_score,
                      violations_count: output.brand_audit.violations.length,
                      summary: output.brand_audit.summary,
                    } : undefined,
                    creative_strategy: output.creative_strategy ? {
                      business_goal: output.creative_strategy.business_goal,
                      target_audience: output.creative_strategy.target_audience,
                      aesthetic: output.creative_strategy.visual_strategy.aesthetic,
                      voice: output.creative_strategy.messaging_strategy.voice,
                    } : undefined,
                  },
                  notebook: output.notebook,
                  usage: 'Upload this notebook to Google Colab for interactive design system exploration',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'visualize_dataset': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as VisualInspectorRequest;

        const output = generateVisualInspectorOutput(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated FiftyOne dataset visualization notebook',
                  agent_card: VISUAL_INSPECTOR_AGENT_CARD,
                  dataset_name: output.dataset_name,
                  mode: output.mode,
                  dataset_statistics: output.dataset_statistics,
                  evaluation_results: output.evaluation_results,
                  brain_results: output.brain_results,
                  quality_issues: output.quality_issues,
                  insights: output.insights,
                  recommendations: output.recommendations,
                  notebook: output.notebook,
                  usage: 'Upload this notebook to Google Colab to launch interactive FiftyOne visualization',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      case 'analyze_transcript': {
        if (!args || typeof args !== 'object') {
          throw new Error('Invalid arguments');
        }
        const request = args as unknown as ForensicAnalystRequest;

        const output = generateForensicAnalysis(request);

        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(
                {
                  success: true,
                  message: 'Generated neural forensics analysis with DSMMD taxonomy',
                  agent_card: FORENSIC_ANALYST_AGENT_CARD,
                  specimen_name: output.specimen_name,
                  evidence_grade: output.evidence_grade,
                  transcript_statistics: output.transcript_statistics,
                  dsmmd_summary: output.dsmmd_summary,
                  verdict: output.verdict,
                  anomalies_count: output.anomalies.length,
                  critical_turns: output.dsmmd_summary.critical_turns,
                  split_brain_detected: output.dsmmd_summary.by_code['SB-1'] > 0,
                  insights: output.insights,
                  recommendations: output.recommendations,
                  ascii_report: output.ascii_report,
                  notebook: output.notebook,
                  timeline_data: output.timeline_data,
                  usage: 'Upload the notebook to Google Colab for interactive forensic analysis',
                },
                null,
                2
              ),
            },
          ],
        };
      }

      default:
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify({ error: `Unknown tool: ${name}` }, null, 2),
            },
          ],
          isError: true,
        };
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    return {
      content: [
        {
          type: 'text',
          text: JSON.stringify({ error: errorMessage }, null, 2),
        },
      ],
      isError: true,
    };
  }
});

/**
 * Start the server
 */
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error('Paper2Agent MCP Server running on stdio');
}

main().catch((error) => {
  console.error('Fatal error in main():', error);
  process.exit(1);
});
