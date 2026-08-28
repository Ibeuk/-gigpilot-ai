import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { CampaignStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaigns.dto';
import { AgentEvents } from '../../agents/types/agent.types';

@Injectable()
export class CampaignsService {
  private readonly logger = new Logger(CampaignsService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(userId: string, dto: CreateCampaignDto) {
    // Verify project ownership
    await this.ensureProjectOwnership(dto.projectId, userId);

    const campaign = await this.prisma.campaign.create({
      data: {
        projectId: dto.projectId,
        gigId: dto.gigId,
        name: dto.name,
        type: dto.type,
        strategy: dto.strategy ?? {},
        budget: dto.budget ?? undefined,
        targeting: dto.targeting ?? undefined,
        schedule: dto.schedule ?? undefined,
        startDate: dto.startDate ? new Date(dto.startDate) : undefined,
        endDate: dto.endDate ? new Date(dto.endDate) : undefined,
      },
      include: {
        project: { select: { id: true, name: true } },
        gig: { select: { id: true, title: true } },
      },
    });

    this.eventEmitter.emit(AgentEvents.CAMPAIGN_CREATED, {
      campaignId: campaign.id,
      userId,
    });

    return campaign;
  }

  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [campaigns, total] = await Promise.all([
      this.prisma.campaign.findMany({
        where: { project: { userId } },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          project: { select: { id: true, name: true } },
          gig: { select: { id: true, title: true } },
          _count: { select: { tasks: true, content: true, snapshots: true } },
        },
      }),
      this.prisma.campaign.count({
        where: { project: { userId } },
      }),
    ]);

    return {
      data: campaigns,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(campaignId: string, userId: string) {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: {
        project: { select: { id: true, name: true, userId: true } },
        gig: { select: { id: true, title: true } },
        tasks: { orderBy: { createdAt: 'desc' }, take: 10 },
        content: { orderBy: { createdAt: 'desc' }, take: 10 },
        _count: { select: { tasks: true, content: true, snapshots: true } },
      },
    });

    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    if (campaign.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return campaign;
  }

  async update(campaignId: string, userId: string, dto: UpdateCampaignDto) {
    await this.ensureCampaignOwnership(campaignId, userId);

    return this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.strategy !== undefined && { strategy: dto.strategy }),
        ...(dto.budget !== undefined && { budget: dto.budget }),
        ...(dto.targeting !== undefined && { targeting: dto.targeting }),
        ...(dto.schedule !== undefined && { schedule: dto.schedule }),
        ...(dto.startDate !== undefined && {
          startDate: new Date(dto.startDate),
        }),
        ...(dto.endDate !== undefined && { endDate: new Date(dto.endDate) }),
      },
      include: {
        project: { select: { id: true, name: true } },
        gig: { select: { id: true, title: true } },
      },
    });
  }

  async delete(campaignId: string, userId: string) {
    await this.ensureCampaignOwnership(campaignId, userId);

    await this.prisma.campaign.delete({ where: { id: campaignId } });

    return { message: 'Campaign deleted successfully' };
  }

  // ─── Status Transitions ──────────────────────────────

  async start(campaignId: string, userId: string) {
    const campaign = await this.findById(campaignId, userId);

    if (
      campaign.status !== CampaignStatus.DRAFT &&
      campaign.status !== CampaignStatus.PAUSED &&
      campaign.status !== CampaignStatus.SCHEDULED
    ) {
      throw new BadRequestException(
        `Cannot start campaign in ${campaign.status} status`,
      );
    }

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.ACTIVE,
        startDate: campaign.startDate ?? new Date(),
      },
    });

    this.eventEmitter.emit(AgentEvents.CAMPAIGN_UPDATED, {
      campaignId,
      status: CampaignStatus.ACTIVE,
      userId,
    });

    this.logger.log(`Campaign started: ${campaignId}`);

    return updated;
  }

  async pause(campaignId: string, userId: string) {
    const campaign = await this.findById(campaignId, userId);

    if (campaign.status !== CampaignStatus.ACTIVE) {
      throw new BadRequestException('Only active campaigns can be paused');
    }

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: { status: CampaignStatus.PAUSED },
    });

    this.eventEmitter.emit(AgentEvents.CAMPAIGN_UPDATED, {
      campaignId,
      status: CampaignStatus.PAUSED,
      userId,
    });

    return updated;
  }

  async complete(campaignId: string, userId: string) {
    const campaign = await this.findById(campaignId, userId);

    if (
      campaign.status !== CampaignStatus.ACTIVE &&
      campaign.status !== CampaignStatus.PAUSED
    ) {
      throw new BadRequestException(
        'Only active or paused campaigns can be completed',
      );
    }

    const updated = await this.prisma.campaign.update({
      where: { id: campaignId },
      data: {
        status: CampaignStatus.COMPLETED,
        endDate: new Date(),
      },
    });

    this.eventEmitter.emit(AgentEvents.CAMPAIGN_UPDATED, {
      campaignId,
      status: CampaignStatus.COMPLETED,
      userId,
    });

    return updated;
  }

  // ─── Helpers ──────────────────────────────────────────

  private async ensureProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) throw new NotFoundException('Project not found');
    if (project.userId !== userId)
      throw new ForbiddenException('Access denied');
  }

  private async ensureCampaignOwnership(
    campaignId: string,
    userId: string,
  ): Promise<void> {
    const campaign = await this.prisma.campaign.findUnique({
      where: { id: campaignId },
      include: { project: { select: { userId: true } } },
    });

    if (!campaign) throw new NotFoundException('Campaign not found');
    if (campaign.project.userId !== userId)
      throw new ForbiddenException('Access denied');
  }
}
