import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateSnapshotDto, QueryAnalyticsDto } from './dto/analytics.dto';
import { AgentEvents } from '../../agents/types/agent.types';

@Injectable()
export class AnalyticsService {
  private readonly logger = new Logger(AnalyticsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async createSnapshot(dto: CreateSnapshotDto) {
    const snapshot = await this.prisma.analyticsSnapshot.create({
      data: {
        campaignId: dto.campaignId,
        metrics: dto.metrics,
        insights: dto.insights ?? undefined,
        period: dto.period,
      },
    });

    this.eventEmitter.emit(AgentEvents.ANALYTICS_CAPTURED, {
      snapshotId: snapshot.id,
      campaignId: dto.campaignId,
    });

    return snapshot;
  }

  async getSnapshots(
    campaignId: string,
    page: number = 1,
    limit: number = 50,
  ) {
    const skip = (page - 1) * limit;

    const [snapshots, total] = await Promise.all([
      this.prisma.analyticsSnapshot.findMany({
        where: { campaignId },
        skip,
        take: limit,
        orderBy: { capturedAt: 'desc' },
      }),
      this.prisma.analyticsSnapshot.count({ where: { campaignId } }),
    ]);

    return {
      data: snapshots,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async getInsights(query: QueryAnalyticsDto) {
    const where: any = {};

    if (query.campaignId) where.campaignId = query.campaignId;
    if (query.period) where.period = query.period;
    if (query.startDate || query.endDate) {
      where.capturedAt = {};
      if (query.startDate) where.capturedAt.gte = new Date(query.startDate);
      if (query.endDate) where.capturedAt.lte = new Date(query.endDate);
    }

    const snapshots = await this.prisma.analyticsSnapshot.findMany({
      where,
      orderBy: { capturedAt: 'desc' },
      take: 100,
    });

    // Basic insight aggregation
    const totalSnapshots = snapshots.length;

    if (totalSnapshots === 0) {
      return {
        summary: 'No analytics data available for the given filters',
        snapshots: [],
        aggregated: {},
      };
    }

    return {
      summary: `${totalSnapshots} snapshots found`,
      snapshots,
      latest: snapshots[0],
    };
  }

  async getDashboard(userId: string) {
    // Get user's campaigns with latest analytics
    const campaigns = await this.prisma.campaign.findMany({
      where: { project: { userId } },
      include: {
        snapshots: {
          orderBy: { capturedAt: 'desc' },
          take: 1,
        },
        _count: {
          select: { tasks: true, content: true, snapshots: true },
        },
      },
    });

    const activeCampaigns = campaigns.filter((c) => c.status === 'ACTIVE');
    const totalTasks = campaigns.reduce(
      (sum, c) => sum + c._count.tasks,
      0,
    );
    const totalContent = campaigns.reduce(
      (sum, c) => sum + c._count.content,
      0,
    );

    return {
      overview: {
        totalCampaigns: campaigns.length,
        activeCampaigns: activeCampaigns.length,
        totalTasks,
        totalContent,
      },
      campaigns: campaigns.map((c) => ({
        id: c.id,
        name: c.name,
        status: c.status,
        type: c.type,
        latestSnapshot: c.snapshots[0] ?? null,
        counts: c._count,
      })),
    };
  }
}
