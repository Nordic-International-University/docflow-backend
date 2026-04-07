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
  UnauthorizedException,
  forwardRef,
  Inject,
} from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { ConfigService } from '@nestjs/config'
import { PrismaService } from '@prisma'
import { ChatService } from './chat.service'

interface AuthSocket extends Socket {
  userId?: string
  username?: string
}

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
    origin: [
      'http://localhost:3000',
      'https://docverse.uz',
      'https://www.docverse.uz',
      'https://e-hujjat.nordicuniversity.org',
      process.env.CLIENT_URL,
    ].filter(Boolean),
    credentials: true,
  },
  namespace: '/chat',
  transports: ['websocket', 'polling'],
})
export class ChatGateway
  implements OnGatewayConnection, OnGatewayDisconnect, OnModuleInit, OnModuleDestroy
{
  @WebSocketServer()
  server: Server

  private readonly logger = new Logger(ChatGateway.name)
  private callExpiryInterval: NodeJS.Timeout | null = null

  constructor(
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
    private readonly prisma: PrismaService,
    @Inject(forwardRef(() => ChatService))
    private readonly chatService: ChatService,
  ) {}

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
      } catch (err: any) {
        this.logger.error(`Call expiry check failed: ${err.message}`)
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
      const token =
        client.handshake.auth?.token ||
        client.handshake.headers.authorization?.replace('Bearer ', '')
      if (!token) throw new UnauthorizedException('Missing token')

      const payload = await this.jwtService.verifyAsync(token, {
        secret: this.configService.get<string>('jwt.accessSecret'),
      })

      const user = await this.prisma.user.findFirst({
        where: { id: payload.userId, deletedAt: null, isActive: true },
        select: { id: true, username: true },
      })
      if (!user) throw new UnauthorizedException('User not found')

      client.userId = user.id
      client.username = user.username
      client.join(`user:${user.id}`)

      this.logger.log(`Chat connected: ${client.id} user=${user.username}`)
    } catch (err: any) {
      this.logger.warn(`Chat auth failed: ${err.message}`)
      client.emit('error', { message: 'Authentication failed' })
      client.disconnect()
    }
  }

  handleDisconnect(client: AuthSocket) {
    if (client.userId) {
      this.logger.log(`Chat disconnected: ${client.id} user=${client.username}`)
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
    @MessageBody() body: { chatId: string; isTyping: boolean },
  ) {
    if (!client.userId || !body?.chatId) return
    this.server.to(`chat:${body.chatId}`).except(`user:${client.userId}`).emit('chat:typing', {
      chatId: body.chatId,
      userId: client.userId,
      username: client.username,
      isTyping: !!body.isTyping,
    })
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
      payload: any
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

  emitNewMessage(chatId: string, memberIds: string[], message: any) {
    this.server.to(`chat:${chatId}`).emit('message:new', message)
    // Offline a'zolarga ham user room orqali xabar (chat ochilmagan bo'lsa)
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('chat:message', { chatId, message })
    }
  }

  emitMessageUpdated(chatId: string, memberIds: string[], message: any) {
    this.server.to(`chat:${chatId}`).emit('message:updated', message)
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('chat:message-updated', { chatId, message })
    }
  }

  emitMessageDeleted(chatId: string, memberIds: string[], messageId: string) {
    this.server.to(`chat:${chatId}`).emit('message:deleted', { chatId, messageId })
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('chat:message-deleted', { chatId, messageId })
    }
  }

  emitReaction(chatId: string, memberIds: string[], data: any) {
    this.server.to(`chat:${chatId}`).emit('message:reaction', data)
  }

  emitReadReceipt(chatId: string, memberIds: string[], data: any) {
    this.server.to(`chat:${chatId}`).emit('message:read', { chatId, ...data })
  }

  emitChatCreated(chatId: string, memberIds: string[]) {
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('chat:created', { chatId })
    }
  }

  emitChatUpdated(chatId: string, data: any) {
    this.server.to(`chat:${chatId}`).emit('chat:updated', { chatId, ...data })
  }

  emitChatDeleted(chatId: string) {
    this.server.to(`chat:${chatId}`).emit('chat:deleted', { chatId })
  }

  emitCallIncoming(chatId: string, memberIds: string[], call: any) {
    for (const uid of memberIds) {
      this.server.to(`user:${uid}`).emit('call:incoming', { chatId, call })
    }
  }

  emitCallStatus(callId: string, data: any) {
    this.server.emit('call:status', { callId, ...data })
  }
}
