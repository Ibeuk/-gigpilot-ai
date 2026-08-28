import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { AnalyticsService } from './analytics.service';
import { CreateSnapshotDto, QueryAnalyticsDto } from './dto/analytics.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('analytics')
@UseGuards(JwtAuthGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Post('snapshots')
  async createSnapshot(@Body() dto: CreateSnapshotDto) {
    return this.analyticsService.createSnapshot(dto);
  }

  @Get('campaigns/:campaignId')
  async getSnapshots(
    @Param('campaignId') campaignId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 50,
  ) {
    return this.analyticsService.getSnapshots(campaignId, page, limit);
  }

  @Get('insights')
  async getInsights(@Query() query: QueryAnalyticsDto) {
    return this.analyticsService.getInsights(query);
  }

  @Get('dashboard')
  async getDashboard(@CurrentUser('sub') userId: string) {
    return this.analyticsService.getDashboard(userId);
  }
}
