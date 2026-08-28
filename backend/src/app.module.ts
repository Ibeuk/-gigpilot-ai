import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { ScheduleModule } from '@nestjs/schedule';
import { BullModule } from '@nestjs/bullmq';
import { PrismaModule } from './common/prisma/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ProjectsModule } from './modules/projects/projects.module';
import { GigsModule } from './modules/gigs/gigs.module';
import { CampaignsModule } from './modules/campaigns/campaigns.module';
import { ContentModule } from './modules/content/content.module';
import { AnalyticsModule } from './modules/analytics/analytics.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { IntegrationsModule } from './modules/integrations/integrations.module';
import { PingModule } from './modules/ping/ping.module';
import { RssModule } from './modules/rss/rss.module';
import { AgentModule } from './agents/agent.module';
import { WorkerModule } from './workers/worker.module';
import { WebSocketModule } from './websocket/websocket.module';
import { HealthModule } from './modules/health/health.module';

@Module({
  imports: [
    // ─── Configuration ─────────────────────────────
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // ─── Event System (inter-agent communication) ──
    EventEmitterModule.forRoot({
      wildcard: true,
      delimiter: '.',
      maxListeners: 20,
      verboseMemoryLeak: true,
    }),

    // ─── Task Scheduling ───────────────────────────
    ScheduleModule.forRoot(),

    // ─── BullMQ (Redis-backed job queues) ──────────
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST || 'localhost',
        port: parseInt(process.env.REDIS_PORT || '6379', 10),
        password: process.env.REDIS_PASSWORD || undefined,
        maxRetriesPerRequest: null,
        enableOfflineQueue: true,
        retryStrategy: (times) => Math.min(times * 200, 3000),
      },
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 5000,
        },
        removeOnComplete: {
          age: 86400, // 24 hours
          count: 1000,
        },
        removeOnFail: {
          age: 604800, // 7 days
        },
      },
    }),

    // ─── Database ──────────────────────────────────
    PrismaModule,

    // ─── Core Modules ──────────────────────────────
    HealthModule,
    AuthModule,
    UsersModule,
    ProjectsModule,
    GigsModule,
    CampaignsModule,
    ContentModule,
    AnalyticsModule,
    NotificationsModule,
    IntegrationsModule,
    PingModule,
    RssModule,

    // ─── AI Agent System ───────────────────────────
    AgentModule,

    // ─── Background Workers ────────────────────────
    WorkerModule,

    // ─── Real-time WebSocket ───────────────────────
    WebSocketModule,
  ],
})
export class AppModule {}
