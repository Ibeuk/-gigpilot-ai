import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto, UpdateCampaignDto } from './dto/campaigns.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller('campaigns')
@UseGuards(JwtAuthGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  async create(
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateCampaignDto,
  ) {
    return this.campaignsService.create(userId, dto);
  }

  @Get()
  async findAll(
    @CurrentUser('sub') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.campaignsService.findAll(userId, page, limit);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.campaignsService.findById(id, userId);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateCampaignDto,
  ) {
    return this.campaignsService.update(id, userId, dto);
  }

  @Delete(':id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.campaignsService.delete(id, userId);
  }

  @Post(':id/start')
  @HttpCode(HttpStatus.OK)
  async start(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.campaignsService.start(id, userId);
  }

  @Post(':id/pause')
  @HttpCode(HttpStatus.OK)
  async pause(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.campaignsService.pause(id, userId);
  }

  @Post(':id/complete')
  @HttpCode(HttpStatus.OK)
  async complete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.campaignsService.complete(id, userId);
  }
}
