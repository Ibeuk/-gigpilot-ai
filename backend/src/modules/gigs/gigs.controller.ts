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
} from '@nestjs/common';
import { GigsService } from './gigs.service';
import { CreateGigDto, UpdateGigDto } from './dto/gigs.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';

@Controller()
@UseGuards(JwtAuthGuard)
export class GigsController {
  constructor(private readonly gigsService: GigsService) {}

  @Post('projects/:projectId/gigs')
  async create(
    @Param('projectId') projectId: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: CreateGigDto,
  ) {
    return this.gigsService.create(projectId, userId, dto);
  }

  @Get('projects/:projectId/gigs')
  async findByProject(
    @Param('projectId') projectId: string,
    @CurrentUser('sub') userId: string,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 20,
  ) {
    return this.gigsService.findByProject(projectId, userId, page, limit);
  }

  @Get('gigs/:id')
  async findOne(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.gigsService.findById(id, userId);
  }

  @Patch('gigs/:id')
  async update(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
    @Body() dto: UpdateGigDto,
  ) {
    return this.gigsService.update(id, userId, dto);
  }

  @Delete('gigs/:id')
  async delete(
    @Param('id') id: string,
    @CurrentUser('sub') userId: string,
  ) {
    return this.gigsService.delete(id, userId);
  }
}
