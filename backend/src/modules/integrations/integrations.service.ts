import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { IntegrationPlatform, IntegrationStatus } from '@prisma/client';
import { PrismaService } from '../../common/prisma/prisma.service';
import { ConnectIntegrationDto } from './dto/integrations.dto';

@Injectable()
export class IntegrationsService {
  private readonly logger = new Logger(IntegrationsService.name);

  constructor(private readonly prisma: PrismaService) {}

  async findAll(userId: string) {
    const integrations = await this.prisma.integration.findMany({
      where: { userId },
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        platform: true,
        status: true,
        lastSyncAt: true,
        errorMessage: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    // Return all platforms with connection status
    const allPlatforms = Object.values(IntegrationPlatform);
    return allPlatforms.map((platform) => {
      const existing = integrations.find((i) => i.platform === platform);
      return (
        existing ?? {
          platform,
          status: IntegrationStatus.DISCONNECTED,
          lastSyncAt: null,
          errorMessage: null,
        }
      );
    });
  }

  async connect(
    userId: string,
    platform: string,
    dto: ConnectIntegrationDto,
  ) {
    // Validate platform enum
    if (!Object.values(IntegrationPlatform).includes(platform as IntegrationPlatform)) {
      throw new BadRequestException(`Invalid platform: ${platform}`);
    }

    const platformEnum = platform as IntegrationPlatform;

    const integration = await this.prisma.integration.upsert({
      where: {
        userId_platform: { userId, platform: platformEnum },
      },
      update: {
        status: IntegrationStatus.CONNECTED,
        config: dto.config ?? {},
        errorMessage: null,
        lastSyncAt: new Date(),
      },
      create: {
        userId,
        platform: platformEnum,
        status: IntegrationStatus.CONNECTED,
        config: dto.config ?? {},
      },
    });

    // Store OAuth tokens if provided
    if (dto.accessToken) {
      await this.prisma.oAuthToken.create({
        data: {
          integrationId: integration.id,
          accessToken: dto.accessToken,
          refreshToken: dto.refreshToken,
        },
      });
    }

    this.logger.log(
      `Integration connected: ${platform} for user ${userId}`,
    );

    return {
      id: integration.id,
      platform: integration.platform,
      status: integration.status,
      message: `${platform} connected successfully`,
    };
  }

  async disconnect(userId: string, platform: string) {
    if (!Object.values(IntegrationPlatform).includes(platform as IntegrationPlatform)) {
      throw new BadRequestException(`Invalid platform: ${platform}`);
    }

    const platformEnum = platform as IntegrationPlatform;

    const integration = await this.prisma.integration.findUnique({
      where: {
        userId_platform: { userId, platform: platformEnum },
      },
    });

    if (!integration) {
      throw new NotFoundException(`No ${platform} integration found`);
    }

    await this.prisma.integration.update({
      where: { id: integration.id },
      data: { status: IntegrationStatus.DISCONNECTED },
    });

    // Remove OAuth tokens
    await this.prisma.oAuthToken.deleteMany({
      where: { integrationId: integration.id },
    });

    this.logger.log(
      `Integration disconnected: ${platform} for user ${userId}`,
    );

    return { message: `${platform} disconnected successfully` };
  }

  async getStatus(userId: string, platform: string) {
    if (!Object.values(IntegrationPlatform).includes(platform as IntegrationPlatform)) {
      throw new BadRequestException(`Invalid platform: ${platform}`);
    }

    const platformEnum = platform as IntegrationPlatform;

    const integration = await this.prisma.integration.findUnique({
      where: {
        userId_platform: { userId, platform: platformEnum },
      },
      select: {
        id: true,
        platform: true,
        status: true,
        lastSyncAt: true,
        errorMessage: true,
      },
    });

    return (
      integration ?? {
        platform: platformEnum,
        status: IntegrationStatus.DISCONNECTED,
        lastSyncAt: null,
      }
    );
  }
}
