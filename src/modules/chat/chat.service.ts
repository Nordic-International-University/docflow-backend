import {
  BadRequestException,
  ForbiddenException,
  forwardRef,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { MinioService, RedisService } from '@clients'
import { TelegramService } from '../telegram/telegram.service'
import { ChatEncryptionService } from './chat-encryption'
import { ChatGateway } from './chat.gateway'
import {
  AddMembersDto,
  AddReactionDto,
  CreateDirectChatDto,
  CreateGroupChatDto,
  EditMessageDto,
  ForwardEntityDto,
  ForwardMessageDto,
  InitiateCallDto,
  SendMessageDto,
  UpdateChatSettingsDto,
  UpdateGroupChatDto,
} from './dtos'

interface Ctx {
  userId: string
  roleName?: string
}

const ADMIN_ROLES = ['Super Administrator', 'Admin']

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
    private readonly redis: RedisService,
    private readonly crypto: ChatEncryptionService,
    private readonly telegram: TelegramService,
    @Inject(forwardRef(() => ChatGateway))
    private readonly gateway: ChatGateway,
  ) {}

  /**
   * Foydalanuvchilarning online holatini va showOnlineStatus sozlamasini
   * hisobga olgan holda {userId → { isOnline, lastSeen }} map qaytaradi.
   * showOnlineStatus=false bo'lgan foydalanuvchi doim offline + lastSeen=null.
   */
  private async getOnlineStatusMap(
    userIds: string[],
  ): Promise<Map<string, { isOnline: boolean; lastSeen: Date | null }>> {
    const map = new Map<string, { isOnline: boolean; lastSeen: Date | null }>()
    if (userIds.length === 0) return map
    const [onlineIds, settings, lastSeenMap] = await Promise.all([
      this.redis.getOnlineUsers(),
      this.prisma.userChatSettings.findMany({
        where: { userId: { in: userIds } },
        select: { userId: true, showOnlineStatus: true, showLastSeen: true },
      }),
      this.redis.getLastSeenBatch(userIds),
    ])
    const hiddenOnline = new Set(
      settings.filter((s) => s.showOnlineStatus === false).map((s) => s.userId),
    )
    const hiddenLastSeen = new Set(
      settings.filter((s) => s.showLastSeen === false).map((s) => s.userId),
    )
    const onlineSet = new Set(onlineIds)
    for (const uid of userIds) {
      // /chat namespace'dagi live ulanish yoki /notifications'dagi ulanish
      const rawOnline = this.gateway.isUserConnected(uid) || onlineSet.has(uid)
      const isOnline = rawOnline && !hiddenOnline.has(uid)
      const lastSeen = hiddenLastSeen.has(uid)
        ? null
        : lastSeenMap.get(uid) || null
      map.set(uid, { isOnline, lastSeen })
    }
    return map
  }

  private isAdmin(ctx: Ctx) {
    return ADMIN_ROLES.includes(ctx.roleName || '')
  }

  /** Foydalanuvchi chat a'zosimi? */
  private async ensureMember(chatId: string, userId: string) {
    const member = await this.prisma.chatMember.findFirst({
      where: { chatId, userId, leftAt: null },
    })
    if (!member) throw new ForbiddenException("Siz bu chat a'zosi emassiz")
    return member
  }

  /** Foydalanuvchi group adminmi? */
  private async ensureGroupAdmin(chatId: string, userId: string, ctx: Ctx) {
    if (this.isAdmin(ctx)) return
    const member = await this.prisma.chatMember.findFirst({
      where: { chatId, userId, leftAt: null, role: { in: ['OWNER', 'ADMIN'] } },
    })
    if (!member) throw new ForbiddenException("Guruhni boshqarish huquqi yo'q")
  }

  /** Chatlar ro'yxati (oxirgi xabari bilan) */
  async listChats(ctx: Ctx, query: { search?: string; limit?: number }) {
    const limit = Math.min(query.limit || 50, 100)
    const memberships = await this.prisma.chatMember.findMany({
      where: { userId: ctx.userId, leftAt: null },
      include: {
        chat: {
          include: {
            members: {
              where: { leftAt: null },
              include: {
                user: {
                  select: {
                    id: true,
                    fullname: true,
                    username: true,
                    avatarUrl: true,
                  },
                },
              },
            },
            messages: {
              where: { deletedAt: null },
              orderBy: { createdAt: 'desc' },
              take: 1,
              include: {
                sender: {
                  select: { id: true, fullname: true, username: true },
                },
              },
            },
          },
        },
      },
      orderBy: [{ isPinned: 'desc' }],
      take: limit,
    })

    // DIRECT chatlar uchun peer userId'larini to'plash va online holatni olish
    const peerIds: string[] = []
    for (const m of memberships) {
      if (m.chat.type === 'DIRECT') {
        const peer = m.chat.members.find((mm) => mm.userId !== ctx.userId)
        if (peer) peerIds.push(peer.userId)
      }
    }
    const onlineMap = await this.getOnlineStatusMap(peerIds)

    const result = memberships
      .filter((m) => m.chat.deletedAt === null)
      .map((m) => {
        const chat = m.chat
        const lastMessage = chat.messages[0]
        const peerUser =
          chat.type === 'DIRECT'
            ? chat.members.find((mm) => mm.userId !== ctx.userId)?.user
            : null
        const peerStatus = peerUser ? onlineMap.get(peerUser.id) : null
        const peer = peerUser
          ? {
              ...peerUser,
              isOnline: peerStatus?.isOnline || false,
              lastSeen: peerStatus?.lastSeen || null,
            }
          : null
        return {
          id: chat.id,
          type: chat.type,
          title: chat.type === 'DIRECT' ? peer?.fullname : chat.title,
          avatarUrl: chat.type === 'DIRECT' ? peer?.avatarUrl : chat.avatarUrl,
          peer: peer,
          lastMessageAt: chat.lastMessageAt,
          membersCount: chat.members.length,
          isPinned: m.isPinned,
          isArchived: m.isArchived,
          mutedUntil: m.mutedUntil,
          myRole: m.role,
          lastMessage: lastMessage
            ? {
                id: lastMessage.id,
                type: lastMessage.type,
                content: this.crypto.decrypt(lastMessage.content),
                sender: lastMessage.sender,
                createdAt: lastMessage.createdAt,
              }
            : null,
        }
      })
      .sort((a, b) => {
        if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1
        const at = a.lastMessageAt?.getTime() || 0
        const bt = b.lastMessageAt?.getTime() || 0
        return bt - at
      })

    // Search filter (local)
    const filtered = query.search
      ? result.filter((c) =>
          (c.title || '').toLowerCase().includes(query.search!.toLowerCase()),
        )
      : result

    return { count: filtered.length, chats: filtered }
  }

  /** Direct chat yaratish yoki mavjudini qaytarish */
  async createOrGetDirectChat(payload: CreateDirectChatDto, ctx: Ctx) {
    if (payload.userId === ctx.userId) {
      throw new BadRequestException("O'z-o'zi bilan chat yaratib bo'lmaydi")
    }
    const peer = await this.prisma.user.findFirst({
      where: { id: payload.userId, deletedAt: null, isActive: true },
      select: { id: true, fullname: true, username: true, avatarUrl: true },
    })
    if (!peer) throw new NotFoundException('Foydalanuvchi topilmadi')

    // Mavjud direct chatni qidirish
    const existing = await this.prisma.chat.findFirst({
      where: {
        type: 'DIRECT',
        deletedAt: null,
        AND: [
          { members: { some: { userId: ctx.userId, leftAt: null } } },
          { members: { some: { userId: peer.id, leftAt: null } } },
        ],
      },
      include: {
        members: {
          include: {
            user: { select: { id: true, fullname: true, avatarUrl: true } },
          },
        },
      },
    })
    if (existing)
      return { id: existing.id, type: existing.type, peer, created: false }

    const chat = await this.prisma.chat.create({
      data: {
        type: 'DIRECT',
        createdById: ctx.userId,
        members: {
          create: [
            { userId: ctx.userId, role: 'MEMBER' },
            { userId: peer.id, role: 'MEMBER' },
          ],
        },
      },
    })
    return { id: chat.id, type: chat.type, peer, created: true }
  }

  async createGroupChat(payload: CreateGroupChatDto, ctx: Ctx) {
    const uniqueIds = Array.from(new Set([ctx.userId, ...payload.memberIds]))
    const users = await this.prisma.user.findMany({
      where: { id: { in: uniqueIds }, deletedAt: null, isActive: true },
      select: { id: true },
    })
    const validIds = users.map((u) => u.id)
    if (!validIds.includes(ctx.userId)) validIds.push(ctx.userId)
    if (validIds.length < 2) {
      throw new BadRequestException("Guruh uchun kamida 1 ta boshqa a'zo kerak")
    }

    const chat = await this.prisma.chat.create({
      data: {
        type: 'GROUP',
        title: payload.title,
        description: payload.description,
        avatarUrl: payload.avatarUrl,
        createdById: ctx.userId,
        members: {
          create: validIds.map((id) => ({
            userId: id,
            role: id === ctx.userId ? 'OWNER' : 'MEMBER',
          })),
        },
      },
      include: {
        members: {
          include: {
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })
    return {
      id: chat.id,
      type: chat.type,
      title: chat.title,
      members: chat.members,
    }
  }

  async getChat(chatId: string, ctx: Ctx) {
    await this.ensureMember(chatId, ctx.userId)
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
      include: {
        members: {
          where: { leftAt: null },
          include: {
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
                role: { select: { name: true } },
              },
            },
          },
        },
      },
    })
    if (!chat) throw new NotFoundException('Chat topilmadi')

    // Online holatni a'zolar uchun to'ldirish (showOnlineStatus hurmat qilinadi)
    const memberIds = chat.members.map((m) => m.userId)
    const onlineMap = await this.getOnlineStatusMap(memberIds)

    const membersWithOnline = chat.members.map((m) => {
      const s = onlineMap.get(m.userId)
      return {
        ...m,
        user: {
          ...m.user,
          isOnline: s?.isOnline || false,
          lastSeen: s?.lastSeen || null,
        },
      }
    })

    // DIRECT uchun peer obyekti
    const peerMember =
      chat.type === 'DIRECT'
        ? membersWithOnline.find((mm) => mm.userId !== ctx.userId)
        : null
    const peer = peerMember ? peerMember.user : null

    // DIRECT chatda peer bloklanganmi
    let blockStatus: { iBlocked: boolean; blockedMe: boolean } | null = null
    if (chat.type === 'DIRECT' && peer) {
      const [a, b] = await Promise.all([
        this.prisma.userBlock.findFirst({
          where: { blockerId: ctx.userId, blockedId: peer.id },
        }),
        this.prisma.userBlock.findFirst({
          where: { blockerId: peer.id, blockedId: ctx.userId },
        }),
      ])
      blockStatus = { iBlocked: !!a, blockedMe: !!b }
    }

    return {
      ...chat,
      members: membersWithOnline,
      membersCount: chat.members.length,
      peer,
      blockStatus,
      // DIRECT uchun title'ni peer nomiga aylantirish
      title: chat.type === 'DIRECT' ? peer?.fullname || null : chat.title,
      avatarUrl:
        chat.type === 'DIRECT' ? peer?.avatarUrl || null : chat.avatarUrl,
    }
  }

  async updateGroupChat(chatId: string, payload: UpdateGroupChatDto, ctx: Ctx) {
    await this.ensureGroupAdmin(chatId, ctx.userId, ctx)
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
    })
    if (!chat || chat.type !== 'GROUP')
      throw new NotFoundException('Guruh topilmadi')
    return await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        title: payload.title ?? undefined,
        description: payload.description ?? undefined,
        avatarUrl: payload.avatarUrl ?? undefined,
      },
    })
  }

  async deleteChat(chatId: string, ctx: Ctx) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
      include: { members: { where: { userId: ctx.userId, leftAt: null } } },
    })
    if (!chat) throw new NotFoundException('Chat topilmadi')
    if (!this.isAdmin(ctx)) {
      const m = chat.members[0]
      if (!m || (chat.type === 'GROUP' && m.role !== 'OWNER')) {
        throw new ForbiddenException("Chatni o'chirish huquqi yo'q")
      }
    }
    await this.prisma.chat.update({
      where: { id: chatId },
      data: { deletedAt: new Date() },
    })
    return { success: true }
  }

  async addMembers(chatId: string, payload: AddMembersDto, ctx: Ctx) {
    await this.ensureGroupAdmin(chatId, ctx.userId, ctx)
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
    })
    if (!chat || chat.type !== 'GROUP')
      throw new NotFoundException('Guruh topilmadi')

    const users = await this.prisma.user.findMany({
      where: { id: { in: payload.userIds }, deletedAt: null, isActive: true },
      select: { id: true },
    })
    const validIds = users.map((u) => u.id)

    const added: string[] = []
    for (const uid of validIds) {
      const existing = await this.prisma.chatMember.findFirst({
        where: { chatId, userId: uid },
      })
      if (existing) {
        if (existing.leftAt) {
          await this.prisma.chatMember.update({
            where: { id: existing.id },
            data: { leftAt: null, joinedAt: new Date() },
          })
          added.push(uid)
        }
      } else {
        await this.prisma.chatMember.create({
          data: { chatId, userId: uid, role: 'MEMBER' },
        })
        added.push(uid)
      }
    }
    return { added: added.length, userIds: added }
  }

  async removeMember(chatId: string, targetUserId: string, ctx: Ctx) {
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
    })
    if (!chat || chat.type !== 'GROUP')
      throw new NotFoundException('Guruh topilmadi')

    const selfLeaving = targetUserId === ctx.userId
    if (!selfLeaving) {
      await this.ensureGroupAdmin(chatId, ctx.userId, ctx)
    }

    const target = await this.prisma.chatMember.findFirst({
      where: { chatId, userId: targetUserId, leftAt: null },
    })
    if (!target) throw new NotFoundException("A'zo topilmadi")
    if (target.role === 'OWNER' && !selfLeaving) {
      throw new ForbiddenException("Egasini chiqarib bo'lmaydi")
    }

    await this.prisma.chatMember.update({
      where: { id: target.id },
      data: { leftAt: new Date() },
    })
    return { success: true }
  }

  async setMemberRole(
    chatId: string,
    targetUserId: string,
    role: 'ADMIN' | 'MEMBER',
    ctx: Ctx,
  ) {
    await this.ensureGroupAdmin(chatId, ctx.userId, ctx)
    const target = await this.prisma.chatMember.findFirst({
      where: { chatId, userId: targetUserId, leftAt: null },
    })
    if (!target) throw new NotFoundException("A'zo topilmadi")
    if (target.role === 'OWNER')
      throw new ForbiddenException("Egasining rolini o'zgartirib bo'lmaydi")
    await this.prisma.chatMember.update({
      where: { id: target.id },
      data: { role },
    })
    return { success: true }
  }

  /** Xabarlar ro'yxati (pagination) */
  async getMessages(
    chatId: string,
    ctx: Ctx,
    query: { before?: string; limit?: number },
  ) {
    const member = await this.ensureMember(chatId, ctx.userId)
    const limit = Math.min(query.limit || 50, 100)
    const where: any = { chatId, deletedAt: null }
    // "Clear history" — foydalanuvchi tarixni tozalagan bo'lsa undan oldingisini yashirish
    if (member.historyClearedAt) {
      where.createdAt = { gt: member.historyClearedAt }
    }
    if (query.before) {
      const anchor = await this.prisma.chatMessage.findFirst({
        where: { id: query.before },
        select: { createdAt: true },
      })
      if (anchor) {
        where.createdAt = {
          ...(where.createdAt || {}),
          lt: anchor.createdAt,
        }
      }
    }

    const messages = await this.prisma.chatMessage.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: limit,
      include: {
        sender: {
          select: { id: true, fullname: true, username: true, avatarUrl: true },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            type: true,
            senderId: true,
            sender: { select: { id: true, fullname: true } },
          },
        },
        reactions: {
          include: { user: { select: { id: true, fullname: true } } },
        },
        reads: {
          select: { userId: true, readAt: true },
        },
      },
    })

    // Forward attribution — original user/chat ma'lumotlarini to'plash
    const fwdUserIds = Array.from(
      new Set(
        messages.map((m) => m.forwardedFromUserId).filter(Boolean) as string[],
      ),
    )
    const fwdChatIds = Array.from(
      new Set(
        messages.map((m) => m.forwardedFromChatId).filter(Boolean) as string[],
      ),
    )
    const [fwdUsers, fwdChats] = await Promise.all([
      fwdUserIds.length
        ? this.prisma.user.findMany({
            where: { id: { in: fwdUserIds } },
            select: {
              id: true,
              fullname: true,
              username: true,
              avatarUrl: true,
              deletedAt: true,
            },
          })
        : Promise.resolve([]),
      fwdChatIds.length
        ? this.prisma.chat.findMany({
            where: { id: { in: fwdChatIds } },
            select: {
              id: true,
              type: true,
              title: true,
              username: true,
              avatarUrl: true,
              visibility: true,
              deletedAt: true,
            },
          })
        : Promise.resolve([]),
    ])
    const userMap = new Map(fwdUsers.map((u) => [u.id, u]))
    const chatMap = new Map(fwdChats.map((c) => [c.id, c]))

    return {
      count: messages.length,
      messages: messages
        .map((m) => {
          // Forward attribution
          let forwardedFrom: any = null
          if (
            m.forwardedFromUserId ||
            m.forwardedFromChatId ||
            m.forwardedFromName
          ) {
            const user = m.forwardedFromUserId
              ? userMap.get(m.forwardedFromUserId)
              : null
            const chat = m.forwardedFromChatId
              ? chatMap.get(m.forwardedFromChatId)
              : null
            forwardedFrom = {
              user:
                user && !user.deletedAt
                  ? {
                      id: user.id,
                      fullname: user.fullname,
                      username: user.username,
                      avatarUrl: user.avatarUrl,
                    }
                  : m.forwardedFromName
                    ? { fullname: m.forwardedFromName, deleted: true }
                    : null,
              chat:
                chat && !chat.deletedAt
                  ? {
                      id: chat.id,
                      type: chat.type,
                      title: chat.title,
                      username: chat.username,
                      avatarUrl: chat.avatarUrl,
                      visibility: chat.visibility,
                    }
                  : m.forwardedFromChatTitle
                    ? { title: m.forwardedFromChatTitle, deleted: true }
                    : null,
            }
          }
          return {
            ...m,
            content: this.crypto.decrypt(m.content),
            replyTo: m.replyTo
              ? {
                  ...m.replyTo,
                  content: this.crypto.decrypt(m.replyTo.content),
                }
              : null,
            forwardedFrom,
          }
        })
        .reverse(),
    }
  }

  /**
   * Xabar yuborish. File bo'lsa (multer payload) — MinIO ga upload qiladi.
   */
  async sendMessage(
    chatId: string,
    payload: SendMessageDto,
    ctx: Ctx,
    file?: Express.Multer.File,
  ) {
    await this.ensureMember(chatId, ctx.userId)

    let fileUrl = payload.fileUrl
    let fileName = payload.fileName
    let mimeType = payload.mimeType
    let fileSize: number | undefined =
      payload.fileSize != null ? Number(payload.fileSize) : undefined
    let type = payload.type || 'TEXT'
    // Multipart form'da raqamlar string bo'lib keladi — cast qilish
    const duration =
      payload.duration != null
        ? Math.round(Number(payload.duration))
        : undefined

    if (file) {
      const uploaded = await this.minio.uploadFile(file, 'chat/')
      fileUrl = `https://cdn.nordicuniversity.org/docflow-files/${uploaded}`
      fileName = file.originalname
      mimeType = file.mimetype
      fileSize = file.size
      if (type === 'TEXT') {
        if (mimeType?.startsWith('image/')) type = 'IMAGE' as any
        else if (mimeType?.startsWith('video/')) type = 'VIDEO' as any
        else if (mimeType?.startsWith('audio/')) type = 'VOICE' as any
        else type = 'FILE' as any
      }
    }

    if (type === 'TEXT' && !payload.content?.trim()) {
      throw new BadRequestException("Bo'sh xabar yuborib bo'lmaydi")
    }

    // DIRECT chatda peer bloklamaganligini tekshirish
    const chatInfo = await this.prisma.chat.findFirst({
      where: { id: chatId },
      select: {
        type: true,
        allowMemberSendMedia: true,
        members: {
          where: { leftAt: null },
          select: { userId: true, role: true },
        },
      },
    })
    if (chatInfo?.type === 'DIRECT') {
      const peer = chatInfo.members.find((mm) => mm.userId !== ctx.userId)
      if (peer) {
        const blocked = await this.prisma.userBlock.findFirst({
          where: { blockerId: peer.userId, blockedId: ctx.userId },
        })
        if (blocked) {
          throw new ForbiddenException('Sizni bu foydalanuvchi bloklagan')
        }
      }
    }
    // GROUP: media yuborish cheklangan bo'lsa faqat admin/owner
    if (
      chatInfo?.type === 'GROUP' &&
      type !== 'TEXT' &&
      !chatInfo.allowMemberSendMedia
    ) {
      const myRole = chatInfo.members.find((m) => m.userId === ctx.userId)?.role
      if (myRole !== 'OWNER' && myRole !== 'ADMIN' && !this.isAdmin(ctx)) {
        throw new ForbiddenException(
          'Bu guruhda faqat adminlar media yubora oladi',
        )
      }
    }

    // Reply tekshirish
    if (payload.replyToId) {
      const replyTo = await this.prisma.chatMessage.findFirst({
        where: { id: payload.replyToId, chatId, deletedAt: null },
      })
      if (!replyTo)
        throw new NotFoundException('Javob berilayotgan xabar topilmadi')
    }

    const message = await this.prisma.chatMessage.create({
      data: {
        chatId,
        senderId: ctx.userId,
        type: type as any,
        content: payload.content ? this.crypto.encrypt(payload.content) : null,
        replyToId: payload.replyToId,
        fileUrl,
        fileName,
        fileSize,
        mimeType,
        duration,
        thumbnailUrl: payload.thumbnailUrl,
      },
      include: {
        sender: {
          select: { id: true, fullname: true, username: true, avatarUrl: true },
        },
        replyTo: {
          select: {
            id: true,
            content: true,
            senderId: true,
            sender: { select: { id: true, fullname: true } },
          },
        },
      },
    })

    // Chat metadata yangilash
    const chat = await this.prisma.chat.update({
      where: { id: chatId },
      data: { lastMessageAt: message.createdAt },
      include: {
        members: {
          where: { leftAt: null, userId: { not: ctx.userId } },
          take: 1,
          include: {
            user: { select: { fullname: true } },
          },
        },
      },
    })

    // Telegram push (non-blocking)
    const senderName = message.sender.fullname
    const chatTitle =
      chat.type === 'GROUP'
        ? chat.title || 'Guruh'
        : chat.members[0]?.user?.fullname || 'Chat'
    this.pushTelegramNotification(
      chatId,
      {
        id: message.id,
        type: message.type,
        content: payload.content || null,
        senderId: message.senderId,
        fileName: message.fileName,
        refSnapshot: message.refSnapshot,
      },
      senderName,
      chatTitle,
    ).catch(() => {})

    return {
      ...message,
      content: this.crypto.decrypt(message.content),
      replyTo: message.replyTo
        ? {
            ...message.replyTo,
            content: this.crypto.decrypt(message.replyTo.content),
          }
        : null,
    }
  }

  async editMessage(messageId: string, payload: EditMessageDto, ctx: Ctx) {
    const msg = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, deletedAt: null },
    })
    if (!msg) throw new NotFoundException('Xabar topilmadi')
    if (msg.senderId !== ctx.userId)
      throw new ForbiddenException("Faqat o'z xabaringizni tahrirlay olasiz")
    if (msg.type !== 'TEXT')
      throw new BadRequestException('Faqat matnli xabarlarni tahrirlash mumkin')

    const updated = await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: {
        content: this.crypto.encrypt(payload.content),
        editedAt: new Date(),
      },
    })
    return { ...updated, content: this.crypto.decrypt(updated.content) }
  }

  async deleteMessage(messageId: string, ctx: Ctx) {
    const msg = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, deletedAt: null },
    })
    if (!msg) throw new NotFoundException('Xabar topilmadi')

    const canDeleteAny =
      this.isAdmin(ctx) ||
      (await this.prisma.chatMember.findFirst({
        where: {
          chatId: msg.chatId,
          userId: ctx.userId,
          role: { in: ['OWNER', 'ADMIN'] },
          leftAt: null,
        },
      }))

    if (msg.senderId !== ctx.userId && !canDeleteAny) {
      throw new ForbiddenException("Xabarni o'chirish huquqi yo'q")
    }

    await this.prisma.chatMessage.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    })
    return { success: true, chatId: msg.chatId, messageId }
  }

  async markChatRead(chatId: string, ctx: Ctx, upToMessageId?: string) {
    await this.ensureMember(chatId, ctx.userId)
    const now = new Date()

    // Member lastReadAt
    await this.prisma.chatMember.updateMany({
      where: { chatId, userId: ctx.userId, leftAt: null },
      data: { lastReadAt: now },
    })

    // showReadReceipts=false bo'lsa — individual read yozmaymiz (boshqalar ko'rmaydi)
    const settings = await this.prisma.userChatSettings.findFirst({
      where: { userId: ctx.userId },
    })
    if (settings && settings.showReadReceipts === false) {
      return { success: true, readAt: now }
    }

    // Individual message reads (for read receipts) — until upToMessageId
    if (upToMessageId) {
      const anchor = await this.prisma.chatMessage.findFirst({
        where: { id: upToMessageId, chatId },
        select: { createdAt: true },
      })
      if (anchor) {
        const msgs = await this.prisma.chatMessage.findMany({
          where: {
            chatId,
            createdAt: { lte: anchor.createdAt },
            senderId: { not: ctx.userId },
            deletedAt: null,
          },
          select: { id: true },
          take: 500,
        })
        for (const m of msgs) {
          await this.prisma.chatMessageRead.upsert({
            where: {
              messageId_userId: { messageId: m.id, userId: ctx.userId },
            },
            create: { messageId: m.id, userId: ctx.userId },
            update: {},
          })
        }
      }
    }

    return { success: true, readAt: now }
  }

  async addReaction(messageId: string, payload: AddReactionDto, ctx: Ctx) {
    const msg = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, deletedAt: null },
    })
    if (!msg) throw new NotFoundException('Xabar topilmadi')
    await this.ensureMember(msg.chatId, ctx.userId)

    await this.prisma.chatMessageReaction.upsert({
      where: {
        messageId_userId_emoji: {
          messageId,
          userId: ctx.userId,
          emoji: payload.emoji,
        },
      },
      create: { messageId, userId: ctx.userId, emoji: payload.emoji },
      update: {},
    })
    return { success: true, chatId: msg.chatId }
  }

  async removeReaction(messageId: string, emoji: string, ctx: Ctx) {
    const msg = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, deletedAt: null },
    })
    if (!msg) throw new NotFoundException('Xabar topilmadi')
    await this.prisma.chatMessageReaction.deleteMany({
      where: { messageId, userId: ctx.userId, emoji },
    })
    return { success: true, chatId: msg.chatId }
  }

  async forwardMessage(
    messageId: string,
    payload: ForwardMessageDto,
    ctx: Ctx,
  ) {
    const source = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, deletedAt: null },
      include: {
        sender: { select: { id: true, fullname: true } },
        chat: { select: { id: true, type: true, title: true } },
      },
    })
    if (!source) throw new NotFoundException('Xabar topilmadi')
    await this.ensureMember(source.chatId, ctx.userId)

    // Agar source o'zi forward bo'lsa — original manbani saqlaymiz (Telegram kabi)
    const origUserId = source.forwardedFromUserId || source.senderId
    const origName = source.forwardedFromName || source.sender?.fullname || null
    const origChatId =
      source.forwardedFromChatId ||
      (source.chat?.type === 'GROUP' ? source.chatId : null)
    const origChatTitle =
      source.forwardedFromChatTitle ||
      (source.chat?.type === 'GROUP' ? source.chat.title : null)

    const results: any[] = []
    for (const toChatId of payload.toChatIds) {
      await this.ensureMember(toChatId, ctx.userId)
      const forwarded = await this.prisma.chatMessage.create({
        data: {
          chatId: toChatId,
          senderId: ctx.userId,
          type: source.type,
          content: source.content, // already encrypted
          forwardedFromId: source.id,
          forwardedFromUserId: origUserId,
          forwardedFromChatId: origChatId,
          forwardedFromName: origName,
          forwardedFromChatTitle: origChatTitle,
          fileUrl: source.fileUrl,
          fileName: source.fileName,
          fileSize: source.fileSize,
          mimeType: source.mimeType,
          duration: source.duration,
          thumbnailUrl: source.thumbnailUrl,
          refType: source.refType,
          refId: source.refId,
          refSnapshot: source.refSnapshot ?? undefined,
        },
      })
      await this.prisma.chat.update({
        where: { id: toChatId },
        data: { lastMessageAt: forwarded.createdAt },
      })
      results.push({ chatId: toChatId, messageId: forwarded.id })
    }
    return { count: results.length, forwarded: results }
  }

  /** Workflow'ni chatga yuborish */
  async forwardWorkflow(
    workflowId: string,
    payload: ForwardEntityDto,
    ctx: Ctx,
  ) {
    await this.ensureMember(payload.toChatId, ctx.userId)
    const workflow = await this.prisma.workflow.findFirst({
      where: { id: workflowId, deletedAt: null },
      include: {
        document: {
          select: { id: true, title: true, documentNumber: true, status: true },
        },
      },
    })
    if (!workflow) throw new NotFoundException('Workflow topilmadi')

    const snapshot = {
      id: workflow.id,
      type: workflow.type,
      status: workflow.status,
      document: workflow.document,
      url: `/dashboard/workflow/${workflow.id}`,
    }

    const msg = await this.prisma.chatMessage.create({
      data: {
        chatId: payload.toChatId,
        senderId: ctx.userId,
        type: 'WORKFLOW',
        content: payload.caption ? this.crypto.encrypt(payload.caption) : null,
        refType: 'workflow',
        refId: workflow.id,
        refSnapshot: snapshot as any,
      },
    })
    await this.prisma.chat.update({
      where: { id: payload.toChatId },
      data: { lastMessageAt: msg.createdAt },
    })
    return { id: msg.id, chatId: payload.toChatId, ref: snapshot }
  }

  async forwardDocument(
    documentId: string,
    payload: ForwardEntityDto,
    ctx: Ctx,
  ) {
    await this.ensureMember(payload.toChatId, ctx.userId)
    const doc = await this.prisma.document.findFirst({
      where: { id: documentId, deletedAt: null },
      include: {
        documentType: { select: { name: true } },
        attachments: {
          where: { deletedAt: null, mimeType: 'application/pdf' },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    })
    if (!doc) throw new NotFoundException('Hujjat topilmadi')

    const snapshot = {
      id: doc.id,
      title: doc.title,
      documentNumber: doc.documentNumber,
      status: doc.status,
      documentType: doc.documentType?.name,
      pdfUrl: doc.attachments[0]?.fileUrl || null,
      url: `/dashboard/document/${doc.id}`,
    }

    const msg = await this.prisma.chatMessage.create({
      data: {
        chatId: payload.toChatId,
        senderId: ctx.userId,
        type: 'DOCUMENT',
        content: payload.caption ? this.crypto.encrypt(payload.caption) : null,
        refType: 'document',
        refId: doc.id,
        refSnapshot: snapshot as any,
      },
    })
    await this.prisma.chat.update({
      where: { id: payload.toChatId },
      data: { lastMessageAt: msg.createdAt },
    })
    return { id: msg.id, chatId: payload.toChatId, ref: snapshot }
  }

  async forwardTask(taskId: string, payload: ForwardEntityDto, ctx: Ctx) {
    await this.ensureMember(payload.toChatId, ctx.userId)
    const task = await this.prisma.task.findFirst({
      where: { id: taskId, deletedAt: null },
      include: { project: { select: { name: true, key: true } } },
    })
    if (!task) throw new NotFoundException('Topshiriq topilmadi')

    const snapshot = {
      id: task.id,
      ref: `${task.project?.key}-${task.taskNumber}`,
      title: task.title,
      priority: task.priority,
      score: task.score,
      dueDate: task.dueDate,
      project: task.project?.name,
      url: `/dashboard/task/${task.id}`,
    }

    const msg = await this.prisma.chatMessage.create({
      data: {
        chatId: payload.toChatId,
        senderId: ctx.userId,
        type: 'TASK',
        content: payload.caption ? this.crypto.encrypt(payload.caption) : null,
        refType: 'task',
        refId: task.id,
        refSnapshot: snapshot as any,
      },
    })
    await this.prisma.chat.update({
      where: { id: payload.toChatId },
      data: { lastMessageAt: msg.createdAt },
    })
    return { id: msg.id, chatId: payload.toChatId, ref: snapshot }
  }

  /** Settings */
  async getSettings(ctx: Ctx) {
    const existing = await this.prisma.userChatSettings.findFirst({
      where: { userId: ctx.userId },
    })
    if (existing) return existing
    return await this.prisma.userChatSettings.create({
      data: { userId: ctx.userId },
    })
  }

  async updateSettings(payload: UpdateChatSettingsDto, ctx: Ctx) {
    const existing = await this.getSettings(ctx)
    return await this.prisma.userChatSettings.update({
      where: { id: existing.id },
      data: { ...payload },
    })
  }

  /** Call — RINGING holatida yaratish */
  async initiateCall(chatId: string, payload: InitiateCallDto, ctx: Ctx) {
    await this.ensureMember(chatId, ctx.userId)
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
      include: { members: { where: { leftAt: null } } },
    })
    if (!chat) throw new NotFoundException('Chat topilmadi')

    // Qabul qiluvchilarning settings tekshirish
    const others = chat.members.filter((m) => m.userId !== ctx.userId)
    const receiverIds = others.map((m) => m.userId)
    const settings = await this.prisma.userChatSettings.findMany({
      where: { userId: { in: receiverIds } },
    })
    const blockedByAll =
      receiverIds.length > 0 &&
      receiverIds.every((uid) => {
        const s = settings.find((x) => x.userId === uid)
        if (!s) return false
        return payload.type === 'VIDEO' ? !s.allowVideoCalls : !s.allowCalls
      })
    if (blockedByAll) {
      throw new ForbiddenException(
        "Bu foydalanuvchilar qo'ng'iroqlarni o'chirib qo'yishgan",
      )
    }

    const call = await this.prisma.callSession.create({
      data: {
        chatId,
        initiatorId: ctx.userId,
        type: payload.type,
        status: 'RINGING',
        participants: {
          create: [
            { userId: ctx.userId, accepted: true, joinedAt: new Date() },
            ...others.map((m) => ({ userId: m.userId, accepted: false })),
          ],
        },
      },
      include: {
        initiator: {
          select: { id: true, fullname: true, username: true, avatarUrl: true },
        },
        chat: {
          select: { id: true, type: true, title: true, avatarUrl: true },
        },
        participants: {
          include: {
            user: {
              select: {
                id: true,
                fullname: true,
                username: true,
                avatarUrl: true,
              },
            },
          },
        },
      },
    })
    return call
  }

  async respondToCall(
    callId: string,
    action: 'accept' | 'reject' | 'end',
    ctx: Ctx,
  ) {
    const call = await this.prisma.callSession.findFirst({
      where: { id: callId },
      include: {
        initiator: {
          select: { id: true, fullname: true, username: true, avatarUrl: true },
        },
        participants: true,
      },
    })
    if (!call) throw new NotFoundException("Qo'ng'iroq topilmadi")

    const part = call.participants.find((p) => p.userId === ctx.userId)
    if (!part)
      throw new ForbiddenException("Siz bu qo'ng'iroq ishtirokchisi emassiz")

    if (action === 'accept') {
      if (call.status !== 'RINGING' && call.status !== 'ACTIVE') {
        throw new BadRequestException("Qo'ng'iroq allaqachon tugagan")
      }
      await this.prisma.callParticipant.update({
        where: { id: part.id },
        data: { accepted: true, joinedAt: new Date() },
      })
      if (call.status === 'RINGING') {
        await this.prisma.callSession.update({
          where: { id: callId },
          data: { status: 'ACTIVE', startedAt: new Date() },
        })
      }
      return {
        success: true,
        action,
        callId,
        chatId: call.chatId,
        initiator: call.initiator,
      }
    }

    if (action === 'reject') {
      await this.prisma.callParticipant.update({
        where: { id: part.id },
        data: { leftAt: new Date() },
      })
      // Agar barcha non-initiator'lar rad etgan bo'lsa — REJECTED
      const others = call.participants.filter(
        (p) => p.userId !== call.initiatorId,
      )
      const allRejected = others.every(
        (p) => p.userId === ctx.userId || p.leftAt,
      )
      if (allRejected) {
        await this.prisma.callSession.update({
          where: { id: callId },
          data: {
            status: call.status === 'ACTIVE' ? 'ENDED' : 'REJECTED',
            endedAt: new Date(),
          },
        })
      }
      return {
        success: true,
        action,
        callId,
        chatId: call.chatId,
        initiator: call.initiator,
      }
    }

    // end
    const endedAt = new Date()
    const duration =
      call.startedAt && call.status === 'ACTIVE'
        ? Math.round((endedAt.getTime() - call.startedAt.getTime()) / 1000)
        : 0
    await this.prisma.callSession.update({
      where: { id: callId },
      data: { status: 'ENDED', endedAt, duration },
    })
    await this.prisma.callParticipant.updateMany({
      where: { callId, leftAt: null },
      data: { leftAt: endedAt },
    })
    return {
      success: true,
      action,
      duration,
      callId,
      chatId: call.chatId,
      initiator: call.initiator,
    }
  }

  // ============ FAZA 2: MUTE / PIN / ARCHIVE ============

  async muteChat(chatId: string, until: string | null | undefined, ctx: Ctx) {
    await this.ensureMember(chatId, ctx.userId)
    const mutedUntil = until ? new Date(until) : null
    await this.prisma.chatMember.updateMany({
      where: { chatId, userId: ctx.userId, leftAt: null },
      data: { mutedUntil },
    })
    return { success: true, mutedUntil }
  }

  async pinChat(chatId: string, pinned: boolean, ctx: Ctx) {
    await this.ensureMember(chatId, ctx.userId)
    await this.prisma.chatMember.updateMany({
      where: { chatId, userId: ctx.userId, leftAt: null },
      data: { isPinned: pinned },
    })
    return { success: true, isPinned: pinned }
  }

  async archiveChat(chatId: string, archived: boolean, ctx: Ctx) {
    await this.ensureMember(chatId, ctx.userId)
    await this.prisma.chatMember.updateMany({
      where: { chatId, userId: ctx.userId, leftAt: null },
      data: { isArchived: archived },
    })
    return { success: true, isArchived: archived }
  }

  // ============ FAZA 2: READ-BY LIST ============

  async getMessageReads(messageId: string, ctx: Ctx) {
    const msg = await this.prisma.chatMessage.findFirst({
      where: { id: messageId, deletedAt: null },
    })
    if (!msg) throw new NotFoundException('Xabar topilmadi')
    await this.ensureMember(msg.chatId, ctx.userId)

    const reads = await this.prisma.chatMessageRead.findMany({
      where: { messageId },
      orderBy: { readAt: 'desc' },
      include: {
        user: {
          select: { id: true, fullname: true, username: true, avatarUrl: true },
        },
      },
    })

    // showReadReceipts=false o'rnatgan foydalanuvchilarni filtrlamaymiz chunki
    // bu ularning o'qiganligi haqidagi ma'lumotni yashirishi kerak — shuning uchun
    // settings orqali ular o'qiganlar ro'yxatiga yozilmaydi (sendMessage/markRead'da).
    // Hozircha hammasi qaytadi.
    return {
      count: reads.length,
      reads: reads.map((r) => ({
        userId: r.userId,
        user: r.user,
        readAt: r.readAt,
      })),
    }
  }

  // ============ FAZA 2: SEARCH ============

  /**
   * Xabar qidirish. Content shifrlangani uchun:
   *  - Yaqin oxirgi 1000 ta xabarni memory'da deshifrlab, substring match
   *  - File name, refSnapshot, chat title — DB darajasida ILIKE
   * Fast va real-time, lekin juda katta tarixda sekinlashadi.
   */
  async searchMessages(q: string, chatId: string | undefined, ctx: Ctx) {
    const query = q.trim()
    if (query.length < 2) return { count: 0, messages: [] }
    const queryLower = query.toLowerCase()

    // Foydalanuvchi a'zo bo'lgan chatlar ro'yxati
    const myChats = await this.prisma.chatMember.findMany({
      where: { userId: ctx.userId, leftAt: null },
      select: { chatId: true },
    })
    let chatIds = myChats.map((m) => m.chatId)
    if (chatId) {
      if (!chatIds.includes(chatId)) return { count: 0, messages: [] }
      chatIds = [chatId]
    }
    if (chatIds.length === 0) return { count: 0, messages: [] }

    // DB darajasidagi qidiruv — fayl nomi va refSnapshot
    const dbMatches = await this.prisma.chatMessage.findMany({
      where: {
        chatId: { in: chatIds },
        deletedAt: null,
        OR: [{ fileName: { contains: query, mode: 'insensitive' } }],
      },
      take: 50,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, fullname: true, avatarUrl: true } },
        chat: { select: { id: true, type: true, title: true } },
      },
    })

    // Memory darajasidagi content search (shifrlangan kontentni deshifrlab)
    const recent = await this.prisma.chatMessage.findMany({
      where: {
        chatId: { in: chatIds },
        deletedAt: null,
        type: { in: ['TEXT', 'IMAGE', 'VIDEO', 'VOICE', 'FILE'] },
        content: { not: null },
      },
      take: 2000,
      orderBy: { createdAt: 'desc' },
      include: {
        sender: { select: { id: true, fullname: true, avatarUrl: true } },
        chat: { select: { id: true, type: true, title: true } },
      },
    })

    const contentMatches: any[] = []
    for (const m of recent) {
      const decrypted = this.crypto.decrypt(m.content)
      if (decrypted && decrypted.toLowerCase().includes(queryLower)) {
        contentMatches.push({ ...m, content: decrypted })
        if (contentMatches.length >= 50) break
      }
    }

    // Duplicate'larni olib tashlash
    const seen = new Set<string>()
    const combined: any[] = []
    for (const m of [...contentMatches, ...dbMatches]) {
      if (seen.has(m.id)) continue
      seen.add(m.id)
      combined.push({
        ...m,
        content:
          m.content &&
          typeof m.content === 'string' &&
          !m.content.startsWith('enc:v1:')
            ? m.content
            : this.crypto.decrypt(m.content),
      })
    }
    combined.sort(
      (a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0),
    )

    return { count: combined.length, messages: combined.slice(0, 50) }
  }

  // ============ FAZA 2: CALL TIMEOUT ============

  /**
   * Timeout bo'lgan RINGING qo'ng'iroqlarni MISSED ga o'tkazadi (scheduler chaqiradi).
   * Qaytaradi: o'zgartirilgan call ID'lar (WS event uchun).
   */
  async expireStaleCalls(): Promise<Array<{ id: string; chatId: string }>> {
    const cutoff = new Date(Date.now() - 60_000)
    const stale = await this.prisma.callSession.findMany({
      where: { status: 'RINGING', createdAt: { lt: cutoff } },
      select: { id: true, chatId: true },
    })
    if (!stale.length) return []
    await this.prisma.callSession.updateMany({
      where: { id: { in: stale.map((s) => s.id) } },
      data: { status: 'MISSED', endedAt: new Date() },
    })
    return stale
  }

  // ============ FAZA 2: TELEGRAM PUSH ============

  /**
   * Chatda xabar yuborilganda offline yoki telegram orqali
   * xabardor bo'lishni xohlovchi a'zolarga push yuboradi.
   *
   * Mantiq:
   *  - Sender o'zi bildirishnoma olmaydi
   *  - mutedUntil > hozir bo'lsa — o'tkazib yuboradi
   *  - notifyPreview=false bo'lsa content yashiriladi
   *  - Telegram ID bog'lanmagan bo'lsa — o'tkazib yuboriladi (silent)
   */
  async pushTelegramNotification(
    chatId: string,
    message: {
      id: string
      type: string
      content: string | null
      senderId: string
      fileName?: string | null
      refSnapshot?: any
    },
    senderName: string,
    chatTitle: string,
  ) {
    try {
      const members = await this.prisma.chatMember.findMany({
        where: {
          chatId,
          leftAt: null,
          userId: { not: message.senderId },
        },
        include: {
          user: { select: { id: true, telegramId: true, fullname: true } },
        },
      })

      const now = new Date()
      const receiverIds = members
        .filter((m) => !m.mutedUntil || m.mutedUntil < now)
        .filter((m) => m.user.telegramId)
        .map((m) => m.userId)

      if (!receiverIds.length) return

      // Settings — notifyPreview
      const settings = await this.prisma.userChatSettings.findMany({
        where: { userId: { in: receiverIds } },
      })
      const previewById = new Map(
        settings.map((s) => [s.userId, s.notifyPreview]),
      )

      const escape = (s: string) =>
        s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')

      for (const m of members.filter((x) => receiverIds.includes(x.userId))) {
        const preview = previewById.get(m.userId) !== false // default true

        let body: string
        if (preview) {
          switch (message.type) {
            case 'TEXT':
              body = escape(message.content || '')
              break
            case 'IMAGE':
              body = '📷 Rasm'
              break
            case 'VIDEO':
              body = '🎥 Video'
              break
            case 'VOICE':
              body = '🎤 Ovozli xabar'
              break
            case 'FILE':
              body = `📎 ${escape(message.fileName || 'Fayl')}`
              break
            case 'DOCUMENT':
              body = `📄 Hujjat: ${escape(message.refSnapshot?.documentNumber || '')}`
              break
            case 'WORKFLOW':
              body = `🔄 Workflow: ${escape(message.refSnapshot?.document?.documentNumber || '')}`
              break
            case 'TASK':
              body = `✅ Topshiriq: ${escape(message.refSnapshot?.ref || '')}`
              break
            default:
              body = 'Yangi xabar'
          }
          if (body.length > 300) body = body.slice(0, 300) + '…'
        } else {
          body = '<i>(yangi xabar)</i>'
        }

        const text =
          `💬 <b>${escape(chatTitle)}</b>\n` +
          `👤 ${escape(senderName)}\n\n` +
          body

        try {
          await this.telegram.sendWorkflowNotification(m.userId, text)
        } catch (err: any) {
          this.logger.warn(
            `Telegram push failed for ${m.userId}: ${err.message}`,
          )
        }
      }
    } catch (err: any) {
      this.logger.error(`pushTelegramNotification failed: ${err.message}`)
    }
  }

  // ============ FAZA 3: BLOCK / CLEAR HISTORY / PUBLIC GROUPS ============

  async blockUser(targetUserId: string, ctx: Ctx) {
    if (targetUserId === ctx.userId) {
      throw new BadRequestException("O'zingizni bloklay olmaysiz")
    }
    const target = await this.prisma.user.findFirst({
      where: { id: targetUserId, deletedAt: null },
      select: { id: true },
    })
    if (!target) throw new NotFoundException('Foydalanuvchi topilmadi')
    await this.prisma.userBlock.upsert({
      where: {
        blockerId_blockedId: { blockerId: ctx.userId, blockedId: targetUserId },
      },
      create: { blockerId: ctx.userId, blockedId: targetUserId },
      update: {},
    })
    return { success: true, blocked: true, userId: targetUserId }
  }

  async unblockUser(targetUserId: string, ctx: Ctx) {
    await this.prisma.userBlock.deleteMany({
      where: { blockerId: ctx.userId, blockedId: targetUserId },
    })
    return { success: true, blocked: false, userId: targetUserId }
  }

  async getBlockedUsers(ctx: Ctx) {
    const blocks = await this.prisma.userBlock.findMany({
      where: { blockerId: ctx.userId },
      include: {
        blocked: {
          select: { id: true, fullname: true, username: true, avatarUrl: true },
        },
      },
    })
    return {
      count: blocks.length,
      users: blocks.map((b) => ({ ...b.blocked, blockedAt: b.createdAt })),
    }
  }

  async clearChatHistory(chatId: string, ctx: Ctx) {
    await this.ensureMember(chatId, ctx.userId)
    await this.prisma.chatMember.updateMany({
      where: { chatId, userId: ctx.userId, leftAt: null },
      data: { historyClearedAt: new Date() },
    })
    return { success: true }
  }

  // ============ GROUP VISIBILITY / INVITE / PUBLIC ============

  private generateInviteCode(): string {
    return (
      Math.random().toString(36).slice(2, 10) +
      Math.random().toString(36).slice(2, 8)
    )
  }

  async updateGroupVisibility(
    chatId: string,
    payload: { visibility: 'PRIVATE' | 'PUBLIC'; username?: string },
    ctx: Ctx,
  ) {
    await this.ensureGroupAdmin(chatId, ctx.userId, ctx)
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
    })
    if (!chat || chat.type !== 'GROUP')
      throw new NotFoundException('Guruh topilmadi')

    const data: any = { visibility: payload.visibility }

    if (payload.visibility === 'PUBLIC') {
      if (!payload.username) {
        throw new BadRequestException('Public guruh uchun username kerak')
      }
      if (!/^[a-z0-9_]{3,32}$/i.test(payload.username)) {
        throw new BadRequestException(
          "Username 3-32 belgi, faqat harflar/raqamlar/_ bo'lishi kerak",
        )
      }
      const existing = await this.prisma.chat.findFirst({
        where: {
          username: payload.username.toLowerCase(),
          id: { not: chatId },
        },
      })
      if (existing) throw new BadRequestException('Bu username band')
      data.username = payload.username.toLowerCase()
    } else {
      data.username = null
      if (!chat.inviteCode) data.inviteCode = this.generateInviteCode()
    }

    const updated = await this.prisma.chat.update({
      where: { id: chatId },
      data,
    })
    return {
      id: updated.id,
      visibility: updated.visibility,
      username: updated.username,
      inviteCode: updated.inviteCode,
    }
  }

  async updateGroupPermissions(
    chatId: string,
    payload: {
      allowMemberInvite?: boolean
      allowMemberSendMedia?: boolean
      allowMemberPin?: boolean
    },
    ctx: Ctx,
  ) {
    await this.ensureGroupAdmin(chatId, ctx.userId, ctx)
    const chat = await this.prisma.chat.findFirst({
      where: { id: chatId, deletedAt: null },
    })
    if (!chat || chat.type !== 'GROUP')
      throw new NotFoundException('Guruh topilmadi')
    return await this.prisma.chat.update({
      where: { id: chatId },
      data: {
        allowMemberInvite: payload.allowMemberInvite ?? undefined,
        allowMemberSendMedia: payload.allowMemberSendMedia ?? undefined,
        allowMemberPin: payload.allowMemberPin ?? undefined,
      },
      select: {
        id: true,
        allowMemberInvite: true,
        allowMemberSendMedia: true,
        allowMemberPin: true,
      },
    })
  }

  async regenerateInviteCode(chatId: string, ctx: Ctx) {
    await this.ensureGroupAdmin(chatId, ctx.userId, ctx)
    return await this.prisma.chat.update({
      where: { id: chatId },
      data: { inviteCode: this.generateInviteCode() },
      select: { id: true, inviteCode: true },
    })
  }

  async joinByInviteCode(code: string, ctx: Ctx) {
    const chat = await this.prisma.chat.findFirst({
      where: { inviteCode: code, deletedAt: null, type: 'GROUP' },
    })
    if (!chat) throw new NotFoundException('Taklif havolasi yaroqsiz')
    return this.addSelfToGroup(chat.id, ctx)
  }

  async joinByUsername(username: string, ctx: Ctx) {
    const chat = await this.prisma.chat.findFirst({
      where: {
        username: username.toLowerCase(),
        deletedAt: null,
        type: 'GROUP',
        visibility: 'PUBLIC',
      },
    })
    if (!chat) throw new NotFoundException('Public guruh topilmadi')
    return this.addSelfToGroup(chat.id, ctx)
  }

  private async addSelfToGroup(chatId: string, ctx: Ctx) {
    const existing = await this.prisma.chatMember.findFirst({
      where: { chatId, userId: ctx.userId },
    })
    if (existing) {
      if (existing.leftAt) {
        await this.prisma.chatMember.update({
          where: { id: existing.id },
          data: { leftAt: null, joinedAt: new Date() },
        })
      }
      return {
        success: true,
        chatId,
        joined: true,
        alreadyMember: !existing.leftAt,
      }
    }
    await this.prisma.chatMember.create({
      data: { chatId, userId: ctx.userId, role: 'MEMBER' },
    })
    return { success: true, chatId, joined: true, alreadyMember: false }
  }

  async searchPublicChats(q: string) {
    const query = q.trim()
    if (query.length < 2) return { count: 0, chats: [] }
    const chats = await this.prisma.chat.findMany({
      where: {
        deletedAt: null,
        type: 'GROUP',
        visibility: 'PUBLIC',
        OR: [
          { username: { contains: query.toLowerCase(), mode: 'insensitive' } },
          { title: { contains: query, mode: 'insensitive' } },
        ],
      },
      take: 20,
      select: {
        id: true,
        title: true,
        description: true,
        avatarUrl: true,
        username: true,
        _count: { select: { members: { where: { leftAt: null } } } },
      },
    })
    return {
      count: chats.length,
      chats: chats.map((c) => ({
        id: c.id,
        title: c.title,
        description: c.description,
        avatarUrl: c.avatarUrl,
        username: c.username,
        membersCount: c._count.members,
      })),
    }
  }

  /** WS gateway tomonidan chaqiriladi — chatdagi barcha a'zo userId'lari */
  async getChatMemberIds(chatId: string): Promise<string[]> {
    const members = await this.prisma.chatMember.findMany({
      where: { chatId, leftAt: null },
      select: { userId: true },
    })
    return members.map((m) => m.userId)
  }
}
