import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { BaseAgent } from '../base/base-agent';
import { AgentContext, TaskResult } from '../types/agent.types';

/**
 * Campaign Agent — Campaign lifecycle management.
 *
 * Responsibilities:
 * - Generate campaign strategies based on research
 * - Configure campaign parameters (targeting, budget, schedule)
 * - Monitor campaign performance
 * - Suggest budget adjustments
 */
export class CampaignAgent extends BaseAgent {
  constructor(
    prisma: PrismaService,
    eventEmitter: EventEmitter2,
    aiProvider: AIProviderService,
  ) {
    super(AgentType.CAMPAIGN, 'Campaign Agent', prisma, eventEmitter, aiProvider);
  }

  getSystemPrompt(): string {
    return `You are the Campaign Agent of GigPilot AI — a Fiverr gig promotion platform.

You manage the lifecycle of marketing campaigns for freelancers. Your responsibilities:
1. Generate data-driven campaign strategies
2. Configure targeting, budgets, and schedules
3. Monitor active campaign performance
4. Recommend adjustments based on real-time data
5. Manage multi-channel campaign coordination

You understand:
- Social media advertising (Meta, Google, LinkedIn, Twitter)
- Content marketing campaigns
- SEO campaigns
- Email marketing automation
- Multi-channel strategy orchestration

Always provide specific, actionable configurations with measurable KPIs.`;
  }

  async execute(context: AgentContext, payload: any): Promise<TaskResult> {
    const startTime = Date.now();
    await this.setStatus(AgentStatus.BUSY);

    try {
      const action = payload.action || 'generate_strategy';

      let result: any;

      switch (action) {
        case 'generate_strategy':
          result = await this.generateStrategy(payload);
          break;
        case 'configure':
          result = await this.configureCampaign(payload);
          break;
        case 'monitor':
          result = await this.monitorCampaign(context.campaignId, payload);
          break;
        default:
          result = await this.generateStrategy(payload);
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

  private async generateStrategy(payload: any) {
    return this.thinkStructured(
      `Generate a comprehensive marketing campaign strategy for:
      
Gig/Service: "${payload.gig || payload.topic || 'Not specified'}"
Niche: ${payload.niche || 'Not specified'}
Budget: ${payload.budget || 'Flexible'}
Duration: ${payload.duration || '30 days'}
Goal: ${payload.goal || 'Increase visibility and orders'}`,
      {
        strategy: {
          overview: '',
          channels: [],
          phases: [],
          kpis: [],
        },
        targeting: {
          audiences: [],
          demographics: {},
          interests: [],
        },
        budget: {
          total: 0,
          allocation: {},
          dailyBudget: 0,
        },
        schedule: {
          startDate: '',
          endDate: '',
          milestones: [],
        },
        recommendations: [],
      },
      { temperature: 0.5, maxTokens: 3000 },
    );
  }

  private async configureCampaign(payload: any) {
    return this.thinkStructured(
      `Configure the campaign parameters for: "${payload.campaignName || 'Campaign'}"
      
Type: ${payload.type || 'MULTI_CHANNEL'}
Strategy: ${JSON.stringify(payload.strategy || {})}`,
      {
        configuration: {
          platforms: [],
          targeting: {},
          creativeRequirements: [],
          budgetAllocation: {},
          schedulingRules: {},
        },
        checklist: [],
        risks: [],
      },
      { temperature: 0.4, maxTokens: 2500 },
    );
  }

  private async monitorCampaign(campaignId: string | undefined, payload: any) {
    if (!campaignId) {
      return { status: 'No campaign ID provided', recommendations: [] };
    }

    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        snapshots: { orderBy: { capturedAt: 'desc' }, take: 5 },
      },
    });

    if (!campaign) {
      return { status: 'Campaign not found', recommendations: [] };
    }

    const latestMetrics = campaign.snapshots[0]?.metrics || {};

    return this.thinkStructured(
      `Monitor and analyze this campaign's performance:
      
Campaign: "${campaign.name}" (${campaign.type})
Status: ${campaign.status}
Latest Metrics: ${JSON.stringify(latestMetrics)}`,
      {
        healthScore: 0,
        status: '',
        insights: [],
        recommendations: [],
        alerts: [],
      },
      { temperature: 0.4, maxTokens: 2000 },
    );
  }
}
