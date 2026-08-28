import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { BaseAgent } from '../base/base-agent';
import { AgentContext, TaskResult } from '../types/agent.types';

/**
 * Research Agent — Market intelligence & competitive analysis.
 *
 * Responsibilities:
 * - Analyze target market and buyer personas
 * - Discover relevant keywords and search trends
 * - Conduct competitor analysis
 * - Generate market insights and recommendations
 */
export class ResearchAgent extends BaseAgent {
  constructor(
    prisma: PrismaService,
    eventEmitter: EventEmitter2,
    aiProvider: AIProviderService,
  ) {
    super(AgentType.RESEARCH, 'Research Agent', prisma, eventEmitter, aiProvider);
  }

  getSystemPrompt(): string {
    return `You are the Research Agent of GigPilot AI — a Fiverr gig promotion platform.

Your expertise is in market research, competitive analysis, and keyword discovery for freelance services.

When conducting research, you provide:
1. Buyer Persona Analysis — Who buys these services, their pain points, and decision factors
2. Keyword Discovery — High-value search terms and long-tail keywords
3. Competitor Analysis — What top sellers do differently
4. Market Trends — Current demand patterns and emerging opportunities
5. Pricing Intelligence — Optimal pricing based on market data

Always output structured, actionable insights. Be specific with data points and recommendations.
Format your analysis as JSON with clear sections.`;
  }

  async execute(context: AgentContext, payload: any): Promise<TaskResult> {
    const startTime = Date.now();
    await this.setStatus(AgentStatus.BUSY);

    try {
      const researchType = payload.researchType || 'market_analysis';
      const topic = payload.topic || payload.niche || payload.gig || '';

      this.logger.log(`Starting research: ${researchType} for "${topic}"`);

      let result: any;

      switch (researchType) {
        case 'buyer_persona':
          result = await this.analyzeBuyerPersona(topic, payload);
          break;
        case 'keyword_discovery':
          result = await this.discoverKeywords(topic, payload);
          break;
        case 'competitor_analysis':
          result = await this.analyzeCompetitors(topic, payload);
          break;
        default:
          result = await this.conductMarketAnalysis(topic, payload);
      }

      await this.remember(`research_${researchType}`, {
        topic,
        result,
        timestamp: new Date(),
      }, { ttlSeconds: 86400 }); // Cache for 24 hours

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

  private async analyzeBuyerPersona(topic: string, payload: any) {
    return this.thinkStructured(
      `Create a detailed buyer persona analysis for Fiverr services in: "${topic}"
      
Context: ${JSON.stringify(payload.context || {})}

Provide detailed buyer personas with demographics, pain points, buying behavior, and how to reach them.`,
      {
        personas: [
          {
            name: 'Persona Name',
            demographics: {},
            painPoints: [],
            buyingBehavior: '',
            reachStrategy: '',
          },
        ],
        marketSize: '',
        recommendations: [],
      },
      { temperature: 0.5, maxTokens: 3000 },
    );
  }

  private async discoverKeywords(topic: string, payload: any) {
    return this.thinkStructured(
      `Discover high-value keywords for promoting Fiverr services in: "${topic}"
      
Include primary keywords, long-tail variations, buyer-intent keywords, and trending terms.`,
      {
        primaryKeywords: [],
        longTailKeywords: [],
        buyerIntentKeywords: [],
        trendingTerms: [],
        recommendations: [],
      },
      { temperature: 0.4, maxTokens: 2500 },
    );
  }

  private async analyzeCompetitors(topic: string, payload: any) {
    return this.thinkStructured(
      `Analyze the competitive landscape for Fiverr services in: "${topic}"
      
What are top sellers doing? What gaps exist? How can a new seller differentiate?`,
      {
        topStrategies: [],
        gaps: [],
        differentiators: [],
        pricingInsights: {},
        recommendations: [],
      },
      { temperature: 0.5, maxTokens: 3000 },
    );
  }

  private async conductMarketAnalysis(topic: string, payload: any) {
    return this.thinkStructured(
      `Conduct a comprehensive market analysis for Fiverr services in: "${topic}"
      
Include market trends, demand analysis, pricing insights, and strategic recommendations.`,
      {
        marketOverview: '',
        trends: [],
        demandAnalysis: {},
        pricingInsights: {},
        opportunities: [],
        threats: [],
        recommendations: [],
      },
      { temperature: 0.5, maxTokens: 3000 },
    );
  }
}
