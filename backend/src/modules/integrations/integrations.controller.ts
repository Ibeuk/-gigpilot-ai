import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { IntegrationsService } from './integrations.service';
import { ConnectIntegrationDto } from './dto/integrations.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('integrations')
@UseGuards(JwtAuthGuard)
export class IntegrationsController {
  constructor(private readonly integrationsService: IntegrationsService) {}

  @Get()
  async findAll(@CurrentUser('sub') userId: string) {
    return this.integrationsService.findAll(userId);
  }

  @Get(':platform/status')
  async getStatus(
    @CurrentUser('sub') userId: string,
    @Param('platform') platform: string,
  ) {
    return this.integrationsService.getStatus(userId, platform);
  }

  @Post(':platform/connect')
  async connect(
    @CurrentUser('sub') userId: string,
    @Param('platform') platform: string,
    @Body() dto: ConnectIntegrationDto,
  ) {
    return this.integrationsService.connect(userId, platform, dto);
  }

  @Delete(':platform/disconnect')
  @HttpCode(HttpStatus.OK)
  async disconnect(
    @CurrentUser('sub') userId: string,
    @Param('platform') platform: string,
  ) {
    return this.integrationsService.disconnect(userId, platform);
  }
}
