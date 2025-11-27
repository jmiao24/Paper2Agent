/**
 * Utility functions for Paper2Agent MCP
 */

import { spawn } from 'child_process';
import { readdir, readFile, stat, access } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import type { ExecutionResult, PipelineStatus, AgentInfo, StepStatus } from './types.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export const PAPER2AGENT_ROOT = join(__dirname, '..', '..');

/**
 * Execute a shell command and return the result
 */
export async function executeCommand(
  command: string,
  args: string[],
  cwd?: string
): Promise<ExecutionResult> {
  return new Promise((resolve) => {
    const proc = spawn(command, args, {
      cwd: cwd || PAPER2AGENT_ROOT,
      shell: true,
    });

    let stdout = '';
    let stderr = '';

    proc.stdout?.on('data', (data) => {
      stdout += data.toString();
    });

    proc.stderr?.on('data', (data) => {
      stderr += data.toString();
    });

    proc.on('close', (exitCode) => {
      resolve({
        success: exitCode === 0,
        stdout,
        stderr,
        exitCode,
      });
    });

    proc.on('error', (error) => {
      resolve({
        success: false,
        stdout,
        stderr: stderr + '\n' + error.message,
        exitCode: null,
      });
    });
  });
}

/**
 * Check if a file or directory exists
 */
export async function exists(path: string): Promise<boolean> {
  try {
    await access(path);
    return true;
  } catch {
    return false;
  }
}

/**
 * Get pipeline status for a project
 */
export async function getPipelineStatus(projectDir: string): Promise<PipelineStatus> {
  const fullPath = join(PAPER2AGENT_ROOT, projectDir);
  const pipelineDir = join(fullPath, '.pipeline');

  const stepMarkers = {
    setup: '01_setup_done',
    clone: '02_clone_done',
    folders: '03_folders_done',
    context: '04_context7_done',
    step1_setup_env: '05_step1_done',
    step2_execute_tutorials: '05_step2_done',
    step3_extract_tools: '05_step3_done',
    step4_wrap_mcp: '05_step4_done',
    step5_coverage_quality: '05_step5_done',
    launch_mcp: '06_mcp_done',
  };

  const steps: Record<string, StepStatus> = {};
  let completedSteps = 0;

  for (const [key, marker] of Object.entries(stepMarkers)) {
    const markerPath = join(pipelineDir, marker);
    const isDone = await exists(markerPath);

    steps[key] = {
      name: key,
      status: isDone ? 'completed' : 'pending',
    };

    if (isDone) {
      completedSteps++;
      try {
        const stats = await stat(markerPath);
        steps[key].timestamp = stats.mtime.toISOString();
      } catch {
        // Ignore stat errors
      }
    }
  }

  const totalSteps = Object.keys(stepMarkers).length;
  const overallProgress = Math.round((completedSteps / totalSteps) * 100);

  return {
    projectDir,
    steps: steps as PipelineStatus['steps'],
    overallProgress,
    isComplete: completedSteps === totalSteps,
  };
}

/**
 * List all Paper2Agent projects
 */
export async function listAgents(): Promise<AgentInfo[]> {
  const agents: AgentInfo[] = [];

  try {
    const entries = await readdir(PAPER2AGENT_ROOT, { withFileTypes: true });

    for (const entry of entries) {
      if (entry.isDirectory() && !entry.name.startsWith('.') && entry.name !== 'mcp-server') {
        const projectDir = entry.name;
        const pipelineMarker = join(PAPER2AGENT_ROOT, projectDir, '.pipeline');

        if (await exists(pipelineMarker)) {
          const agentInfo = await getAgentInfo(projectDir);
          if (agentInfo) {
            agents.push(agentInfo);
          }
        }
      }
    }
  } catch (error) {
    // Return empty array if root directory doesn't exist or can't be read
  }

  return agents;
}

/**
 * Get detailed information about a specific agent
 */
export async function getAgentInfo(projectDir: string): Promise<AgentInfo | null> {
  const fullPath = join(PAPER2AGENT_ROOT, projectDir);

  if (!(await exists(fullPath))) {
    return null;
  }

  const status = await getPipelineStatus(projectDir);
  const srcDir = join(fullPath, 'src');
  const toolsDir = join(srcDir, 'tools');

  let repoName = 'unknown';
  let mcpServerPath: string | undefined;
  let toolsCount = 0;
  let tutorialsProcessed = 0;

  // Try to find MCP server file
  if (await exists(srcDir)) {
    const srcFiles = await readdir(srcDir);
    const mcpFile = srcFiles.find(f => f.endsWith('_mcp.py'));
    if (mcpFile) {
      repoName = mcpFile.replace('_mcp.py', '');
      mcpServerPath = join(srcDir, mcpFile);
    }
  }

  // Count tools
  if (await exists(toolsDir)) {
    const toolFiles = await readdir(toolsDir);
    toolsCount = toolFiles.filter(f => f.endsWith('.py') && f !== '__init__.py').length;
  }

  // Try to read tutorial scanner output
  const scannerOutput = join(fullPath, 'claude_outputs', 'step1_output.json');
  if (await exists(scannerOutput)) {
    try {
      const content = await readFile(scannerOutput, 'utf-8');
      const data = JSON.parse(content);
      if (data.tutorials) {
        tutorialsProcessed = Array.isArray(data.tutorials) ? data.tutorials.length : 0;
      }
    } catch {
      // Ignore parsing errors
    }
  }

  let agentStatus: AgentInfo['status'] = 'incomplete';
  if (status.isComplete) {
    agentStatus = 'ready';
  }

  return {
    name: projectDir,
    projectDir,
    repoName,
    mcpServerPath,
    toolsCount,
    tutorialsProcessed,
    status: agentStatus,
  };
}

/**
 * Read and parse JSON file
 */
export async function readJsonFile<T>(path: string): Promise<T | null> {
  try {
    const content = await readFile(path, 'utf-8');
    return JSON.parse(content) as T;
  } catch {
    return null;
  }
}
