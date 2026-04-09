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
  OnModuleDestroy,
  forwardRef,
  Inject,
} from '@nestjs/common'

/** Broadcast payload for chat messages emitted via WebSocket */
interface ChatMessagePayload {
  id: string
  chatId: string
  senderId: string
  type: string
  content: string | null
  [key: string]: unknown
}

/** Broadcast payload for message reactions */
interface ReactionPayload {
  messageId: string
  userId: string
  emoji: string
  [key: string]: unknown
}

/** Broadcast payload for read receipts */
interface ReadReceiptPayload {
  userId: string
  readAt: Date | string
  [key: string]: unknown
}

/** Broadcast payload for chat updates */
interface ChatUpdatePayload {
  [key: string]: unknown
}

/** Broadcast payload for incoming calls */
interface CallPayload {
  id: string
  chatId: string
  type: string
  status: string
  [key: string]: unknown
}

/** Broadcast payload for call status changes */
interface CallStatusPayload {
  action: string
  [key: string]: unknown
}
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@prisma'
import { RedisService } from '@clients'
import { ChatService } from './chat.service'
import {
  authenticateWsClient,
  handleWsAuthError,
  type AuthenticatedSocket as AuthSocket,
} from '@common/ws-auth.helper'

/**
 * Chat WebSocket gateway.
 *
 * Namespace: /chat
 * Rooms:
 *   - user:{userId}         — kelgan xabarlar, status yangilanishlari
 *   - chat:{chatId}         — xabar subscription, typing, call signaling
 *
 * Client event'lari:
 *   - chat:join       { chatId } → shu chat room'iga qo'shiladi (a'zo bo'lsa)
 *   - chat:leave      { chatId }
 *   - chat:typing     { chatId, isTyping }
 *   - call:signal     { callId, type: 'offer'|'answer'|'ice', targetUserId, payload }
 *                     → WebRTC signalni maqsadli userga relay qiladi
 *
 * Server event'lari:
 *   - message:new, message:updated, message:deleted
 *   - message:reaction
 *   - message:read
 *   - chat:created, chat:updated, chat:deleted
 *   - chat:typing
 *   - call:incoming, call:status, call:signal
 */
