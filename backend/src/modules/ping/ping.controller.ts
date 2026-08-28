import { Controller, Post, Get, Body, BadRequestException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PingService } from './ping.service';
import { ContinuousPingerService } from './continuous-pinger.service';

class AutoPingDto {
  gigUrl!: string;
}

class AddGigDto {
  gigUrl!: string;
  title?: string;
}

@ApiTags('Instant Auto-Pinger')
@Controller('ping')
export class PingController {
  constructor(
    private readonly pingService: PingService,
    private readonly continuousPinger: ContinuousPingerService,
  ) {}

  @Get('targets')
  @ApiOperation({ summary: 'Get all active ping target endpoints' })
  getTargets() {
    return { targets: this.pingService.getTargets() };
  }

  @Get('continuous-status')
  @ApiOperation({ summary: 'Get 24/7 infinite promotion loop status & live metrics' })
  getContinuousStatus() {
    return this.continuousPinger.getContinuousStatus();
  }

  @Post('add-gig')
  @ApiOperation({ summary: 'Add a new Fiverr Gig URL to the 24/7 continuous promotion loop' })
  addGig(@Body() dto: AddGigDto) {
    if (!dto.gigUrl || typeof dto.gigUrl !== 'string') {
      throw new BadRequestException('Valid Fiverr Gig URL is required');
    }
    return this.continuousPinger.addGigUrl(dto.gigUrl, dto.title);
  }

  @Post('auto-start')
  @ApiOperation({ summary: 'Auto-start instant promotion pinging for a Fiverr Gig URL' })
  async autoStartPing(@Body() dto: AutoPingDto) {
    if (!dto.gigUrl || typeof dto.gigUrl !== 'string') {
      throw new BadRequestException('Valid Fiverr Gig URL is required');
    }
    return this.pingService.executeAutoPing(dto.gigUrl);
  }
}
