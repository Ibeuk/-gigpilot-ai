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
import { ContentService } from './content.service';
import { CreateContentDto, UpdateContentDto } from './dto/content.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@Controller('content')
@UseGuards(JwtAuthGuard)
export class ContentController {
  constructor(private readonly contentService: ContentService) {}

  @Post()
  async create(@Body() dto: CreateContentDto) {
    return this.contentService.create(dto);
  }

  @Get()
  async findAll(
    @Query('campaignId') campaignId?: string,
    @Query('type') type?: string,
    @Query('status') status?: string,
    @Query('platform') platform?: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.contentService.findAll(
      { campaignId, type, status, platform },
      page,
      limit,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.contentService.findById(id);
  }

  @Patch(':id')
  async update(@Param('id') id: string, @Body() dto: UpdateContentDto) {
    return this.contentService.update(id, dto);
  }

  @Delete(':id')
  async delete(@Param('id') id: string) {
    return this.contentService.delete(id);
  }

  @Post(':id/approve')
  @HttpCode(HttpStatus.OK)
  async approve(@Param('id') id: string) {
    return this.contentService.approve(id);
  }

  @Post(':id/reject')
  @HttpCode(HttpStatus.OK)
  async reject(@Param('id') id: string) {
    return this.contentService.reject(id);
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  async publish(@Param('id') id: string) {
    return this.contentService.publish(id);
  }
}
