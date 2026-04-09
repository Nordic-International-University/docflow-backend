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

/** Broadcast payload for task events */
interface TaskPayload {
  id: string
  projectId: string
  title: string
  [key: string]: unknown  // allows Prisma model fields to pass through
}

/** Broadcast payload for task assignees */
interface TaskAssigneePayload {
  id: string
  userId: string
  user?: { id: string; fullname: string | null; username: string }
  [key: string]: unknown
}

/** Broadcast payload for task comments */
interface TaskCommentPayload {
  id: string
  taskId: string
  content: string
  [key: string]: unknown
}

/** Broadcast payload for board columns */
interface BoardColumnPayload {
  id: string
  name: string
  [key: string]: unknown
}

/** Broadcast payload for task checklists */
interface TaskChecklistPayload {
  id: string
  title: string
  [key: string]: unknown
}

/** Broadcast payload for task labels */
interface TaskLabelPayload {
  id: string
  label?: { id: string; name: string; color: string | null }
  [key: string]: unknown
}
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

  emitTaskCreated(projectId: string, task: TaskPayload, createdBy: string) {
    this.server.to(`project:${projectId}`).emit('task:created', { task, createdBy, timestamp: new Date().toISOString() })
  }

  emitTaskUpdated(projectId: string, task: TaskPayload, updatedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:updated', { task, updatedBy, timestamp: new Date().toISOString() })
  }

  emitTaskDeleted(projectId: string, taskId: string, deletedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:deleted', { taskId, deletedBy, timestamp: new Date().toISOString() })
  }

  emitTaskMoved(projectId: string, taskId: string, fromColumnId: string, toColumnId: string, movedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:moved', { taskId, fromColumnId, toColumnId, movedBy, timestamp: new Date().toISOString() })
  }

  emitTaskAssigneeChanged(projectId: string, taskId: string, assignees: TaskAssigneePayload[], changedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:assignee-changed', { taskId, assignees, changedBy, timestamp: new Date().toISOString() })
  }

  emitTaskCommentAdded(projectId: string, taskId: string, comment: TaskCommentPayload) {
    this.server.to(`project:${projectId}`).emit('task:comment-added', { taskId, comment, timestamp: new Date().toISOString() })
  }

  emitBoardColumnUpdated(projectId: string, columns: BoardColumnPayload[]) {
    this.server.to(`project:${projectId}`).emit('board:columns-updated', { columns, timestamp: new Date().toISOString() })
  }

  emitTaskChecklistUpdated(projectId: string, taskId: string, checklists: TaskChecklistPayload[]) {
    this.server.to(`project:${projectId}`).emit('task:checklist-updated', { taskId, checklists, timestamp: new Date().toISOString() })
  }

  emitTaskLabelChanged(projectId: string, taskId: string, labels: TaskLabelPayload[]) {
    this.server.to(`project:${projectId}`).emit('task:label-changed', { taskId, labels, timestamp: new Date().toISOString() })
  }
}
