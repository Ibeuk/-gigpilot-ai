import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ContentStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';
import { AgentEvents } from '../../agents/types/agent.types';

@Injectable()
export class ContentService {
  private readonly logger = new Logger(ContentService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  async create(dto: CreateContentDto) {
    const content = await this.prisma.content.create({
      data: {
        campaignId: dto.campaignId,
        type: dto.type,
        title: dto.title,
        body: dto.body,
        metadata: dto.metadata ?? {},
        platform: dto.platform,
        status: ContentStatus.GENERATED,
      },
    });

    this.eventEmitter.emit(AgentEvents.CONTENT_GENERATED, {
      contentId: content.id,
      type: content.type,
    });

    return content;
  }

  async findAll(
    filters: {
      campaignId?: string;
      type?: string;
      status?: string;
      platform?: string;
    },
    page: number = 1,
    limit: number = 20,
  ) {
    const skip = (page - 1) * limit;
    const where: any = {};

    if (filters.campaignId) where.campaignId = filters.campaignId;
    if (filters.type) where.type = filters.type;
    if (filters.status) where.status = filters.status;
    if (filters.platform) where.platform = filters.platform;

    const [content, total] = await Promise.all([
      this.prisma.content.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          campaign: { select: { id: true, name: true } },
        },
      }),
      this.prisma.content.count({ where }),
    ]);

    return {
      data: content,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async findById(id: string) {
    const content = await this.prisma.content.findUnique({
      where: { id },
      include: {
        campaign: { select: { id: true, name: true, type: true } },
      },
    });

    if (!content) {
      throw new NotFoundException('Content not found');
    }

    return content;
  }

  async update(id: string, dto: UpdateContentDto) {
    await this.findById(id);

    return this.prisma.content.update({
      where: { id },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.body !== undefined && { body: dto.body }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
        ...(dto.platform !== undefined && { platform: dto.platform }),
      },
    });
  }

  async delete(id: string) {
    await this.findById(id);
    await this.prisma.content.delete({ where: { id } });
    return { message: 'Content deleted successfully' };
  }

  // ─── Approval Workflow ──────────────────────────────

  async approve(id: string) {
    const content = await this.findById(id);

    if (
      content.status !== ContentStatus.GENERATED &&
      content.status !== ContentStatus.DRAFT
    ) {
      throw new BadRequestException(
        `Cannot approve content in ${content.status} status`,
      );
    }

    return this.prisma.content.update({
      where: { id },
      data: { status: ContentStatus.APPROVED },
    });
  }

  async reject(id: string) {
    const content = await this.findById(id);

    if (content.status === ContentStatus.PUBLISHED) {
      throw new BadRequestException('Cannot reject published content');
    }

    return this.prisma.content.update({
      where: { id },
      data: { status: ContentStatus.REJECTED },
    });
  }

  async publish(id: string) {
    const content = await this.findById(id);

    if (content.status !== ContentStatus.APPROVED) {
      throw new BadRequestException('Only approved content can be published');
    }

    return this.prisma.content.update({
      where: { id },
      data: {
        status: ContentStatus.PUBLISHED,
        publishedAt: new Date(),
      },
    });
  }
}
