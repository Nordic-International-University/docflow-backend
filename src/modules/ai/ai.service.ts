import { Injectable, Logger } from '@nestjs/common'
import { PrismaService } from '@prisma'
import { GroqService, GroqMessage } from './groq.service'
import { AiToolsService, ToolContext } from './ai-tools.service'

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly groq: GroqService,
    private readonly tools: AiToolsService,
  ) {}

  /**
   * Asosiy chat funksiyasi: foydalanuvchi savoli → AI javobi
   */
  async chat(payload: {
    userId: string
    message: string
    roleName?: string
    departmentId?: string
    fullname?: string
  }): Promise<any> {
    // 1. Foydalanuvchi xabarini saqlash
    await this.prisma.aiMessage.create({
      data: {
        userId: payload.userId,
        role: 'user',
        content: payload.message,
      },
    })

    // 2. Tarix (oxirgi 10 message) — context uchun
    const history = await this.prisma.aiMessage.findMany({
      where: { userId: payload.userId },
      orderBy: { createdAt: 'desc' },
      take: 10,
    })

    // 3. System prompt
    const today = new Date().toLocaleDateString('uz-UZ', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      timeZone: 'Asia/Tashkent',
    })

    const systemPrompt = `Sen DocFlow elektron hujjat aylanish tizimining AI yordamchisisan.

Foydalanuvchi: ${payload.fullname || ''} (${payload.roleName || 'Xodim'})
Bugun: ${today}

QOIDALAR:
- O'zbek tilida tabiiy va korporativ uslubda javob ber
- Faqat berilgan tool'lardan foydalan, o'zingdan ma'lumot to'qima
- Hujjat raqamlarini formatda yoz: IB-2026-0005
- Agar foydalanuvchi "menga", "men", "o'zimning" desa — uning shaxsiy ma'lumotlari haqida
- Agar tool xato qaytarsa, uni foydalanuvchiga tushunarli tarzda ayt
- Sanalar bilan ishlaganda Asia/Tashkent vaqt mintaqasidan foydalan
- Agar fayl yoki PDF kerak bo'lsa, getDocumentPdf tool'idan foydalan
- Javoblar qisqa, aniq va foydali bo'lsin (markdown formatda)
- Hech qachon parol, token, maxfiy ma'lumotlarni ochma
- Agar so'rov DocFlow ga aloqasi bo'lmasa, "Men faqat DocFlow tizimi bo'yicha yordam bera olaman" deb javob ber`

    // History reverse va format
    const messages: GroqMessage[] = [
      { role: 'system', content: systemPrompt },
      ...history.reverse().map((m) => ({
        role: m.role as any,
        content: m.content,
        ...(m.toolCalls ? { tool_calls: m.toolCalls as any } : {}),
      })),
    ]

    // 4. Birinchi Groq chaqiruvi (tool call)
    const ctx: ToolContext = {
      userId: payload.userId,
      roleName: payload.roleName,
      departmentId: payload.departmentId,
    }

    let response = await this.groq.chat(messages, this.tools.getToolDefinitions())

    // 5. Tool call bo'lsa — bajarish
    let attachments: any[] = []
    let toolResultsLog: any[] = []

    if (response.tool_calls && response.tool_calls.length > 0) {
      messages.push({
        role: 'assistant',
        content: response.content || '',
        tool_calls: response.tool_calls,
      })

      for (const tc of response.tool_calls) {
        const args = JSON.parse(tc.function.arguments || '{}')
        const result = await this.tools.executeTool(tc.function.name, args, ctx)

        toolResultsLog.push({ name: tc.function.name, args, result })

        // Attachment'larni ajratish
        if (result?.isAttachment && result?.pdfUrl) {
          attachments.push({
            type: 'document',
            fileName: result.title + '.pdf',
            fileUrl: result.pdfUrl,
            documentNumber: result.documentNumber,
          })
        }

        messages.push({
          role: 'tool',
          tool_call_id: tc.id,
          name: tc.function.name,
          content: JSON.stringify(result),
        })
      }

      // 6. Ikkinchi Groq chaqiruvi — natijani matn formatda javob qilish
      response = await this.groq.chat(messages)
    }

    const assistantContent = response.content || 'Kechirasiz, javob bera olmadim.'

    // 7. Assistant xabarini saqlash
    const saved = await this.prisma.aiMessage.create({
      data: {
        userId: payload.userId,
        role: 'assistant',
        content: assistantContent,
        toolResults: toolResultsLog.length > 0 ? toolResultsLog : undefined,
        attachments: attachments.length > 0 ? attachments : undefined,
      },
    })

    return {
      id: saved.id,
      message: assistantContent,
      attachments,
      timestamp: saved.createdAt,
    }
  }

  async getHistory(userId: string, limit = 50) {
    const messages = await this.prisma.aiMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
      take: limit,
    })
    return messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      attachments: m.attachments,
      timestamp: m.createdAt,
    }))
  }

  async clearHistory(userId: string): Promise<{ deleted: number }> {
    const result = await this.prisma.aiMessage.deleteMany({ where: { userId } })
    return { deleted: result.count }
  }
}
