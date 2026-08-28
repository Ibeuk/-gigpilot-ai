import { Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus, LogLevel } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import {
  AgentContext,
  TaskResult,
  AIProvider,
  AgentEvents,
  AgentMessage,
  AgentMessageType,
} from '../types/agent.types';

/**
 * BaseAgent — Abstract foundation for all AI agents in GigPilot.
 *
 * Every agent (Master, Research, Content, Campaign, Analytics, Optimization)
 * extends this class and implements the `execute` method.
 *
 * Provides:
 * - LLM reasoning via `think()`
 * - Persistent memory via `remember()` / `recall()` / `forget()`
 * - Inter-agent messaging via `sendMessage()`
 * - Structured logging via `log()`
 * - Status management via `setStatus()`
 */
export abstract class BaseAgent {
  protected readonly logger: Logger;
  protected agentId: string | null = null;

  constructor(
    protected readonly agentType: AgentType,
    protected readonly agentName: string,
    protected readonly prisma: PrismaService,
    protected readonly eventEmitter: EventEmitter2,
    protected readonly aiProvider: AIProvider,
  ) {
    this.logger = new Logger(`Agent:${agentName}`);
  }

  // ─── Abstract Methods (implemented by each agent) ────

  /**
   * Execute a task assigned to this agent.
   * Each agent subclass implements its own execution logic.
   */
  abstract execute(context: AgentContext, payload: any): Promise<TaskResult>;

  /**
   * Get the system prompt for this agent's LLM interactions.
   */
  abstract getSystemPrompt(): string;

  // ─── Initialization ──────────────────────────────────

  /**
   * Initialize the agent in the database (upsert on startup).
   */
  async initialize(): Promise<void> {
    try {
      const agent = await this.prisma.agent.upsert({
        where: { type: this.agentType },
        update: {
          status: AgentStatus.IDLE,
          lastActiveAt: new Date(),
        },
        create: {
          type: this.agentType,
          name: this.agentName,
          description: this.getSystemPrompt().substring(0, 500),
          status: AgentStatus.IDLE,
          config: {},
        },
      });

      this.agentId = agent.id;
      this.logger.log(`Initialized (ID: ${agent.id})`);
    } catch (error) {
      this.logger.warn(
        `Database offline — Skipping DB registration for ${this.agentName}`,
      );
    }
  }

  // ─── LLM Reasoning ──────────────────────────────────

