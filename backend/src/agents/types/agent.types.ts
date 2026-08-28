import { AgentType, AgentStatus, TaskStatus } from '@prisma/client';

// ─── Agent Interfaces ──────────────────────────────

export interface AgentContext {
  agentId: string;
  agentType: AgentType;
  taskId?: string;
  campaignId?: string;
  userId?: string;
  memories: Record<string, any>;
  metadata?: Record<string, any>;
}

export interface TaskResult {
  success: boolean;
  data?: any;
  error?: string;
  metrics?: TaskMetrics;
  nextTasks?: CreateTaskRequest[];
}

export interface TaskMetrics {
  durationMs: number;
  tokensUsed?: number;
  apiCalls?: number;
}

export interface CreateTaskRequest {
  type: string;
  title: string;
  description?: string;
  payload: Record<string, any>;
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  scheduledAt?: Date;
  agentType?: AgentType;
}

// ─── Agent Communication ───────────────────────────

export interface AgentMessage {
  id: string;
  from: AgentType;
  to: AgentType;
  type: AgentMessageType;
  payload: any;
  timestamp: Date;
  correlationId?: string;
}

export enum AgentMessageType {
  TASK_ASSIGNED = 'task.assigned',
  TASK_COMPLETED = 'task.completed',
  TASK_FAILED = 'task.failed',
  TASK_PROGRESS = 'task.progress',
  DATA_REQUEST = 'data.request',
  DATA_RESPONSE = 'data.response',
  RECOMMENDATION = 'recommendation',
  ALERT = 'alert',
  HEARTBEAT = 'heartbeat',
}

// ─── AI Provider Interfaces ────────────────────────

export interface AIProvider {
  name: string;
  generateText(prompt: string, options?: AIGenerateOptions): Promise<AIResponse>;
  generateStructured<T>(prompt: string, schema: any, options?: AIGenerateOptions): Promise<T>;
}

export interface AIGenerateOptions {
  model?: string;
  temperature?: number;
  maxTokens?: number;
  systemPrompt?: string;
  responseFormat?: 'text' | 'json';
}

export interface AIResponse {
  text: string;
  tokensUsed: {
    prompt: number;
    completion: number;
    total: number;
  };
  model: string;
  finishReason: string;
}

// ─── Agent Events ──────────────────────────────────

export const AgentEvents = {
  TASK_CREATED: 'agent.task.created',
  TASK_ASSIGNED: 'agent.task.assigned',
  TASK_STARTED: 'agent.task.started',
  TASK_COMPLETED: 'agent.task.completed',
  TASK_FAILED: 'agent.task.failed',
  TASK_RETRYING: 'agent.task.retrying',
  AGENT_STATUS_CHANGED: 'agent.status.changed',
  AGENT_MESSAGE: 'agent.message',
  CAMPAIGN_CREATED: 'campaign.created',
  CAMPAIGN_UPDATED: 'campaign.updated',
  CONTENT_GENERATED: 'content.generated',
  ANALYTICS_CAPTURED: 'analytics.captured',
  OPTIMIZATION_SUGGESTED: 'optimization.suggested',
} as const;

// ─── Agent Registry ────────────────────────────────

export interface AgentRegistryEntry {
  type: AgentType;
  name: string;
  description: string;
  capabilities: string[];
}

export const AGENT_REGISTRY: AgentRegistryEntry[] = [
  {
    type: 'MASTER' as AgentType,
    name: 'Master Agent',
    description: 'Orchestrates all other agents, decomposes goals, and manages task lifecycle',
    capabilities: ['goal_decomposition', 'task_assignment', 'progress_monitoring', 'failure_handling'],
  },
  {
    type: 'RESEARCH' as AgentType,
    name: 'Research Agent',
    description: 'Conducts market research, keyword analysis, and competitor intelligence',
    capabilities: ['buyer_research', 'market_analysis', 'keyword_discovery', 'competitor_analysis'],
  },
  {
    type: 'CONTENT' as AgentType,
    name: 'Content Agent',
    description: 'Generates marketing content, social posts, ad copy, and landing pages',
    capabilities: ['content_generation', 'post_creation', 'script_writing', 'landing_page_copy'],
  },
  {
    type: 'CAMPAIGN' as AgentType,
    name: 'Campaign Agent',
    description: 'Manages campaign lifecycle, configuration, and execution',
    capabilities: ['campaign_management', 'performance_tracking', 'budget_management'],
  },
  {
    type: 'ANALYTICS' as AgentType,
    name: 'Analytics Agent',
    description: 'Analyzes performance data, identifies trends, and generates reports',
    capabilities: ['data_analysis', 'trend_detection', 'report_generation', 'anomaly_detection'],
  },
  {
    type: 'OPTIMIZATION' as AgentType,
    name: 'Optimization Agent',
    description: 'Recommends and implements improvements to campaigns and strategies',
    capabilities: ['strategy_optimization', 'ab_testing', 'budget_reallocation', 'targeting_refinement'],
  },
];
