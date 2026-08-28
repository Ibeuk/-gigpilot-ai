import { Injectable, OnModuleInit, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus, TaskStatus, TaskPriority } from '@prisma/client';
import { PrismaService } from '../common/prisma/prisma.service';
import { AIProviderService } from './ai-provider.service';
import {
  AgentContext,
  TaskResult,
  AgentEvents,
  AgentMessage,
  AGENT_REGISTRY,
} from './types/agent.types';

// Import agent implementations
import { MasterAgent } from './implementations/master.agent';
import { ResearchAgent } from './implementations/research.agent';
import { ContentAgent } from './implementations/content.agent';
import { CampaignAgent } from './implementations/campaign.agent';
import { AnalyticsAgent } from './implementations/analytics.agent';
import { OptimizationAgent } from './implementations/optimization.agent';
import { BaseAgent } from './base/base-agent';

@Injectable()
export class AgentService implements OnModuleInit {
  private readonly logger = new Logger(AgentService.name);
  private readonly agents = new Map<AgentType, BaseAgent>();

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
    private readonly aiProvider: AIProviderService,
  ) {
    // Initialize all agents
    this.agents.set(
      AgentType.MASTER,
      new MasterAgent(prisma, eventEmitter, aiProvider),
    );
    this.agents.set(
      AgentType.RESEARCH,
      new ResearchAgent(prisma, eventEmitter, aiProvider),
    );
    this.agents.set(
      AgentType.CONTENT,
      new ContentAgent(prisma, eventEmitter, aiProvider),
    );
    this.agents.set(
      AgentType.CAMPAIGN,
      new CampaignAgent(prisma, eventEmitter, aiProvider),
    );
    this.agents.set(
      AgentType.ANALYTICS,
      new AnalyticsAgent(prisma, eventEmitter, aiProvider),
    );
    this.agents.set(
      AgentType.OPTIMIZATION,
      new OptimizationAgent(prisma, eventEmitter, aiProvider),
    );
  }

  async onModuleInit() {
    // Initialize all agents in the database
    for (const [type, agent] of this.agents) {
      try {
        await agent.initialize();
        this.logger.log(`Agent initialized: ${type}`);
      } catch (error) {
        this.logger.error(
          `Failed to initialize agent ${type}: ${(error as Error).message}`,
        );
      }
    }

    // Listen for inter-agent messages
    this.eventEmitter.on(
      AgentEvents.AGENT_MESSAGE,
      (message: AgentMessage) => {
        this.handleAgentMessage(message);
      },
    );

    this.logger.log('All agents initialized');
  }

  /**
   * Get all agents with their current status.
   */
  async getAllAgents() {
    const agents = await this.prisma.agent.findMany({
      orderBy: { type: 'asc' },
      include: {
        _count: { select: { tasks: true, memories: true } },
      },
    });

    return agents.map((agent) => ({
      ...agent,
      capabilities:
        AGENT_REGISTRY.find((r) => r.type === agent.type)?.capabilities ?? [],
    }));
  }

  /**
   * Get a specific agent's status.
   */
  async getAgentStatus(type: AgentType) {
    const agent = await this.prisma.agent.findUnique({
      where: { type },
      include: {
        _count: { select: { tasks: true, memories: true, logs: true } },
      },
    });

    if (!agent) {
      return { type, status: 'NOT_INITIALIZED' };
    }

    const recentLogs = await this.prisma.agentLog.findMany({
      where: { agentId: agent.id },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return { ...agent, recentLogs };
  }

  /**
   * Submit a task to the agent system.
   * The Master Agent will decompose and route it.
   */
  async submitTask(params: {
    type: string;
    title: string;
    description?: string;
    payload: Record<string, any>;
    priority?: string;
    campaignId?: string;
    userId?: string;
  }) {
    const task = await this.prisma.task.create({
      data: {
        type: params.type as any,
        title: params.title,
        description: params.description,
        payload: params.payload,
        priority: (params.priority as TaskPriority) ?? TaskPriority.MEDIUM,
        campaignId: params.campaignId,
        status: TaskStatus.PENDING,
      },
    });

    this.eventEmitter.emit(AgentEvents.TASK_CREATED, {
      taskId: task.id,
      type: task.type,
      userId: params.userId,
    });

    this.logger.log(`Task submitted: ${task.title} (${task.id})`);

    return task;
  }

  /**
   * Execute a task using the appropriate agent.
   */
  async executeTask(taskId: string): Promise<TaskResult> {
    const task = await this.prisma.task.findUnique({
      where: { id: taskId },
    });

    if (!task) {
      return { success: false, error: 'Task not found' };
    }

    // Determine which agent should handle this task
    const agentType = this.routeTask(task.type);
    const agent = this.agents.get(agentType);

    if (!agent) {
      return { success: false, error: `No agent available for type: ${agentType}` };
    }

    // Update task status
    await this.prisma.task.update({
      where: { id: taskId },
      data: {
        status: TaskStatus.RUNNING,
        startedAt: new Date(),
        agentId: (await this.prisma.agent.findUnique({ where: { type: agentType } }))?.id,
      },
    });

    const context: AgentContext = {
      agentId: (await this.prisma.agent.findUnique({ where: { type: agentType } }))?.id ?? '',
      agentType,
      taskId,
      campaignId: task.campaignId ?? undefined,
      memories: {},
    };

    try {
      const result = await agent.execute(context, task.payload);

      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: result.success ? TaskStatus.COMPLETED : TaskStatus.FAILED,
          result: result.data ?? undefined,
          errorMessage: result.error,
          completedAt: new Date(),
        },
      });

      this.eventEmitter.emit(
        result.success
          ? AgentEvents.TASK_COMPLETED
          : AgentEvents.TASK_FAILED,
        { taskId, result },
      );

      return result;
    } catch (error) {
      await this.prisma.task.update({
        where: { id: taskId },
        data: {
          status: TaskStatus.FAILED,
          errorMessage: (error as Error).message,
          completedAt: new Date(),
        },
      });

      return { success: false, error: (error as Error).message };
    }
  }

  /**
   * Route a task type to the appropriate agent.
   */
  private routeTask(taskType: string): AgentType {
    const routing: Record<string, AgentType> = {
      RESEARCH: AgentType.RESEARCH,
      CONTENT_GENERATION: AgentType.CONTENT,
      CAMPAIGN_SETUP: AgentType.CAMPAIGN,
      CAMPAIGN_MONITOR: AgentType.CAMPAIGN,
      ANALYTICS: AgentType.ANALYTICS,
      OPTIMIZATION: AgentType.OPTIMIZATION,
      INTEGRATION_SYNC: AgentType.MASTER,
      NOTIFICATION: AgentType.MASTER,
    };

    return routing[taskType] ?? AgentType.MASTER;
  }

  /**
   * Handle inter-agent messages.
   */
  private handleAgentMessage(message: AgentMessage) {
    this.logger.debug(
      `Agent message: ${message.from} → ${message.to}: ${message.type}`,
    );
  }
}