  /**
   * Use the AI provider to reason about a task.
   * This is the core "thinking" method — agents call this to
   * get LLM-generated responses for their domain tasks.
   */
  protected async think(
    prompt: string,
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: 'text' | 'json';
    },
  ): Promise<string> {
    const startTime = Date.now();

    try {
      const response = await this.aiProvider.generateText(prompt, {
        systemPrompt: this.getSystemPrompt(),
        temperature: options?.temperature ?? 0.7,
        maxTokens: options?.maxTokens ?? 2000,
        responseFormat: options?.responseFormat ?? 'text',
      });

      const duration = Date.now() - startTime;
      this.logger.debug(
        `Think completed in ${duration}ms (${response.tokensUsed.total} tokens)`,
      );

      return response.text;
    } catch (error) {
      this.logger.error(`Think failed: ${(error as Error).message}`);
      throw error;
    }
  }

  /**
   * Use the AI provider to generate structured data.
   * Returns a typed object parsed from the LLM response.
   */
  protected async thinkStructured<T>(
    prompt: string,
    schema: any,
    options?: {
      temperature?: number;
      maxTokens?: number;
    },
  ): Promise<T> {
    try {
      return await this.aiProvider.generateStructured<T>(prompt, schema, {
        systemPrompt: this.getSystemPrompt(),
        temperature: options?.temperature ?? 0.3,
        maxTokens: options?.maxTokens ?? 2000,
      });
    } catch (error) {
      this.logger.error(`Structured think failed: ${(error as Error).message}`);
      throw error;
    }
  }

  // ─── Memory System ───────────────────────────────────

  /**
   * Store a value in persistent agent memory.
   * Memory survives restarts — stored in PostgreSQL.
   */
  protected async remember(
    key: string,
    value: any,
    options?: { namespace?: string; ttlSeconds?: number },
  ): Promise<void> {
    if (!this.agentId) throw new Error('Agent not initialized');

    const namespace = options?.namespace ?? 'default';
    const expiresAt = options?.ttlSeconds
      ? new Date(Date.now() + options.ttlSeconds * 1000)
      : null;

    await this.prisma.agentMemory.upsert({
      where: {
        agentId_namespace_key: {
          agentId: this.agentId,
          namespace,
          key,
        },
      },
      update: {
        value: value as any,
        expiresAt,
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
      create: {
        agentId: this.agentId,
        namespace,
        key,
        value: value as any,
        expiresAt,
      },
    });
  }

  /**
   * Retrieve a value from agent memory.
   * Returns null if not found or expired.
   */
  protected async recall<T = any>(
    key: string,
    namespace: string = 'default',
  ): Promise<T | null> {
    if (!this.agentId) throw new Error('Agent not initialized');

    const memory = await this.prisma.agentMemory.findUnique({
      where: {
        agentId_namespace_key: {
          agentId: this.agentId,
          namespace,
          key,
        },
      },
    });

    if (!memory) return null;

    // Check expiration
    if (memory.expiresAt && memory.expiresAt < new Date()) {
      await this.prisma.agentMemory.delete({
        where: { id: memory.id },
      });
      return null;
    }

    // Update access tracking
    await this.prisma.agentMemory.update({
      where: { id: memory.id },
      data: {
        accessCount: { increment: 1 },
        lastAccessedAt: new Date(),
      },
    });

    return memory.value as T;
  }

  /**
   * Delete a memory entry.
   */
  protected async forget(
    key: string,
    namespace: string = 'default',
  ): Promise<void> {
    if (!this.agentId) throw new Error('Agent not initialized');

    await this.prisma.agentMemory.deleteMany({
      where: {
        agentId: this.agentId,
        namespace,
        key,
      },
    });
  }

  /**
   * Get all memories for this agent in a namespace.
   */
  protected async recallAll(
    namespace: string = 'default',
  ): Promise<Record<string, any>> {
    if (!this.agentId) throw new Error('Agent not initialized');

    const memories = await this.prisma.agentMemory.findMany({
      where: {
        agentId: this.agentId,
        namespace,
        OR: [
          { expiresAt: null },
          { expiresAt: { gt: new Date() } },
        ],
      },
    });

    return memories.reduce(
      (acc, mem) => {
        acc[mem.key] = mem.value;
        return acc;
      },
      {} as Record<string, any>,
    );
  }

  // ─── Inter-Agent Communication ───────────────────────

  /**
   * Send a message to another agent via the event bus.
   */
  protected sendMessage(
    to: AgentType,
    type: AgentMessageType,
    payload: any,
    correlationId?: string,
  ): void {
    const message: AgentMessage = {
      id: crypto.randomUUID(),
      from: this.agentType,
      to,
      type,
      payload,
      timestamp: new Date(),
      correlationId,
    };

    this.eventEmitter.emit(AgentEvents.AGENT_MESSAGE, message);
    this.eventEmitter.emit(`${AgentEvents.AGENT_MESSAGE}.${to}`, message);

    this.logger.debug(`Message sent to ${to}: ${type}`);
  }

  // ─── Status Management ───────────────────────────────

  /**
   * Update the agent's operational status.
   */
  protected async setStatus(status: AgentStatus): Promise<void> {
    if (!this.agentId) return;

    await this.prisma.agent.update({
      where: { id: this.agentId },
      data: {
        status,
        lastActiveAt: new Date(),
      },
    });

    this.eventEmitter.emit(AgentEvents.AGENT_STATUS_CHANGED, {
      agentId: this.agentId,
      agentType: this.agentType,
      status,
    });
  }

  // ─── Logging ─────────────────────────────────────────

  /**
   * Write a structured log entry to the database.
   */
  protected async log(
    level: LogLevel,
    message: string,
    data?: any,
    taskId?: string,
  ): Promise<void> {
    if (!this.agentId) return;

    try {
      await this.prisma.agentLog.create({
        data: {
          agentId: this.agentId,
          taskId,
          level,
          message,
          data: data ?? undefined,
        },
      });
    } catch {
      // Logging should never crash the agent
      this.logger.warn(`Failed to persist log: ${message}`);
    }
  }

  // ─── Task Statistics ─────────────────────────────────

  /**
   * Update the agent's task statistics after execution.
   */
  protected async updateStats(success: boolean): Promise<void> {
    if (!this.agentId) return;

    const agent = await this.prisma.agent.findUnique({
      where: { id: this.agentId },
    });

    if (!agent) return;

    const newTotal = agent.totalTasks + 1;
    const currentSuccesses = Math.round(agent.successRate * agent.totalTasks);
    const newSuccesses = success ? currentSuccesses + 1 : currentSuccesses;

    await this.prisma.agent.update({
      where: { id: this.agentId },
      data: {
        totalTasks: newTotal,
        successRate: newTotal > 0 ? newSuccesses / newTotal : 0,
        lastActiveAt: new Date(),
      },
    });
  }
}
