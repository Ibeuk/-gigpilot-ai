import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateGigDto, UpdateGigDto } from './dto/gigs.dto';

@Injectable()
export class GigsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(projectId: string, userId: string, dto: CreateGigDto) {
    await this.ensureProjectOwnership(projectId, userId);

    return this.prisma.gig.create({
      data: {
        projectId,
        title: dto.title,
        description: dto.description,
        category: dto.category,
        subcategory: dto.subcategory,
        keywords: dto.keywords ?? [],
        fiverrUrl: dto.fiverrUrl,
        pricing: dto.pricing ?? undefined,
        metadata: dto.metadata ?? {},
      },
    });
  }

  async findByProject(
    projectId: string,
    userId: string,
    page: number = 1,
    limit: number = 20,
  ) {
    await this.ensureProjectOwnership(projectId, userId);

    const skip = (page - 1) * limit;

    const [gigs, total] = await Promise.all([
      this.prisma.gig.findMany({
        where: { projectId },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: { select: { campaigns: true } },
        },
      }),
      this.prisma.gig.count({ where: { projectId } }),
    ]);

    return {
      data: gigs,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(gigId: string, userId: string) {
    const gig = await this.prisma.gig.findUnique({
      where: { id: gigId },
      include: {
        project: { select: { id: true, userId: true, name: true } },
        campaigns: {
          orderBy: { updatedAt: 'desc' },
          take: 5,
        },
        _count: { select: { campaigns: true } },
      },
    });

    if (!gig) {
      throw new NotFoundException('Gig not found');
    }

    if (gig.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return gig;
  }

  async update(gigId: string, userId: string, dto: UpdateGigDto) {
    await this.ensureGigOwnership(gigId, userId);

    return this.prisma.gig.update({
      where: { id: gigId },
      data: {
        ...(dto.title && { title: dto.title }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.category !== undefined && { category: dto.category }),
        ...(dto.subcategory !== undefined && { subcategory: dto.subcategory }),
        ...(dto.keywords !== undefined && { keywords: dto.keywords }),
        ...(dto.fiverrUrl !== undefined && { fiverrUrl: dto.fiverrUrl }),
        ...(dto.pricing !== undefined && { pricing: dto.pricing }),
        ...(dto.status !== undefined && { status: dto.status }),
        ...(dto.metadata !== undefined && { metadata: dto.metadata }),
      },
    });
  }

  async delete(gigId: string, userId: string) {
    await this.ensureGigOwnership(gigId, userId);

    await this.prisma.gig.delete({ where: { id: gigId } });

    return { message: 'Gig deleted successfully' };
  }

  private async ensureProjectOwnership(
    projectId: string,
    userId: string,
  ): Promise<void> {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      select: { userId: true },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }

  private async ensureGigOwnership(
    gigId: string,
    userId: string,
  ): Promise<void> {
    const gig = await this.prisma.gig.findUnique({
      where: { id: gigId },
      include: { project: { select: { userId: true } } },
    });

    if (!gig) {
      throw new NotFoundException('Gig not found');
    }

    if (gig.project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }
  }
}
