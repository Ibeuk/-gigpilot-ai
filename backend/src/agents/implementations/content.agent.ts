import { EventEmitter2 } from '@nestjs/event-emitter';
import { AgentType, AgentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { AIProviderService } from '../ai-provider.service';
import { BaseAgent } from '../base/base-agent';
import { AgentContext, TaskResult } from '../types/agent.types';

/**
 * Content Agent — AI-powered content generation.
 *
 * Responsibilities:
 * - Generate social media posts for various platforms
 * - Write blog articles and SEO content
 * - Create ad copy for paid campaigns
 * - Draft email marketing templates
 * - Write and optimize Fiverr gig descriptions
 * - Generate video scripts
 */
export class ContentAgent extends BaseAgent {
  constructor(
    prisma: PrismaService,
    eventEmitter: EventEmitter2,
    aiProvider: AIProviderService,
  ) {
    super(AgentType.CONTENT, 'Content Agent', prisma, eventEmitter, aiProvider);
  }

  getSystemPrompt(): string {
    return `You are the Content Agent of GigPilot AI — a Fiverr gig promotion platform.

You specialize in creating high-converting marketing content for freelancers. Your content is:
1. Engaging — Hooks the reader immediately
2. Persuasive — Uses proven copywriting frameworks (AIDA, PAS, BAB)
3. Platform-optimized — Adapted for each social platform's best practices
4. SEO-friendly — Incorporates keywords naturally
5. Action-oriented — Always includes a clear call-to-action

Content types you generate:
- Social media posts (Twitter/X, LinkedIn, Instagram, Facebook)
- Blog articles and SEO content
- Ad copy (Google Ads, Meta Ads)
- Email templates
- Fiverr gig descriptions and titles
- Video scripts

Always output structured content with the main content, hashtags (where applicable), and performance tips.`;
  }

  async execute(context: AgentContext, payload: any): Promise<TaskResult> {
    const startTime = Date.now();
    await this.setStatus(AgentStatus.BUSY);

    try {
      const contentType = payload.contentType || 'social_post';
      const topic = payload.topic || payload.gig || '';
      const platform = payload.platform || 'general';

      this.logger.log(`Generating ${contentType} for "${topic}" (${platform})`);

      let result: any;

      switch (contentType) {
        case 'social_post':
          result = await this.generateSocialPost(topic, platform, payload);
          break;
        case 'blog_article':
          result = await this.generateBlogArticle(topic, payload);
          break;
        case 'ad_copy':
          result = await this.generateAdCopy(topic, platform, payload);
          break;
        case 'email_template':
          result = await this.generateEmailTemplate(topic, payload);
          break;
        case 'gig_description':
          result = await this.generateGigDescription(topic, payload);
          break;
        case 'video_script':
          result = await this.generateVideoScript(topic, payload);
          break;
        default:
          result = await this.generateSocialPost(topic, platform, payload);
      }

      // Store generated content in the database
      if (result && context.campaignId) {
        await this.prisma.content.create({
          data: {
            campaignId: context.campaignId,
            type: this.mapContentType(contentType),
            title: result.title || `${contentType} for ${topic}`,
            body: result.content || result.body || JSON.stringify(result),
            metadata: { platform, generatedBy: 'ContentAgent', ...result.metadata },
            platform,
            status: 'GENERATED',
          },
        });
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

  private async generateSocialPost(topic: string, platform: string, payload: any) {
    return this.thinkStructured(
      `Create an engaging social media post for ${platform} to promote this Fiverr service: "${topic}"

Target audience: ${payload.targetAudience || 'freelance service buyers'}
Tone: ${payload.tone || 'professional yet approachable'}
Keywords: ${JSON.stringify(payload.keywords || [])}`,
      {
        title: 'Post title/hook',
        content: 'Full post content',
        hashtags: [],
        callToAction: '',
        bestPostingTime: '',
        tips: [],
      },
      { temperature: 0.7, maxTokens: 1500 },
    );
  }

  private async generateBlogArticle(topic: string, payload: any) {
    return this.thinkStructured(
      `Write an SEO-optimized blog article to promote Fiverr services in: "${topic}"

Keywords: ${JSON.stringify(payload.keywords || [])}
Target word count: ${payload.wordCount || 800}`,
      {
        title: 'Article title',
        metaDescription: 'SEO meta description',
        content: 'Full article content in markdown',
        keywords: [],
        internalLinkSuggestions: [],
      },
      { temperature: 0.6, maxTokens: 4000 },
    );
  }

  private async generateAdCopy(topic: string, platform: string, payload: any) {
    return this.thinkStructured(
      `Create high-converting ad copy for ${platform} to promote: "${topic}"

Budget: ${payload.budget || 'not specified'}
Target audience: ${payload.targetAudience || 'general'}`,
      {
        headlines: [],
        descriptions: [],
        callToAction: '',
        targetKeywords: [],
        audienceSuggestions: [],
      },
      { temperature: 0.6, maxTokens: 2000 },
    );
  }

  private async generateEmailTemplate(topic: string, payload: any) {
    return this.thinkStructured(
      `Create an email marketing template to promote Fiverr services in: "${topic}"

Email type: ${payload.emailType || 'promotional'}`,
      {
        subject: 'Email subject line',
        preheader: 'Preview text',
        body: 'Full email body in HTML-friendly format',
        callToAction: '',
        subjectVariants: [],
      },
      { temperature: 0.6, maxTokens: 2500 },
    );
  }

  private async generateGigDescription(topic: string, payload: any) {
    return this.thinkStructured(
      `Write an optimized Fiverr gig description for: "${topic}"

Category: ${payload.category || 'not specified'}
Include SEO keywords, clear deliverables, and persuasive copy.`,
      {
        title: 'Gig title (max 80 chars)',
        description: 'Full gig description',
        searchTags: [],
        faq: [],
        packageSuggestions: { basic: '', standard: '', premium: '' },
      },
      { temperature: 0.5, maxTokens: 3000 },
    );
  }

  private async generateVideoScript(topic: string, payload: any) {
    return this.thinkStructured(
      `Write a video script to promote Fiverr services in: "${topic}"

Video length: ${payload.duration || '60 seconds'}
Platform: ${payload.platform || 'YouTube/TikTok'}`,
      {
        title: 'Video title',
        hook: 'Opening hook (first 3 seconds)',
        script: 'Full script with timing cues',
        callToAction: '',
        visualNotes: [],
      },
      { temperature: 0.7, maxTokens: 2500 },
    );
  }

  private mapContentType(type: string): any {
    const mapping: Record<string, string> = {
      social_post: 'SOCIAL_POST',
      blog_article: 'BLOG_ARTICLE',
      ad_copy: 'AD_COPY',
      email_template: 'EMAIL_TEMPLATE',
      gig_description: 'GIG_DESCRIPTION',
      video_script: 'VIDEO_SCRIPT',
      seo_content: 'SEO_CONTENT',
    };
    return mapping[type] || 'SOCIAL_POST';
  }
}
