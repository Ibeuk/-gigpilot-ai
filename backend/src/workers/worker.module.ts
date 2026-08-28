import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { TaskProcessor } from './task.processor';
import { AgentModule } from '../agents/agent.module';

@Module({
  imports: [
    BullModule.registerQueue({
      name: 'agent-tasks',
    }),
    AgentModule,
  ],
  providers: [TaskProcessor],
  exports: [BullModule],
})
export class WorkerModule {}
