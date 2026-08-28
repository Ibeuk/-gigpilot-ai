import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { BaseAgent } from '../base/base-agent';
import { AgentContext, TaskResult } from '../types/agent.types';

/**
 * Optimization Agent — Continuous improvement recommendations.
 *
 * Responsibilities:
 * - Recommend campaign optimizations based on performance data
 * - Suggest A/B test configurations
 * - Recommend budget reallocation
 * - Propose targeting refinements
 * - Optimize content strategy based on engagement data
 */
export class OptimizationAgent extends BaseAgent {
  constructor(
    prisma: PrismaService,
    eventEmitter: EventEmitter2,
    aiProvider: AIProviderService,
  ) {
    super(AgentType.OPTIMIZATION, 'Optimization Agent', prisma, eventEmitter, aiProvider);
  }

  getSystemPrompt(): string {
    return `You are the Optimization Agent of GigPilot AI — a Fiverr gig promotion platform.

You continuously analyze data to recommend improvements. Your capabilities:
1. Campaign Optimization — Improve targeting, budgets, and creatives
2. A/B Testing — Design and analyze A/B test experiments
3. Budget Optimization — Reallocate spend to maximize ROI
4. Targeting Refinement — Identify and recommend better audience segments
5. Content Optimization — Improve content performance through data-driven suggestions
6. Gig Optimization — Enhance gig listings for better search ranking and conversion

You think like a growth hacker — always testing, measuring, and iterating.
Prioritize recommendations by expected impact and ease of implementation.`;
  }

  async execute(context: AgentContext, payload: any): Promise<TaskResult> {
    const startTime = Date.now();
    await this.setStatus(AgentStatus.BUSY);

    try {
      const action = payload.action || 'optimize';

      let result: any;

      switch (action) {
        case 'optimize':
          result = await this.generateOptimizations(context.campaignId, payload);
          break;
        case 'ab_test':
          result = await this.designABTest(payload);
          break;
        case 'budget':
          result = await this.optimizeBudget(payload);
          break;
        case 'gig':
          result = await this.optimizeGig(payload);
          break;
        default:
          result = await this.generateOptimizations(context.campaignId, payload);
      }

      await this.setStatus(AgentStatus.IDLE);
      await this.updateStats(true);

      return {
        success: true,
        data: result,
        metrics: { durationMs: Date.now() - startTime },
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

  private async generateOptimizations(campaignId: string | undefined, payload: any) {
    let campaignContext = '';

    if (campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          snapshots: { orderBy: { capturedAt: 'desc' }, take: 10 },
        },
      });

      if (campaign) {
        campaignContext = `Campaign: "${campaign.name}" (${campaign.type}, ${campaign.status})
Metrics history: ${JSON.stringify(campaign.snapshots.map((s) => s.metrics))}`;
      }
    }

    return this.thinkStructured(
      `Generate optimization recommendations:

${campaignContext}
Current performance: ${JSON.stringify(payload.metrics || {})}
Goal: ${payload.goal || 'Improve overall ROI'}`,
      {
        recommendations: [
          {
            title: '',
            description: '',
            expectedImpact: '',
            effort: 'LOW|MEDIUM|HIGH',
            priority: 1,
            category: '',
          },
        ],
        quickWins: [],
        longTermStrategies: [],
      },
      { temperature: 0.5, maxTokens: 3000 },
    );
  }

  private async designABTest(payload: any) {
    return this.thinkStructured(
      `Design an A/B test for: "${payload.element || 'campaign'}"

Current version: ${JSON.stringify(payload.current || {})}
Hypothesis: ${payload.hypothesis || 'Not specified'}`,
      {
        testName: '',
        hypothesis: '',
        variants: [],
        metrics: [],
        sampleSize: 0,
        duration: '',
        successCriteria: '',
      },
      { temperature: 0.5, maxTokens: 2000 },
    );
  }

  private async optimizeBudget(payload: any) {
    return this.thinkStructured(
      `Optimize budget allocation:

Total budget: ${payload.totalBudget || 'Not specified'}
Current allocation: ${JSON.stringify(payload.currentAllocation || {})}
Channel performance: ${JSON.stringify(payload.channelPerformance || {})}`,
      {
        recommendedAllocation: {},
        expectedROI: {},
        rationale: [],
        risks: [],
      },
      { temperature: 0.4, maxTokens: 2000 },
    );
  }

  private async optimizeGig(payload: any) {
    return this.thinkStructured(
      `Optimize this Fiverr gig listing:

Title: "${payload.title || ''}"
Description: "${payload.description || ''}"
Category: ${payload.category || 'Not specified'}
Current keywords: ${JSON.stringify(payload.keywords || [])}`,
      {
        optimizedTitle: '',
        optimizedDescription: '',
        recommendedKeywords: [],
        pricingRecommendation: {},
        packageOptimization: {},
        thumbnailTips: [],
        seoImprovements: [],
      },
      { temperature: 0.5, maxTokens: 3000 },
    );
  }
}
