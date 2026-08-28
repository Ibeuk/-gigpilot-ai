import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { PingService } from './ping.service';
import { ContinuousPingerService } from './continuous-pinger.service';
import { PingController } from './ping.controller';
import { PingProcessor } from './ping.processor';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'ping-promotion',
    }),
  ],
  controllers: [PingController],
  providers: [PingService, ContinuousPingerService, PingProcessor],
  exports: [PingService, ContinuousPingerService, BullModule],
})
export class PingModule {}
