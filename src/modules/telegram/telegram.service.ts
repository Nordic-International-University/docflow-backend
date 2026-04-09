import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { Telegraf, Context } from 'telegraf'

@Injectable()
export class TelegramService implements OnModuleInit {
  private readonly logger = new Logger(TelegramService.name)
  private bot: Telegraf
  private _workflowStepId: string
  private _username: string

  constructor(private readonly prisma: PrismaService) {}

  async onModuleInit() {
    const token = process.env.TELEGRAM_BOT_TOKEN

    if (!token) {
      this.logger.warn(
        'TELEGRAM_BOT_TOKEN not found in environment variables. Telegram bot will not be initialized.',
      )
      return
    }

    try {
      this.logger.log('Initializing Telegram bot with Telegraf...')
      this.bot = new Telegraf(token)

      // Set up command handlers
      this.setupCommandHandlers()

      // Error handling
      this.bot.catch((err, ctx) => {
        this.logger.error(`Error for ${ctx.updateType}:`, err)
      })

      // Launch bot in non-blocking mode
      this.bot
        .launch()
        .then(async () => {
          // Get bot info
          const me = await this.bot.telegram.getMe()
          this.logger.log(`Bot connected: @${me.username} (${me.first_name})`)
        })
        .catch((err) => {
          this.logger.error('Failed to launch Telegram bot:', err)
        })

      // Enable graceful stop
      process.once('SIGINT', () => this.bot.stop('SIGINT'))
      process.once('SIGTERM', () => this.bot.stop('SIGTERM'))
    } catch (error) {
      this.logger.error('Failed to initialize Telegram bot:', error)
    }
  }

