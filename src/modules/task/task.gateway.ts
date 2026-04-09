import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server } from 'socket.io'
import { Injectable, Logger } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@prisma'
import {
  authenticateWsClient,
  handleWsAuthError,
  type AuthenticatedSocket,
} from '@common/ws-auth.helper'

@Injectable()
@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,https://docverse.uz').split(',').map(s => s.trim()).filter(Boolean),
    credentials: true,
  },
  namespace: '/tasks',
  transports: ['websocket', 'polling'],
})
export class TaskGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(TaskGateway.name)

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      const user = await authenticateWsClient(client, this.jwtService, this.configService, this.prisma)
      client.join(`user:${user.userId}`)
      this.logger.log(`Tasks connected: ${client.id} user=${user.username}`)
    } catch (error) {
      handleWsAuthError(client, error, this.logger)
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.logger.log(`Tasks disconnected: ${client.id} user=${client.username}`)
    }
  }

  @SubscribeMessage('project:join')
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(`project:${data.projectId}`)
    return { success: true }
  }

  @SubscribeMessage('project:leave')
  async handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`project:${data.projectId}`)
    return { success: true }
  }

  emitTaskCreated(projectId: string, task: any, createdBy: string) {
    this.server.to(`project:${projectId}`).emit('task:created', { task, createdBy, timestamp: new Date().toISOString() })
  }

  emitTaskUpdated(projectId: string, task: any, updatedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:updated', { task, updatedBy, timestamp: new Date().toISOString() })
  }

  emitTaskDeleted(projectId: string, taskId: string, deletedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:deleted', { taskId, deletedBy, timestamp: new Date().toISOString() })
  }

  emitTaskMoved(projectId: string, taskId: string, fromColumnId: string, toColumnId: string, movedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:moved', { taskId, fromColumnId, toColumnId, movedBy, timestamp: new Date().toISOString() })
  }

  emitTaskAssigneeChanged(projectId: string, taskId: string, assignees: any[], changedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:assignee-changed', { taskId, assignees, changedBy, timestamp: new Date().toISOString() })
  }

  emitTaskCommentAdded(projectId: string, taskId: string, comment: any) {
    this.server.to(`project:${projectId}`).emit('task:comment-added', { taskId, comment, timestamp: new Date().toISOString() })
  }

  emitBoardColumnUpdated(projectId: string, columns: any[]) {
    this.server.to(`project:${projectId}`).emit('board:columns-updated', { columns, timestamp: new Date().toISOString() })
  }

  emitTaskChecklistUpdated(projectId: string, taskId: string, checklists: any[]) {
    this.server.to(`project:${projectId}`).emit('task:checklist-updated', { taskId, checklists, timestamp: new Date().toISOString() })
  }

  emitTaskLabelChanged(projectId: string, taskId: string, labels: any[]) {
    this.server.to(`project:${projectId}`).emit('task:label-changed', { taskId, labels, timestamp: new Date().toISOString() })
  }
}
