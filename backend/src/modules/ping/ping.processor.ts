import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import { Job } from 'bullmq';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { dispatchPing, DispatchPingResult } from './xml-rpc-pinger.util';

export interface PingJobPayload {
  gigId: string;
  gigUrl: string;
  gigTitle: string;
  targetName: string;
  category: string;
  urlPattern: string;
}

@Processor('ping-promotion')
export class PingProcessor extends WorkerHost {
  private readonly logger = new Logger(PingProcessor.name);

  constructor(private readonly eventEmitter: EventEmitter2) {
    super();
  }

  async process(job: Job<PingJobPayload>): Promise<DispatchPingResult> {
    const { gigUrl, gigTitle, targetName, category, urlPattern } = job.data;

    this.logger.debug(`[BullMQ Worker] Processing ping job #${job.id} for target "${targetName}" (${gigUrl})`);

    const result = await dispatchPing(urlPattern, category, gigUrl, gigTitle, 4000);

    const logEntry = {
      id: `job-${job.id}-${Date.now()}`,
      gigUrl,
      targetName,
      category,
      statusCode: result.statusCode,
      latencyMs: result.latencyMs,
      timestamp: new Date().toISOString(),
    };

    // Emit event for real-time WebSocket dashboard
    this.eventEmitter.emit('ping.job.processed', { log: logEntry, success: result.success });

    return result;
  }
}
