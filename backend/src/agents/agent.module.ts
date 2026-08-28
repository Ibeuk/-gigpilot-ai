import { Module } from '@nestjs/common';
import { AgentService } from './agent.service';
import { AgentController } from './agent.controller';
import { AIProviderService } from './ai-provider.service';

@Module({
  controllers: [AgentController],
  providers: [AgentService, AIProviderService],
  exports: [AgentService, AIProviderService],
})
export class AgentModule {}
