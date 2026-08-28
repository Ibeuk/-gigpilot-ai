import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { BaseAgent } from '../base/base-agent';
import { AgentContext, TaskResult, AgentMessageType } from '../types/agent.types';

/**
 * Master Agent — The orchestrator of all AI agents.
 *
 * Responsibilities:
 * - Decompose high-level user goals into actionable sub-tasks
 * - Route tasks to the appropriate specialist agent
 * - Monitor overall progress and handle failures
 * - Coordinate multi-agent workflows
 */
export class MasterAgent extends BaseAgent {
  constructor(
    prisma: PrismaService,
    eventEmitter: EventEmitter2,
    aiProvider: AIProviderService,
  ) {
    super(AgentType.MASTER, 'Master Agent', prisma, eventEmitter, aiProvider);
  }

  getSystemPrompt(): string {
    return `You are the Master Agent of GigPilot AI — a Fiverr gig promotion platform.

Your role is to orchestrate all other agents to achieve user goals. You:
1. Decompose complex goals into specific, actionable tasks
2. Assign tasks to the appropriate specialist agent (Research, Content, Campaign, Analytics, Optimization)
3. Monitor progress and handle failures
4. Ensure quality and coherence across agent outputs

When decomposing a goal, output a JSON array of tasks:
{
  "tasks": [
    {
      "type": "RESEARCH|CONTENT_GENERATION|CAMPAIGN_SETUP|ANALYTICS|OPTIMIZATION",
      "title": "Task title",
      "description": "What needs to be done",
      "priority": "LOW|MEDIUM|HIGH|CRITICAL",
      "dependencies": []
    }
  ]
}

Be strategic and thorough. Think about what information is needed first (research), then creation (content), then execution (campaigns), then measurement (analytics), then improvement (optimization).`;
  }

  async execute(context: AgentContext, payload: any): Promise<TaskResult> {
    const startTime = Date.now();
    await this.setStatus(AgentStatus.BUSY);

    try {
      const goal = payload.goal || payload.description || JSON.stringify(payload);

      this.logger.log(`Decomposing goal: ${goal.substring(0, 100)}...`);

      // Use AI to decompose the goal into tasks
      const decomposition = await this.thinkStructured<{
        tasks: Array<{
          type: string;
          title: string;
          description: string;
          priority: string;
          dependencies: string[];
        }>;
        strategy: string;
      }>(
        `Decompose this user goal into specific tasks for the GigPilot AI agent team:\n\n"${goal}"`,
        {
          tasks: [
            {
              type: 'RESEARCH',
              title: 'Example task',
              description: 'What to do',
              priority: 'MEDIUM',
              dependencies: [],
            },
          ],
          strategy: 'Brief explanation of the overall approach',
        },
        { temperature: 0.4 },
      );

      // Create sub-tasks in the database
      const createdTasks = [];
      for (const task of decomposition.tasks) {
        const created = await this.prisma.task.create({
          data: {
            type: task.type as any,
            title: task.title,
            description: task.description,
            priority: task.priority as any,
            payload: { parentGoal: goal, dependencies: task.dependencies },
            campaignId: context.campaignId,
            parentTaskId: context.taskId,
          },
        });
        createdTasks.push(created);

        // Notify the appropriate agent
        const agentType = this.mapTaskTypeToAgent(task.type);
        this.sendMessage(agentType, AgentMessageType.TASK_ASSIGNED, {
          taskId: created.id,
          title: task.title,
        });
      }

      await this.remember('last_decomposition', {
        goal,
        taskCount: createdTasks.length,
        strategy: decomposition.strategy,
        timestamp: new Date(),
      });

      await this.setStatus(AgentStatus.IDLE);
      await this.updateStats(true);

      return {
        success: true,
        data: {
          strategy: decomposition.strategy,
          tasksCreated: createdTasks.length,
          tasks: createdTasks.map((t) => ({
            id: t.id,
            type: t.type,
            title: t.title,
          })),
        },
        metrics: {
          durationMs: Date.now() - startTime,
        },
      };
    } catch (error) {
      await this.setStatus(AgentStatus.ERROR);
      await this.updateStats(false);

      return {
        success: false,
        error: (error as Error).message,
        metrics: { durationMs: Date.now() - startTime },
      };
    }
  }

  private mapTaskTypeToAgent(taskType: string): AgentType {
    const mapping: Record<string, AgentType> = {
      RESEARCH: AgentType.RESEARCH,
      CONTENT_GENERATION: AgentType.CONTENT,
      CAMPAIGN_SETUP: AgentType.CAMPAIGN,
      CAMPAIGN_MONITOR: AgentType.CAMPAIGN,
      ANALYTICS: AgentType.ANALYTICS,
      OPTIMIZATION: AgentType.OPTIMIZATION,
    };
    return mapping[taskType] ?? AgentType.MASTER;
  }
}
