import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { BaseAgent } from '../base/base-agent';
import { AgentContext, TaskResult } from '../types/agent.types';

/**
 * Analytics Agent — Data analysis and reporting.
 *
 * Responsibilities:
 * - Analyze campaign performance data
 * - Detect trends and anomalies
 * - Generate performance reports
 * - Provide actionable insights
 */
export class AnalyticsAgent extends BaseAgent {
  constructor(
    prisma: PrismaService,
    eventEmitter: EventEmitter2,
    aiProvider: AIProviderService,
  ) {
    super(AgentType.ANALYTICS, 'Analytics Agent', prisma, eventEmitter, aiProvider);
  }

  getSystemPrompt(): string {
    return `You are the Analytics Agent of GigPilot AI — a Fiverr gig promotion platform.

You analyze performance data and generate insights. Your capabilities:
1. Performance Analysis — Evaluate campaign metrics and ROI
2. Trend Detection — Identify upward/downward trends in key metrics
3. Anomaly Detection — Flag unusual patterns that need attention
4. Report Generation — Create comprehensive performance reports
5. Predictive Insights — Forecast future performance based on trends

You work with metrics like: impressions, clicks, CTR, conversions, cost-per-acquisition, 
engagement rate, reach, orders, revenue, and customer lifetime value.

Always provide data-driven insights with specific numbers and actionable recommendations.`;
  }

  async execute(context: AgentContext, payload: any): Promise<TaskResult> {
    const startTime = Date.now();
    await this.setStatus(AgentStatus.BUSY);

    try {
      const action = payload.action || 'analyze';

      let result: any;

      switch (action) {
        case 'analyze':
          result = await this.analyzePerformance(payload);
          break;
        case 'report':
          result = await this.generateReport(context.campaignId, payload);
          break;
        case 'trends':
          result = await this.detectTrends(payload);
          break;
        default:
          result = await this.analyzePerformance(payload);
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

  private async analyzePerformance(payload: any) {
    const metrics = payload.metrics || {};

    return this.thinkStructured(
      `Analyze these campaign performance metrics and provide insights:

Metrics: ${JSON.stringify(metrics)}
Period: ${payload.period || 'last 7 days'}
Campaign Type: ${payload.campaignType || 'not specified'}`,
      {
        summary: '',
        keyMetrics: {},
        performanceScore: 0,
        trends: [],
        anomalies: [],
        insights: [],
        recommendations: [],
      },
      { temperature: 0.3, maxTokens: 2500 },
    );
  }

  private async generateReport(campaignId: string | undefined, payload: any) {
    let campaignData = {};

    if (campaignId) {
      const campaign = await this.prisma.campaign.findUnique({
        where: { id: campaignId },
        include: {
          snapshots: { orderBy: { capturedAt: 'desc' }, take: 30 },
          content: { select: { id: true, type: true, status: true } },
          _count: { select: { tasks: true, content: true } },
        },
      });
      campaignData = campaign || {};
    }

    return this.thinkStructured(
      `Generate a comprehensive performance report:

Campaign Data: ${JSON.stringify(campaignData)}
Report Period: ${payload.period || 'last 30 days'}
Report Type: ${payload.reportType || 'full'}`,
      {
        reportTitle: '',
        executiveSummary: '',
        metricsOverview: {},
        channelBreakdown: [],
        contentPerformance: [],
        recommendations: [],
        nextSteps: [],
      },
      { temperature: 0.3, maxTokens: 4000 },
    );
  }

  private async detectTrends(payload: any) {
    return this.thinkStructured(
      `Detect trends in this performance data:

Data: ${JSON.stringify(payload.data || {})}
Metrics to analyze: ${JSON.stringify(payload.metrics || ['impressions', 'clicks', 'conversions'])}`,
      {
        trends: [],
        anomalies: [],
        predictions: [],
        alerts: [],
      },
      { temperature: 0.3, maxTokens: 2000 },
    );
  }
}
