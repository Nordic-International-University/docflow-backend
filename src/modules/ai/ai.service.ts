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
- Tool natijalari frontend'da CARDS sifatida avtomatik ko'rsatiladi
- Shuning uchun matnda ro'yxatni TO'LIQ takrorlama, qisqa xulosa ber
- Misol: "Sizda 3 ta yangi vazifa bor. Quyida ko'ring." (ro'yxatni qaytarma)
- Hujjat raqamlarini formatda yoz: IB-2026-0005
- Agar foydalanuvchi "menga", "men", "o'zimning" desa — uning shaxsiy ma'lumotlari haqida
- Agar tool xato qaytarsa, uni foydalanuvchiga tushunarli tarzda ayt
- Sanalar bilan ishlaganda Asia/Tashkent vaqt mintaqasidan foydalan
- Javoblar QISQA bo'lsin (1-3 jumla), chunki cards alohida ko'rsatiladi
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
    let cards: any[] = []
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

        // Tool natijasini structured cards'ga aylantirish
        const builtCards = this.buildCardsFromTool(tc.function.name, result)
        cards.push(...builtCards)

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
        attachments: cards.length > 0 ? cards : undefined,
      },
    })

    return {
      id: saved.id,
      message: assistantContent,
      cards,
      timestamp: saved.createdAt,
    }
  }

  /**
   * Tool natijasidan frontend uchun structured cards yaratish
   */
  private buildCardsFromTool(toolName: string, result: any): any[] {
    if (!result || result.error) return []

    const cards: any[] = []

    switch (toolName) {
      case 'getMyTasks': {
        if (result.tasks?.length) {
          for (const t of result.tasks) {
            cards.push({
              type: 'task',
              id: t.ref,
              title: t.title,
              subtitle: t.project,
              meta: {
                ref: t.ref,
                priority: t.priority,
                score: t.score,
                dueDate: t.dueDate,
                completed: t.completed,
                createdBy: t.createdBy,
              },
              actions: [
                { label: 'Ochish', url: t.url },
              ],
            })
          }
        }
        break
      }

      case 'getMyWorkflows': {
        if (result.workflows?.length) {
          for (const w of result.workflows) {
            cards.push({
              type: 'workflow',
              id: w.id,
              title: w.document?.title || 'Workflow',
              subtitle: w.document?.documentNumber,
              meta: {
                type: w.type,
                status: w.status,
                currentStep: w.currentStep,
                totalSteps: w.totalSteps,
                deadline: w.deadline,
              },
              actions: [
                { label: 'Ish jarayonini ochish', url: w.url },
              ],
            })
          }
        }
        break
      }

      case 'getDocumentByNumber': {
        if (result.id) {
          cards.push({
            type: 'document',
            id: result.id,
            title: result.title,
            subtitle: result.documentNumber,
            meta: {
              status: result.status,
              type: result.documentType?.name,
              createdBy: result.createdBy?.fullname,
              createdAt: result.createdAt,
              pdfUrl: result.pdfUrl,
            },
            actions: [
              { label: 'Hujjatni ochish', url: result.url },
              ...(result.pdfUrl ? [{ label: 'PDF', url: result.pdfUrl, external: true }] : []),
            ],
          })
        }
        break
      }

      case 'getDocumentsByType':
      case 'searchDocuments': {
        if (result.documents?.length) {
          for (const d of result.documents) {
            cards.push({
              type: 'document',
              id: d.id,
              title: d.title,
              subtitle: d.documentNumber,
              meta: {
                status: d.status,
                type: d.documentType?.name,
                createdBy: d.createdBy?.fullname,
              },
              actions: [
                { label: 'Ochish', url: d.url },
              ],
            })
          }
        }
        break
      }

      case 'getDocumentPdf': {
        if (result.pdfUrl) {
          cards.push({
            type: 'pdf',
            id: result.documentNumber,
            title: result.title,
            subtitle: result.documentNumber,
            meta: {
              fileUrl: result.pdfUrl,
              fileName: `${result.documentNumber}.pdf`,
            },
            actions: [
              { label: 'PDF yuklab olish', url: result.pdfUrl, external: true },
              { label: 'Hujjatga o\'tish', url: result.url },
            ],
          })
        }
        break
      }

      case 'getMyKpi': {
        if (result.finalScore !== undefined) {
          cards.push({
            type: 'kpi',
            id: `kpi-${result.year}-${result.month}`,
            title: `${result.month}/${result.year} oy KPI`,
            subtitle: `${result.finalScore}/100 ball`,
            meta: {
              finalScore: result.finalScore,
              tasksCompleted: result.tasksCompleted,
              tasksOnTime: result.tasksOnTime,
              tasksLate: result.tasksLate,
              isFullScore: result.isFullScore,
            },
            actions: [
              { label: 'Batafsil', url: '/dashboard/kpi' },
            ],
          })
        }
        break
      }

      case 'getMyNotifications': {
        if (result.notifications?.length) {
          for (const n of result.notifications) {
            cards.push({
              type: 'notification',
              id: n.id,
              title: n.title,
              subtitle: n.type,
              meta: {
                message: n.message,
                createdAt: n.createdAt,
              },
            })
          }
        }
        break
      }

      case 'getMyProjects': {
        if (result.projects?.length) {
          for (const p of result.projects) {
            cards.push({
              type: 'project',
              id: p.id,
              title: p.name,
              subtitle: p.key,
              meta: {
                status: p.status,
                tasksCount: p.tasksCount,
                membersCount: p.membersCount,
              },
              actions: [
                { label: 'Loyihani ochish', url: p.url },
              ],
            })
          }
        }
        break
      }

      case 'getDepartmentStats': {
        if (result.department) {
          cards.push({
            type: 'stats',
            id: 'dept-stats',
            title: result.department,
            subtitle: "Bo'lim statistikasi",
            meta: {
              totalUsers: result.totalUsers,
              activeTasks: result.activeTasks,
              completedTasks: result.completedTasks,
            },
          })
        }
        break
      }
    }

    return cards
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
      cards: m.attachments || [],
      timestamp: m.createdAt,
    }))
  }

  async clearHistory(userId: string): Promise<{ deleted: number }> {
    const result = await this.prisma.aiMessage.deleteMany({ where: { userId } })
    return { deleted: result.count }
  }
}
