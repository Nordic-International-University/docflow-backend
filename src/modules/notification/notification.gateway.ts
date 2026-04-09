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
import {
  Injectable,
  Logger,
  OnModuleInit,
  UnauthorizedException,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@prisma'
import { RedisService } from '@clients'

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
  namespace: '/notifications',
  transports: ['websocket', 'polling'],
})
export class NotificationGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit
{
  /**
   * Server startup — Redis'dagi eski/orphan socket kalitlarini tozalash.
   * Aks holda restart'dan keyin "online" ro'yxatda o'lgan foydalanuvchilar qoladi.
   */
  async onModuleInit() {
    try {
      const cleared = await this.redisService.clearAllSocketKeys()
      if (cleared > 0) {
        this.logger.log(`Startup: ${cleared} ta eski socket kaliti tozalandi`)
      }
    } catch (err: any) {
      this.logger.error(`Startup cleanup failed: ${err.message}`)
    }
  }

  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(NotificationGateway.name)

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
    private prisma: PrismaService,
    private redisService: RedisService,
  ) {}

  async handleConnection(client: AuthenticatedSocket) {
    try {
      // Extract token from handshake
      const token =
        client.handshake.auth.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '')

      if (!token) {
        throw new UnauthorizedException('Missing authentication token')
      }

      // Verify JWT token
      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      })

      // Verify user exists and is active
      const user = await this.prisma.user.findFirst({
        where: {
          id: payload.userId,
          deletedAt: null,
          isActive: true,
        },
      })

      if (!user) {
        throw new UnauthorizedException('User not found or inactive')
      }

      // Attach user info to socket
      client.userId = user.id
      client.username = user.username

      // Store user socket mapping in Redis
      await this.redisService.setUserSocket(user.id, client.id)

      // Store socket metadata in Redis
      await this.redisService.setSocketMetadata(client.id, {
        userId: user.id,
        username: user.username,
        connectedAt: Date.now(),
      })

      // Join user to their personal room
      client.join(`user:${user.id}`)

      this.logger.log(
        `Client connected: ${client.id} - User: ${user.username} (${user.id})`,
      )

      // Send pending notifications on connection
      await this.sendPendingNotifications(client, user.id)

      // Send active workflows count on connection
      await this.sendActiveWorkflowsCount(client, user.id)

      // Broadcast user online status to all connected clients
      await this.broadcastUserOnlineStatus(user.id, true)
    } catch (error) {
      this.logger.error(`Connection failed: ${error.message}`)
      client.emit('error', { message: 'Authentication failed' })
      client.disconnect()
    }
  }

  async handleDisconnect(client: AuthenticatedSocket) {
    if (client.userId) {
      const userId = client.userId

      // Remove this specific socket from user's socket set
      await this.redisService.removeUserSocket(userId, client.id)

      // Remove socket metadata from Redis
      await this.redisService.removeSocketMetadata(client.id)

      this.logger.log(
        `Client disconnected: ${client.id} - User: ${client.username}`,
      )

      // Check if user still has other active connections
      const remainingSockets = await this.redisService.getUserSockets(userId)

      // Only broadcast offline status if user has no more active connections
      if (remainingSockets.length === 0) {
        // So'nggi faollik vaqtini yozish
        await this.redisService.setLastSeen(userId)
        await this.broadcastUserOnlineStatus(userId, false)
      }
    }
  }

  // Send notification to specific user (all devices)
  async sendNotificationToUser(userId: string, notification: any) {
    // Check if user has any connected sockets via Redis
    const socketIds = await this.redisService.getUserSockets(userId)

    if (socketIds.length > 0) {
      // User is online on one or more devices - send real-time notification to all
      this.server.to(`user:${userId}`).emit('notification', notification)
      this.logger.log(
        `Sent real-time notification to user ${userId} (${socketIds.length} device(s))`,
      )
      return true
    } else {
      // User is offline - notification already saved in DB
      this.logger.log(
        `User ${userId} is offline - notification saved to database`,
      )
      return false
    }
  }

  // Broadcast to all connected users
  async broadcastToAll(event: string, data: any) {
    this.server.emit(event, data)
    this.logger.log(`Broadcasted ${event} to all users`)
  }

  // Send pending (unread) notifications when user connects
  private async sendPendingNotifications(
    client: AuthenticatedSocket,
    userId: string,
  ) {
    const unreadNotifications = await this.prisma.notification.findMany({
      where: {
        userId,
        isRead: false,
        deletedAt: null,
      },
      orderBy: {
        createdAt: 'desc',
      },
      take: 50, // Limit to recent 50
    })

    if (unreadNotifications.length > 0) {
      client.emit('pending-notifications', {
        count: unreadNotifications.length,
        notifications: unreadNotifications,
      })
      this.logger.log(
        `Sent ${unreadNotifications.length} pending notifications to user ${userId}`,
      )
    }
  }

  @SubscribeMessage('mark-as-read')
  async handleMarkAsRead(
    @MessageBody() data: { notificationIds: string[] },
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          id: { in: data.notificationIds },
          userId: client.userId,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return { success: true, message: 'Notifications marked as read' }
    } catch (error) {
      this.logger.error(`Error marking notifications as read: ${error.message}`)
      return { success: false, message: error.message }
    }
  }

  @SubscribeMessage('mark-all-as-read')
  async handleMarkAllAsRead(@ConnectedSocket() client: AuthenticatedSocket) {
    try {
      await this.prisma.notification.updateMany({
        where: {
          userId: client.userId,
          isRead: false,
        },
        data: {
          isRead: true,
          readAt: new Date(),
        },
      })

      return { success: true, message: 'All notifications marked as read' }
    } catch (error) {
      this.logger.error(
        `Error marking all notifications as read: ${error.message}`,
      )
      return { success: false, message: error.message }
    }
  }

  @SubscribeMessage('get-active-workflows')
  async handleGetActiveWorkflows(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const count = await this.getActiveWorkflowsCount(client.userId)
      return { success: true, count }
    } catch (error) {
      this.logger.error(
        `Error getting active workflows count: ${error.message}`,
      )
      return { success: false, message: error.message }
    }
  }

  // Send active workflows count when user connects or when updated
  private async sendActiveWorkflowsCount(
    client: AuthenticatedSocket,
    userId: string,
  ) {
    const count = await this.getActiveWorkflowsCount(userId)

    client.emit('active-workflows-count', { count })
    this.logger.log(`Sent active workflows count (${count}) to user ${userId}`)
  }

  // Get count of active workflows assigned to user
  private async getActiveWorkflowsCount(userId: string): Promise<number> {
    const count = await this.prisma.workflowStep.count({
      where: {
        assignedToUserId: userId,
        status: {
          in: ['NOT_STARTED', 'IN_PROGRESS'],
        },
        workflow: {
          status: 'ACTIVE',
          deletedAt: null,
        },
        deletedAt: null,
      },
    })

    return count
  }

  // Notify user about workflow count update (call this when workflow is assigned/completed)
  async notifyWorkflowCountUpdate(userId: string) {
    const socketIds = await this.redisService.getUserSockets(userId)

    if (socketIds.length > 0) {
      const count = await this.getActiveWorkflowsCount(userId)
      this.server.to(`user:${userId}`).emit('active-workflows-count', { count })
      this.logger.log(
        `Updated active workflows count (${count}) for user ${userId} (${socketIds.length} device(s))`,
      )
    }
  }

  // Check if user is online via Redis
  async isUserOnline(userId: string): Promise<boolean> {
    return await this.redisService.isUserOnline(userId)
  }

  // Get online users count via Redis
  async getOnlineUsersCount(): Promise<number> {
    return await this.redisService.getOnlineUsersCount()
  }

  // Get all online users via Redis
  async getOnlineUsers(): Promise<string[]> {
    return await this.redisService.getOnlineUsers()
  }

  // Get online users with detailed information
  async getOnlineUsersWithDetails(): Promise<
    Array<{
      id: string
      fullname: string
      username: string
      avatarUrl?: string
      department?: {
        id: string
        name: string
      }
    }>
  > {
    const onlineUserIds = await this.redisService.getOnlineUsers()

    if (onlineUserIds.length === 0) {
      return []
    }

    // Fetch user details from database
    const users = await this.prisma.user.findMany({
      where: {
        id: { in: onlineUserIds },
        deletedAt: null,
        isActive: true,
      },
      select: {
        id: true,
        fullname: true,
        username: true,
        avatarUrl: true,
        department: {
          select: {
            id: true,
            name: true,
          },
        },
        chatSettings: {
          select: { showOnlineStatus: true },
        },
      },
    })

    // showOnlineStatus=false bo'lgan foydalanuvchilarni yashirish
    return users
      .filter((u) => u.chatSettings?.showOnlineStatus !== false)
      .map(({ chatSettings, ...rest }) => rest)
  }

  // Broadcast user online/offline status to all connected clients
  async broadcastUserOnlineStatus(
    userId: string,
    isOnline: boolean,
  ): Promise<void> {
    try {
      // Get user details
      const user = await this.prisma.user.findFirst({
        where: {
          id: userId,
          deletedAt: null,
        },
        select: {
          id: true,
          fullname: true,
          username: true,
          avatarUrl: true,
          department: {
            select: {
              id: true,
              name: true,
            },
          },
          chatSettings: { select: { showOnlineStatus: true } },
        },
      })

      if (!user) {
        return
      }

      // showOnlineStatus=false bo'lsa — status broadcast qilmaymiz
      if (user.chatSettings?.showOnlineStatus === false) {
        return
      }

      const { chatSettings, ...publicUser } = user
      // Broadcast to all connected clients
      this.server.emit('user:status', {
        user: publicUser,
        isOnline,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(
        `Broadcasted ${isOnline ? 'online' : 'offline'} status for user ${user.username}`,
      )
    } catch (error) {
      this.logger.error(`Failed to broadcast user status: ${error.message}`)
    }
  }

  // Handle client request for online users list
  @SubscribeMessage('online-users:request')
  async handleOnlineUsersRequest(
    @ConnectedSocket() client: AuthenticatedSocket,
  ) {
    try {
      const onlineUsers = await this.getOnlineUsersWithDetails()

      // Send online users list to the requesting client
      client.emit('online-users:list', {
        users: onlineUsers,
        count: onlineUsers.length,
        timestamp: new Date().toISOString(),
      })

      this.logger.log(
        `Sent online users list to ${client.username} (${onlineUsers.length} users)`,
      )
    } catch (error) {
      this.logger.error(`Failed to send online users list: ${error.message}`)
      client.emit('error', { message: 'Failed to fetch online users' })
    }
  }

  // Handle client heartbeat to keep connection alive
  @SubscribeMessage('heartbeat')
  async handleHeartbeat(@ConnectedSocket() client: AuthenticatedSocket) {
    client.emit('heartbeat:ack', { timestamp: new Date().toISOString() })
  }
}
