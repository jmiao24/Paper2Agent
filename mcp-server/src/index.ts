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
