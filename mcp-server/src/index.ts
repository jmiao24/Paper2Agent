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
