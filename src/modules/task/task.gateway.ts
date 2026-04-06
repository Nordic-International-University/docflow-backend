import {
  WebSocketGateway,
  WebSocketServer,
  OnGatewayConnection,
  OnGatewayDisconnect,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets'
import { Server, Socket } from 'socket.io'
import { Injectable, Logger, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@prisma'

interface AuthenticatedSocket extends Socket {
  userId?: string
  username?: string
}

@Injectable()
@WebSocketGateway({
  cors: {
    origin: [
      'http://localhost:3000',
      'https://docverse.uz',
      'https://www.docverse.uz',
      'https://e-hujjat.nordicuniversity.org',
      process.env.CLIENT_URL,
    ].filter(Boolean),
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
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        throw new UnauthorizedException('Token topilmadi')
      }

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      })

      const user = await this.prisma.user.findFirst({
        where: { id: payload.userId, deletedAt: null, isActive: true },
        select: { id: true, username: true },
      })

      if (!user) {
        throw new UnauthorizedException('Foydalanuvchi topilmadi')
      }

      client.userId = user.id
      client.username = user.username
      client.join(`user:${user.id}`)

      this.logger.log(`[Tasks] Connected: ${user.username} (${client.id})`)
    } catch (error) {
      this.logger.error(`[Tasks] Connection failed: ${error.message}`)
      client.emit('error', { message: 'Autentifikatsiya xatosi' })
      client.disconnect()
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      this.logger.log(`[Tasks] Disconnected: ${client.username} (${client.id})`)
    }
  }

  // ==================== PROJECT ROOM ====================

  @SubscribeMessage('project:join')
  async handleJoinProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.join(`project:${data.projectId}`)
    this.logger.log(`${client.username} joined project room: ${data.projectId}`)
    return { success: true }
  }

  @SubscribeMessage('project:leave')
  async handleLeaveProject(
    @MessageBody() data: { projectId: string },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    client.leave(`project:${data.projectId}`)
    this.logger.log(`${client.username} left project room: ${data.projectId}`)
    return { success: true }
  }

  // ==================== BROADCAST METHODS (called from TaskService) ====================

  /** Task yaratildi — project room'ga broadcast */
  emitTaskCreated(projectId: string, task: any, createdBy: string) {
    this.server.to(`project:${projectId}`).emit('task:created', {
      task,
      createdBy,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:created in project ${projectId}`)
  }

  /** Task yangilandi — project room'ga broadcast */
  emitTaskUpdated(projectId: string, task: any, updatedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:updated', {
      task,
      updatedBy,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:updated in project ${projectId}`)
  }

  /** Task o'chirildi */
  emitTaskDeleted(projectId: string, taskId: string, deletedBy: string) {
    this.server.to(`project:${projectId}`).emit('task:deleted', {
      taskId,
      deletedBy,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:deleted in project ${projectId}`)
  }

  /** Task boshqa ustun'ga ko'chirildi (board move) */
  emitTaskMoved(
    projectId: string,
    taskId: string,
    fromColumnId: string,
    toColumnId: string,
    movedBy: string,
  ) {
    this.server.to(`project:${projectId}`).emit('task:moved', {
      taskId,
      fromColumnId,
      toColumnId,
      movedBy,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:moved in project ${projectId}`)
  }

  /** Task assignee o'zgardi */
  emitTaskAssigneeChanged(
    projectId: string,
    taskId: string,
    assignees: any[],
    changedBy: string,
  ) {
    this.server.to(`project:${projectId}`).emit('task:assignee-changed', {
      taskId,
      assignees,
      changedBy,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:assignee-changed in project ${projectId}`)
  }

  /** Yangi comment qo'shildi */
  emitTaskCommentAdded(projectId: string, taskId: string, comment: any) {
    this.server.to(`project:${projectId}`).emit('task:comment-added', {
      taskId,
      comment,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:comment-added in project ${projectId}`)
  }

  /** Board column o'zgardi */
  emitBoardColumnUpdated(projectId: string, columns: any[]) {
    this.server.to(`project:${projectId}`).emit('board:columns-updated', {
      columns,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] board:columns-updated in project ${projectId}`)
  }

  /** Checklist o'zgardi */
  emitTaskChecklistUpdated(projectId: string, taskId: string, checklists: any[]) {
    this.server.to(`project:${projectId}`).emit('task:checklist-updated', {
      taskId,
      checklists,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:checklist-updated in project ${projectId}`)
  }

  /** Task label o'zgardi */
  emitTaskLabelChanged(projectId: string, taskId: string, labels: any[]) {
    this.server.to(`project:${projectId}`).emit('task:label-changed', {
      taskId,
      labels,
      timestamp: new Date().toISOString(),
    })
    this.logger.log(`[Broadcast] task:label-changed in project ${projectId}`)
  }
}
