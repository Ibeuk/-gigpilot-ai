import { Processor, WorkerHost, OnWorkerEvent } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { AgentService } from '../agents/agent.service';

@Processor('agent-tasks')
export class TaskProcessor extends WorkerHost {
  private readonly logger = new Logger(TaskProcessor.name);

  constructor(private readonly agentService: AgentService) {
    super();
  }

  /**
   * Process queued agent tasks.
   */
  async process(job: Job<{ taskId: string }>): Promise<any> {
    this.logger.log(`Processing job ${job.id}: task ${job.data.taskId}`);

    const result = await this.agentService.executeTask(job.data.taskId);

    if (!result.success) {
      throw new Error(result.error || 'Task execution failed');
    }

    return result;
  }

  @OnWorkerEvent('completed')
  onCompleted(job: Job) {
    this.logger.log(`Job ${job.id} completed successfully`);
  }

  @OnWorkerEvent('failed')
  onFailed(job: Job | undefined, error: Error) {
    this.logger.error(
      `Job ${job?.id} failed: ${error.message}`,
    );
  }
}