@Injectable()
@WebSocketGateway({
  cors: {
    origin: (process.env.CORS_ORIGINS || 'http://localhost:3000,https://docverse.uz').split(',').map(s => s.trim()).filter(Boolean),
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements
    OnGatewayConnection,
    OnGatewayDisconnect,
    OnModuleInit,
    OnModuleDestroy
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ChatGateway.name)
  private callExpiryInterval: NodeJS.Timeout | null = null

  // userId → Set<socketId> (multi-tab/device uchun)
  private readonly connectedUsers = new Map<string, Set<string>>()

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

  /**
   * Foydalanuvchi hozir /chat namespace'ga ulanganmi — boshqa modullar
   * (ChatService) buni isOnline hisobida ishlatadi.
   */
  isUserConnected(userId: string): boolean {
    return (this.connectedUsers.get(userId)?.size || 0) > 0
  }

  /**
   * Presence broadcast — showOnlineStatus=false bo'lmasa barcha /chat
   * socket'lariga yuboriladi. Frontend o'zida tegishli userni filtrlaydi.
   */
  private async broadcastPresence(
    userId: string,
    isOnline: boolean,
    lastSeen: Date | null,
  ) {
    try {
      const settings = await this.prisma.userChatSettings.findFirst({
        where: { userId },
        select: { showOnlineStatus: true, showLastSeen: true },
      })
      if (settings?.showOnlineStatus === false) return // yashirin

      this.server.emit('presence:update', {
        userId,
        isOnline,
        lastSeen:
          settings?.showLastSeen === false
            ? null
            : lastSeen?.toISOString() || null,
      })
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : String(err)
      this.logger.error(`broadcastPresence failed: ${message}`)
    }
  }

  onModuleInit() {
    // Har 15 soniyada stale RINGING qo'ng'iroqlarni MISSED ga o'tkazish
    this.callExpiryInterval = setInterval(async () => {
      try {
        const expired = await this.chatService.expireStaleCalls()
        for (const c of expired) {
          this.server.to(`chat:${c.chatId}`).emit('call:status', {
            callId: c.id,
            action: 'missed',
          })
          const memberIds = await this.chatService.getChatMemberIds(c.chatId)
          for (const uid of memberIds) {
            this.server.to(`user:${uid}`).emit('call:status', {
              callId: c.id,
              chatId: c.chatId,
              action: 'missed',
            })
          }
        }
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err)
        this.logger.error(`Call expiry check failed: ${message}`)
      }
    }, 15_000)
  }

  onModuleDestroy() {
    if (this.callExpiryInterval) {
      clearInterval(this.callExpiryInterval)
      this.callExpiryInterval = null
    }
  }

  async handleConnection(client: AuthSocket) {
    try {
      const user = await authenticateWsClient(
        client,
        this.jwtService,
        this.configService,
        this.prisma,
      )
      client.join(`user:${user.userId}`)

      let sockets = this.connectedUsers.get(user.userId)
      if (!sockets) {
        sockets = new Set()
        this.connectedUsers.set(user.userId, sockets)
      }
      const wasFirst = sockets.size === 0
      sockets.add(client.id)

      const memberships = await this.prisma.chatMember.findMany({
        where: { userId: user.userId, leftAt: null },
        select: { chatId: true },
      })
      for (const m of memberships) {
        client.join(`chat:${m.chatId}`)
      }

      this.logger.log(`Chat connected: ${client.id} user=${user.username} (${sockets.size})`)

      if (wasFirst) {
        await this.broadcastPresence(user.userId, true, null)
      }
    } catch (err: unknown) {
      handleWsAuthError(client, err, this.logger)
    }
  }

  async handleDisconnect(client: AuthSocket) {
    if (!client.userId) return
    const sockets = this.connectedUsers.get(client.userId)
    if (!sockets) return

    sockets.delete(client.id)
    this.logger.log(
      `Chat disconnected: ${client.id} user=${client.username} (remaining: ${sockets.size})`,
    )

    if (sockets.size === 0) {
      this.connectedUsers.delete(client.userId)
      const lastSeen = new Date()
      // Redis'ga so'nggi faollik yozish
      await this.redis.setLastSeen(client.userId, lastSeen).catch(() => {})
      // Offline broadcast
      await this.broadcastPresence(client.userId, false, lastSeen)
    }
  }

  @SubscribeMessage('chat:join')
  async onJoin(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() body: { chatId: string },
  ) {
    if (!client.userId || !body?.chatId) return { ok: false }
    const member = await this.prisma.chatMember.findFirst({
      where: { chatId: body.chatId, userId: client.userId, leftAt: null },
    })
    if (!member) return { ok: false, error: 'Not a member' }
    client.join(`chat:${body.chatId}`)
    return { ok: true }
  }

  @SubscribeMessage('chat:leave')
  onLeave(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody() body: { chatId: string },
  ) {
    if (!client.userId || !body?.chatId) return { ok: false }
    client.leave(`chat:${body.chatId}`)
    return { ok: true }
  }

  @SubscribeMessage('chat:typing')
  async onTyping(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody()
    body: {
      chatId: string
      isTyping: boolean
      // 'typing' | 'recording' | 'uploading_file' | 'uploading_photo' | 'uploading_video' | 'uploading_voice'
      action?: string
    },
  ) {
    if (!client.userId || !body?.chatId) return

    // A'zolikni tekshirish — tashqaridan typing event yuborib bo'lmasligi uchun
    const member = await this.prisma.chatMember.findFirst({
      where: { chatId: body.chatId, userId: client.userId, leftAt: null },
      select: { id: true },
    })
    if (!member) return

    const payload = {
      chatId: body.chatId,
      userId: client.userId,
      username: client.username,
      isTyping: !!body.isTyping,
      action: body.action || 'typing',
    }

    // Chat a'zolari user room'lariga yuborish (sender'ni chiqarib tashlab)
    // Bu `chat:join` qilishni shart qilmaydi — faqat chat socketga ulangan bo'lsa bas
    const memberIds = await this.chatService.getChatMemberIds(body.chatId)
    for (const uid of memberIds) {
      if (uid === client.userId) continue
      this.server.to(`user:${uid}`).emit('chat:typing', payload)
    }
  }

  /**
   * WebRTC signaling — offer/answer/ICE candidate relay.
   * Backend sdp/candidate ichini tekshirmaydi, faqat maqsadli foydalanuvchiga yetkazadi.
   */
  @SubscribeMessage('call:signal')
  async onCallSignal(
    @ConnectedSocket() client: AuthSocket,
    @MessageBody()
    body: {
      callId: string
      type: 'offer' | 'answer' | 'ice'
      targetUserId: string
      payload: Record<string, unknown>
    },
  ) {
    if (!client.userId || !body?.callId || !body?.targetUserId) return
    // Target user bu call ishtirokchisi bo'lishi kerak
    const participant = await this.prisma.callParticipant.findFirst({
      where: { callId: body.callId, userId: body.targetUserId },
    })
    if (!participant) return

    this.server.to(`user:${body.targetUserId}`).emit('call:signal', {
      callId: body.callId,
      type: body.type,
      fromUserId: client.userId,
      payload: body.payload,
    })
  }

  // ============ BROADCASTS (controller'dan chaqiriladi) ============

  emitNewMessage(chatId: string, memberIds: string[], message: ChatMessagePayload) {
    this.server.to(`chat:${chatId}`).emit('message:new', message)
    // Offline a'zolarga ham user room orqali xabar (chat ochilmagan bo'lsa)
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('chat:message', { chatId, message })
    }
  }

  emitMessageUpdated(chatId: string, memberIds: string[], message: ChatMessagePayload) {
    this.server.to(`chat:${chatId}`).emit('message:updated', message)
    for (const uid of memberIds) {
      this.server
        .to(`user:${uid}`)
        .emit('chat:message-updated', { chatId, message })
    }
  }

  emitMessageDeleted(chatId: string, memberIds: string[], messageId: string) {
    this.server
      .to(`chat:${chatId}`)
      .emit('message:deleted', { chatId, messageId })
    for (const uid of memberIds) {
      this.server
        .to(`user:${uid}`)
        .emit('chat:message-deleted', { chatId, messageId })
    }
  }

  emitReaction(chatId: string, memberIds: string[], data: ReactionPayload) {
    this.server.to(`chat:${chatId}`).emit('message:reaction', data)
  }

  emitReadReceipt(chatId: string, memberIds: string[], data: ReadReceiptPayload) {
    this.server.to(`chat:${chatId}`).emit('message:read', { chatId, ...data })
  }

  emitChatCreated(chatId: string, memberIds: string[]) {
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('chat:created', { chatId })
    }
  }

  emitChatUpdated(chatId: string, data: ChatUpdatePayload) {
    this.server.to(`chat:${chatId}`).emit('chat:updated', { chatId, ...data })
  }

  emitChatDeleted(chatId: string) {
    this.server.to(`chat:${chatId}`).emit('chat:deleted', { chatId })
  }

  emitCallIncoming(chatId: string, memberIds: string[], call: CallPayload) {
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('call:incoming', { chatId, call })
    }
  }

  emitCallStatus(callId: string, data: CallStatusPayload) {
    this.server.emit('call:status', { callId, ...data })
  }
}
