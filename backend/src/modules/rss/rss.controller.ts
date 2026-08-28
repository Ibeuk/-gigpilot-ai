import { Controller, Get, Header, Req } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import type { Request } from 'express';
import { RssService } from './rss.service';

@ApiTags('RSS Feed')
@Controller('rss')
export class RssController {
  constructor(private readonly rssService: RssService) {}

  @Get('gigs.xml')
  @Header('Content-Type', 'application/xml; charset=utf-8')
  @ApiOperation({ summary: 'Get dynamic RSS 2.0 XML feed of active promoted Fiverr Gigs' })
  @ApiResponse({ status: 200, description: 'Valid RSS 2.0 XML document' })
  getGigsRssFeed(@Req() req: Request): string {
    const protocol = req.protocol || 'http';
    const host = req.get ? req.get('host') : 'localhost:3001';
    const baseUrl = `${protocol}://${host}`;
    return this.rssService.generateGigsRssFeed(baseUrl);
  }
}
