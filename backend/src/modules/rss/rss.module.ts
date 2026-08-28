import { Module } from '@nestjs/common';
import { RssService } from './rss.service';
import { RssController } from './rss.controller';
import { PingModule } from '../ping/ping.module';

@Module({
  imports: [PingModule],
  controllers: [RssController],
  providers: [RssService],
  exports: [RssService],
})
export class RssModule {}