  private setupCommandHandlers() {
    this.logger.log('Setting up command handlers...')

    // Handle /start command
    this.bot.start(async (ctx: Context) => {
      try {
        const chatId = ctx.chat.id
        const telegramId = ctx.from.id.toString()
        const username = ctx.from.username
        const fullName =
          `${ctx.from.first_name || ''} ${ctx.from.last_name || ''}`.trim()

        // Check for deep link parameter (extract from message text)
        const messageText =
          ctx.message && 'text' in ctx.message ? ctx.message.text : ''
        const startPayload = messageText.split(' ')[1] || null

        this.logger.log(
          `Received /start command from ${fullName} (${username}) with Telegram ID: ${telegramId}`,
        )

        if (startPayload) {
          // Deep link format: /start <userId>
          await this.handleDeepLink(chatId, telegramId, startPayload)
        } else {
          // Regular start
          await this.handleStart(chatId, telegramId, username, fullName)
        }
      } catch (error) {
        this.logger.error('Error handling /start command:', error)
        await ctx.reply(
          "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        )
      }
    })

    // Handle /link command
    this.bot.command('link', async (ctx: Context) => {
      try {
        const chatId = ctx.chat.id
        const telegramId = ctx.from.id.toString()
        const args =
          ctx.message && 'text' in ctx.message
            ? ctx.message.text.split(' ').slice(1)
            : []
        const userId = args[0]

        if (!userId) {
          await ctx.reply(
            "Iltimos, foydalanuvchi ID sini ko'rsating.\n\nMisol: /link <foydalanuvchi-id>",
          )
          return
        }

        this.logger.log(`Received /link command from ${telegramId}`)
        await this.linkUserByCommand(chatId, telegramId, userId)
      } catch (error) {
        this.logger.error('Error handling /link command:', error)
        await ctx.reply(
          "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        )
      }
    })

    // Handle /info command
    this.bot.command('info', async (ctx: Context) => {
      try {
        const chatId = ctx.chat.id
        const telegramId = ctx.from.id.toString()

        this.logger.log(`Received /info command from ${telegramId}`)
        await this.sendUserInfo(chatId, telegramId)
      } catch (error) {
        this.logger.error('Error handling /info command:', error)
        await ctx.reply(
          "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        )
      }
    })

    // Handle /help command
    this.bot.help(async (ctx: Context) => {
      try {
        const chatId = ctx.chat.id

        this.logger.log(`Received /help command from ${ctx.from?.id}`)
        await this.sendHelpMessage(chatId)
      } catch (error) {
        this.logger.error('Error handling /help command:', error)
        await ctx.reply(
          "Xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
        )
      }
    })

    // Log all messages for debugging
    this.bot.on('message', (ctx: Context) => {
      if (ctx.message && 'text' in ctx.message) {
        this.logger.debug(
          `Received message from ${ctx.from?.username || ctx.from?.id}: ${ctx.message.text}`,
        )
      }
    })

    this.logger.log('Command handlers set up successfully')
  }

  private async handleStart(
    chatId: number,
    telegramId: string,
    username: string,
    fullName: string,
  ) {
    this._username = username
    // Check if this Telegram ID is already linked
    const existingUser = await this.prisma.user.findFirst({
      where: { telegramId, deletedAt: null },
      select: {
        id: true,
        fullname: true,
        username: true,
      },
    })

    if (existingUser) {
      await this.bot.telegram.sendMessage(
        chatId,
        `Xush kelibsiz, ${existingUser.fullname}!\n\n` +
          `Sizning Telegram hisobingiz allaqachon DocFlow hisobingizga bog'langan.\n\n` +
          `Siz bu yerda ish jarayoni vazifalari haqida xabarnomalar olasiz.\n\n` +
          `Buyruqlar:\n` +
          `/info - Hisob ma'lumotlarini ko'rish\n` +
          `/help - Mavjud buyruqlarni ko'rsatish`,
      )
    } else {
      await this.bot.telegram.sendMessage(
        chatId,
        `DocFlow Xabarnoma Botiga xush kelibsiz!\n\n` +
          `Telegram hisobingizni DocFlow bilan bog'lash uchun:\n\n` +
          `1. DocFlow veb-ilovasiga kiring\n` +
          `2. Profil sozlamalariga o'ting\n` +
          `3. "Telegram hisobini bog'lash" tugmasini bosing\n` +
          `4. Ko'rsatmalarga amal qiling\n\n` +
          `Yoki buyruqdan foydalaning: /link <foydalanuvchi-id>\n\n` +
          `Sizning Telegram ID: ${telegramId}\n\n` +
          `Qo'shimcha ma'lumot uchun /help buyrug'ini yozing.`,
      )
    }
  }

  private async handleDeepLink(
    chatId: number,
    telegramId: string,
    userId: string,
  ) {
    try {
      // Find the user by ID
      const user = await this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
      })

      if (!user) {
        await this.bot.telegram.sendMessage(
          chatId,
          "Noto'g'ri havola. Iltimos, DocFlow ilovasidan qayta urinib ko'ring.",
        )
        return
      }

      // Check if this Telegram ID is already linked to another user
      const existingLink = await this.prisma.user.findFirst({
        where: {
          telegramId,
          id: { not: userId },
          deletedAt: null,
        },
      })

      if (existingLink) {
        await this.bot.telegram.sendMessage(
          chatId,
          `Bu Telegram hisob allaqachon boshqa DocFlow hisobiga bog'langan (${existingLink.fullname}).\n\n` +
            `Iltimos, boshqa Telegram hisobidan foydalaning yoki qo'llab-quvvatlash xizmatiga murojaat qiling.`,
        )
        return
      }

      // Link the Telegram ID to the user
      await this.prisma.user.update({
        where: { id: userId },
        data: { telegramId },
      })

      await this.bot.telegram.sendMessage(
        chatId,
        `Muvaffaqiyatli! Telegram hisobingiz DocFlow bilan bog'landi.\n\n` +
          `Hisob: ${user.fullname} (@${user.username})\n\n` +
          `Endi siz bu yerda ish jarayoni xabarnomalarini olasiz.\n\n` +
          `Mavjud buyruqlarni ko'rish uchun /help buyrug'ini yozing.`,
      )

      this.logger.log(
        `Successfully linked Telegram ID ${telegramId} to user ${user.id} (${user.fullname})`,
      )
    } catch (error) {
      this.logger.error('Error handling deep link:', error)
      await this.bot.telegram.sendMessage(
        chatId,
        "Hisobni bog'lashda xatolik yuz berdi. Iltimos, keyinroq qayta urinib ko'ring.",
      )
    }
  }

  private async linkUserByCommand(
    chatId: number,
    telegramId: string,
    userId: string,
  ) {
    await this.handleDeepLink(chatId, telegramId, userId)
  }

  private async sendUserInfo(chatId: number, telegramId: string) {
    try {
      const user = await this.prisma.user.findFirst({
        where: { telegramId, deletedAt: null },
        include: {
          role: true,
          department: true,
        },
      })

      if (!user) {
        await this.bot.telegram.sendMessage(
          chatId,
          "Sizning Telegram hisobingiz hech qanday DocFlow hisobiga bog'lanmagan.\n\n" +
            "Bog'lash jarayonini boshlash uchun /start buyrug'idan foydalaning.",
        )
        return
      }

      // Get workflow step count
      const assignedStepsCount = await this.prisma.workflowStep.count({
        where: {
          assignedToUserId: user.id,
          status: 'IN_PROGRESS',
          deletedAt: null,
        },
      })

      await this.bot.telegram.sendMessage(
        chatId,
        `📋 DocFlow Hisob Ma'lumotlaringiz\n\n` +
          `Ism: ${user.fullname}\n` +
          `Foydalanuvchi nomi: @${user.username}\n` +
          `${user.role ? `Rol: ${user.role.name}\n` : ''}` +
          `${user.department ? `Bo'lim: ${user.department.name}\n` : ''}` +
          `\n` +
          `📊 Ish Jarayoni Holati:\n` +
          `Kutilayotgan vazifalar: ${assignedStepsCount}\n\n` +
          `Mavjud buyruqlar uchun /help buyrug'ini yozing.`,
      )
    } catch (error) {
      this.logger.error('Error fetching user info:', error)
      await this.bot.telegram.sendMessage(
        chatId,
        "Ma'lumotlaringizni olishda xatolik yuz berdi.",
      )
    }
  }

  private async sendHelpMessage(chatId: number) {
    await this.bot.telegram.sendMessage(
      chatId,
      `🤖 DocFlow Bot - Mavjud Buyruqlar\n\n` +
        `/start - Botni ishga tushirish va hisobni bog'lash\n` +
        `/link <foydalanuvchi-id> - Telegram'ni DocFlow hisobiga bog'lash\n` +
        `/info - Hisob ma'lumotlari va kutilayotgan vazifalarni ko'rish\n` +
        `/help - Ushbu yordam xabarini ko'rsatish\n\n` +
        `Siz avtomatik ravishda xabarnomalar olasiz:\n` +
        `• Sizga ish jarayoni qadami tayinlanganda\n` +
        `• Ish jarayoni qadamingiz bajarilganda\n` +
        `• Ish jarayoni qadamingiz rad etilganda\n` +
        `• Siz yaratgan ish jarayoni tugallanganda`,
    )
  }

  /**
   * Send a rich Telegram message with optional inline button
   */
  async sendTelegramMessage(
    chatId: string,
    text: string,
    actionUrl?: string | null,
    buttonText?: string,
  ): Promise<boolean> {
    if (!this.bot) {
      this.logger.warn('Telegram bot is not initialized')
      return false
    }
    try {
      const options: any = {
        parse_mode: 'HTML',
        disable_web_page_preview: true,
      }
      if (actionUrl) {
        options.reply_markup = {
          inline_keyboard: [
            [{ text: buttonText || '🔗 Ochish', url: actionUrl }],
          ],
        }
      }
      await this.bot.telegram.sendMessage(chatId, text, options)
      return true
    } catch (error) {
      this.logger.error(`Failed to send Telegram message to ${chatId}:`, error)
      return false
    }
  }

  /**
   * Send a workflow notification to a user via Telegram
   */
  async sendWorkflowNotification(
    userId: string,
    message: string,
    workflowStepId?: string,
  ): Promise<boolean> {
    this._workflowStepId = workflowStepId
    try {
      if (!this.bot) {
        this.logger.warn('Telegram bot is not initialized')
        return false
      }

      const user = await this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { telegramId: true, fullname: true },
      })

      if (!user || !user.telegramId) {
        this.logger.debug(
          `User ${userId} does not have a linked Telegram account`,
        )
        return false
      }

      await this.bot.telegram.sendMessage(user.telegramId, message, {
        parse_mode: 'HTML',
      })

      this.logger.log(
        `Sent Telegram notification to user ${user.fullname} (${userId})`,
      )
      return true
    } catch (error) {
      this.logger.error(
        `Failed to send Telegram notification to user ${userId}:`,
        error,
      )
      return false
    }
  }

  /**
   * Link a Telegram ID to a user account
   */
  async linkTelegramToUser(
    userId: string,
    telegramId: string,
  ): Promise<boolean> {
    try {
      // Check if this Telegram ID is already linked to another user
      const existingLink = await this.prisma.user.findFirst({
        where: {
          telegramId,
          id: { not: userId },
          deletedAt: null,
        },
      })

      if (existingLink) {
        throw new Error('This Telegram ID is already linked to another account')
      }

      await this.prisma.user.update({
        where: { id: userId },
        data: { telegramId },
      })

      if (this.bot) {
        await this.bot.telegram.sendMessage(
          telegramId,
          "✅ Telegram hisobingiz DocFlow bilan muvaffaqiyatli bog'landi!\n\n" +
            'Endi siz bu yerda ish jarayoni xabarnomalarini olasiz.',
        )
      }

      return true
    } catch (error) {
      this.logger.error('Error linking Telegram to user:', error)
      throw error
    }
  }

  async unlinkTelegramFromUser(userId: string): Promise<boolean> {
    try {
      const user = await this.prisma.user.findFirst({
        where: { id: userId, deletedAt: null },
        select: { telegramId: true },
      })

      if (!user || !user.telegramId) {
        return false
      }

      // Send goodbye message
      if (this.bot) {
        try {
          await this.bot.telegram.sendMessage(
            user.telegramId,
            '👋 Telegram hisobingiz DocFlow dan ajratildi.\n\n' +
              'Endi siz bu yerda xabarnomalar olmaysiz.\n\n' +
              "Istalgan vaqtda /start buyrug'i orqali qayta bog'lashingiz mumkin",
          )
        } catch (error) {
          this.logger.warn('Failed to send unlink message:', error)
        }
      }

      // Remove Telegram ID from user
      await this.prisma.user.update({
        where: { id: userId },
        data: { telegramId: null },
      })

      return true
    } catch (error) {
      this.logger.error('Error unlinking Telegram from user:', error)
      throw error
    }
  }
}
