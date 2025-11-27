/**
 * TypeScript types and interfaces for Paper2Agent MCP
 */

export interface Paper2AgentConfig {
  projectDir: string;
  githubUrl: string;
  tutorials?: string;
  apiKey?: string;
}

export interface PipelineStatus {
  projectDir: string;
  steps: {
    setup: StepStatus;
    clone: StepStatus;
    folders: StepStatus;
    context: StepStatus;
    step1_setup_env: StepStatus;
    step2_execute_tutorials: StepStatus;
    step3_extract_tools: StepStatus;
    step4_wrap_mcp: StepStatus;
    step5_coverage_quality: StepStatus;
    launch_mcp: StepStatus;
  };
  overallProgress: number;
  isComplete: boolean;
}

export interface StepStatus {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';
  timestamp?: string;
  error?: string;
}

export interface AgentInfo {
  name: string;
  projectDir: string;
  repoName: string;
  githubUrl?: string;
  mcpServerPath?: string;
  toolsCount?: number;
  tutorialsProcessed?: number;
  createdAt?: string;
  status: 'ready' | 'incomplete' | 'error';
}

export interface ExecutionResult {
  success: boolean;
  stdout: string;
  stderr: string;
  exitCode: number | null;
}

export interface ToolInfo {
  name: string;
  description: string;
  module: string;
  tutorialSource: string;
}

export interface TutorialInfo {
  title: string;
  path: string;
  type: 'notebook' | 'script';
  executed: boolean;
  toolsExtracted: number;
}
