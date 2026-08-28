import {
  Injectable,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { CreateProjectDto, UpdateProjectDto } from './dto/projects.dto';

@Injectable()
export class ProjectsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(userId: string, dto: CreateProjectDto) {
    return this.prisma.project.create({
      data: {
        userId,
        name: dto.name,
        description: dto.description,
        niche: dto.niche,
        targetAudience: dto.targetAudience ?? undefined,
        config: dto.config ?? {},
      },
      include: {
        _count: { select: { gigs: true, campaigns: true } },
      },
    });
  }

  async findAll(userId: string, page: number = 1, limit: number = 20) {
    const skip = (page - 1) * limit;

    const [projects, total] = await Promise.all([
      this.prisma.project.findMany({
        where: { userId },
        skip,
        take: limit,
        orderBy: { updatedAt: 'desc' },
        include: {
          _count: { select: { gigs: true, campaigns: true } },
        },
      }),
      this.prisma.project.count({ where: { userId } }),
    ]);

    return {
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findById(projectId: string, userId: string) {
    const project = await this.prisma.project.findUnique({
      where: { id: projectId },
      include: {
        gigs: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        campaigns: {
          orderBy: { updatedAt: 'desc' },
          take: 10,
        },
        _count: { select: { gigs: true, campaigns: true } },
      },
    });

    if (!project) {
      throw new NotFoundException('Project not found');
    }

    if (project.userId !== userId) {
      throw new ForbiddenException('Access denied');
    }

    return project;
  }

  async update(projectId: string, userId: string, dto: UpdateProjectDto) {
    await this.ensureOwnership(projectId, userId);

    return this.prisma.project.update({
      where: { id: projectId },
      data: {
        ...(dto.name && { name: dto.name }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.niche !== undefined && { niche: dto.niche }),
        ...(dto.targetAudience !== undefined && {
          targetAudience: dto.targetAudience,
        }),
        ...(dto.config !== undefined && { config: dto.config }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
      include: {
        _count: { select: { gigs: true, campaigns: true } },
      },
    });
  }

  async delete(projectId: string, userId: string) {
    await this.ensureOwnership(projectId, userId);

    await this.prisma.project.delete({
      where: { id: projectId },
    });

    return { message: 'Project deleted successfully' };
  }

  private async ensureOwnership(
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
}
