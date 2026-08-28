import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { EventEmitter2, OnEvent } from '@nestjs/event-emitter';
import { Server, Socket } from 'socket.io';
import { AgentEvents } from '../agents/types/agent.types';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
  namespace: '/ws',
})
export class AppWebSocketGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(AppWebSocketGateway.name);
  private readonly connectedClients = new Map<string, Socket>();

  constructor(private readonly eventEmitter: EventEmitter2) {}

  afterInit() {
    this.logger.log('WebSocket gateway initialized');
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id}`);
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);
    this.logger.log(`Client disconnected: ${client.id}`);
  }

  // ─── Client Messages ─────────────────────────────────

  @SubscribeMessage('subscribe:campaign')
  handleSubscribeCampaign(client: Socket, campaignId: string) {
    client.join(`campaign:${campaignId}`);
    this.logger.debug(
      `Client ${client.id} subscribed to campaign:${campaignId}`,
    );
  }

  @SubscribeMessage('subscribe:agents')
  handleSubscribeAgents(client: Socket) {
    client.join('agents');
    this.logger.debug(`Client ${client.id} subscribed to agents`);
  }

  @SubscribeMessage('subscribe:notifications')
  handleSubscribeNotifications(client: Socket, userId: string) {
    client.join(`notifications:${userId}`);
    this.logger.debug(
      `Client ${client.id} subscribed to notifications for user ${userId}`,
    );
  }

  // ─── Server Events → Client Broadcasts ────────────────

  @OnEvent(AgentEvents.TASK_CREATED)
  handleTaskCreated(data: any) {
    this.server.to('agents').emit('task:created', data);
  }

  @OnEvent(AgentEvents.TASK_COMPLETED)
  handleTaskCompleted(data: any) {
    this.server.to('agents').emit('task:completed', data);
  }

  @OnEvent(AgentEvents.TASK_FAILED)
  handleTaskFailed(data: any) {
    this.server.to('agents').emit('task:failed', data);
  }

  @OnEvent(AgentEvents.AGENT_STATUS_CHANGED)
  handleAgentStatusChanged(data: any) {
    this.server.to('agents').emit('agent:status', data);
  }

  @OnEvent(AgentEvents.CAMPAIGN_CREATED)
  handleCampaignCreated(data: any) {
    this.server.emit('campaign:created', data);
  }

  @OnEvent(AgentEvents.CAMPAIGN_UPDATED)
  handleCampaignUpdated(data: any) {
    this.server
      .to(`campaign:${data.campaignId}`)
      .emit('campaign:updated', data);
  }

  @OnEvent(AgentEvents.CONTENT_GENERATED)
  handleContentGenerated(data: any) {
    this.server.to('agents').emit('content:generated', data);
  }

  @OnEvent(AgentEvents.ANALYTICS_CAPTURED)
  handleAnalyticsCaptured(data: any) {
    this.server
      .to(`campaign:${data.campaignId}`)
      .emit('analytics:captured', data);
  }

  @OnEvent(AgentEvents.OPTIMIZATION_SUGGESTED)
  handleOptimizationSuggested(data: any) {
    this.server.to('agents').emit('optimization:suggested', data);
  }

  // ─── Utility ──────────────────────────────────────────

  /**
   * Send a notification to a specific user.
   */
  sendToUser(userId: string, event: string, data: any) {
    this.server.to(`notifications:${userId}`).emit(event, data);
  }

  /**
   * Broadcast to all connected clients.
   */
  broadcast(event: string, data: any) {
    this.server.emit(event, data);
  }
}
