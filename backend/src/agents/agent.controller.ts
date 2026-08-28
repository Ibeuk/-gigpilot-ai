import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  UseGuards,
} from '@nestjs/common';
import { AgentService } from './agent.service';
import { JwtAuthGuard } from '../modules/auth/guards/jwt-auth.guard';
import { CurrentUser } from '../modules/auth/decorators/current-user.decorator';
import { AgentType } from '@prisma/client';

@Controller('agents')
@UseGuards(JwtAuthGuard)
export class AgentController {
  constructor(private readonly agentService: AgentService) {}

  @Get()
  async getAllAgents() {
    return this.agentService.getAllAgents();
  }

  @Get(':type/status')
  async getAgentStatus(@Param('type') type: AgentType) {
    return this.agentService.getAgentStatus(type);
  }

  @Post('tasks')
  async submitTask(
    @CurrentUser('sub') userId: string,
    @Body()
    body: {
      type: string;
      title: string;
      description?: string;
      payload: Record<string, any>;
      priority?: string;
      campaignId?: string;
    },
  ) {
    return this.agentService.submitTask({
      ...body,
      userId,
    });
  }

  @Post('tasks/:taskId/execute')
  async executeTask(@Param('taskId') taskId: string) {
    return this.agentService.executeTask(taskId);
  }
}
