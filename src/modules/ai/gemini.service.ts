import { Injectable, Logger } from '@nestjs/common'
import { GroqMessage, GroqTool, GroqChatResponse, GroqToolCall } from './groq.service'

/** Gemini API content part */
interface GeminiPart {
  text?: string
  functionCall?: { name: string; args: Record<string, unknown> }
  functionResponse?: { name: string; response: Record<string, unknown> }
}

/** Gemini API content entry */
interface GeminiContent {
  role: 'user' | 'model'
  parts: GeminiPart[]
}

/** Gemini system instruction format */
interface GeminiSystemInstruction {
  parts: Array<{ text: string }>
}

/** Gemini API response shape */
interface GeminiApiResponse {
  candidates?: Array<{
    content?: {
      parts?: GeminiPart[]
    }
  }>
}

/** Gemini function declarations wrapper */
interface GeminiFunctionDeclarations {
  functionDeclarations: Array<{
    name: string
    description: string
    parameters: unknown
  }>
}

/** Gemini request body */
interface GeminiRequestBody {
  contents: GeminiContent[]
  generationConfig: { temperature: number; maxOutputTokens: number }
  systemInstruction?: GeminiSystemInstruction
  tools?: GeminiFunctionDeclarations[]
}

// Eng yuqori limitli modellar birinchi — fallback chain
// gemini-flash-lite-latest → 3.1 Flash Lite (500 RPD, 15 RPM)
// gemini-2.5-flash-lite   → 2.5 Flash Lite (20 RPD, 10 RPM)
// gemini-2.5-flash        → 2.5 Flash (20 RPD, 5 RPM)
const MODELS = [
  'gemini-flash-lite-latest',
  'gemini-2.5-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.0-flash',
]

const BASE = 'https://generativelanguage.googleapis.com/v1beta/models'

@Injectable()
export class GeminiService {
  private readonly logger = new Logger(GeminiService.name)
  private readonly apiKey = process.env.GEMINI_API_KEY || ''

  isConfigured(): boolean {
    return !!this.apiKey
  }

  async chat(messages: GroqMessage[], tools?: GroqTool[]): Promise<GroqChatResponse> {
    if (!this.apiKey) throw new Error('GEMINI_API_KEY .env da topilmadi')

    const { systemInstruction, contents } = this.convertMessages(messages)
    const geminiTools = tools?.length ? this.convertTools(tools) : undefined

    let lastErr: Error | null = null
    for (const model of MODELS) {
      try {
        return await this.callWithRetry(
          model,
          systemInstruction,
          contents,
          geminiTools,
        )
      } catch (err: unknown) {
        const e = err as Error & { status?: number }
        lastErr = e
        if (e?.status === 429 || e?.status === 503) {
          this.logger.warn(`${model} ${e.status}, fallback modelga o'tish...`)
          continue
        }
        if (e?.status === 404 || e?.status === 400) {
          // Model mavjud emas — keyingisini urinish
          this.logger.warn(
            `${model} mavjud emas yoki so'rov noto'g'ri: ${e.message}`,
          )
          continue
        }
        throw err
      }
    }
    throw lastErr || new Error('Barcha Gemini modellar ishlamadi')
  }

  private async callWithRetry(
    model: string,
    systemInstruction: GeminiSystemInstruction | null,
    contents: GeminiContent[],
    tools: GeminiFunctionDeclarations[] | undefined,
    maxRetries = 3,
  ): Promise<GroqChatResponse> {
    const body: GeminiRequestBody = {
      contents,
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    }
    if (systemInstruction) body.systemInstruction = systemInstruction
    if (tools) body.tools = tools

    let attempt = 0
    while (attempt < maxRetries) {
      attempt++
      const res = await fetch(
        `${BASE}/${model}:generateContent?key=${this.apiKey}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        },
      )

      if (res.ok) {
        const data = (await res.json()) as GeminiApiResponse
        return this.parseResponse(data)
      }

      const text = await res.text()

      if (res.status === 429) {
        const waitMs = Math.min(1000 * Math.pow(2, attempt), 8000)
        if (attempt < maxRetries) {
          this.logger.warn(
            `Gemini 429 (${model}), ${waitMs}ms kutish... (${attempt}/${maxRetries})`,
          )
          await new Promise((r) => setTimeout(r, waitMs))
          continue
        }
      }

      if (res.status >= 500 && attempt < maxRetries) {
        await new Promise((r) => setTimeout(r, 500 * attempt))
        continue
      }

      this.logger.error(
        `Gemini ${model} error ${res.status}: ${text.slice(0, 300)}`,
      )
      const err = Object.assign(new Error(`Gemini ${res.status}`), {
        status: res.status,
        body: text,
      })
      throw err
    }

    const err = Object.assign(new Error(`Gemini max retries (${model})`), {
      status: 429,
    })
    throw err
  }

  /**
   * OpenAI-style xabarlarni Gemini formatiga aylantirish
   */
  private convertMessages(messages: GroqMessage[]): {
    systemInstruction: GeminiSystemInstruction | null
    contents: GeminiContent[]
  } {
    let systemInstruction: GeminiSystemInstruction | null = null
    const contents: GeminiContent[] = []

    for (const m of messages) {
      if (m.role === 'system') {
        systemInstruction = { parts: [{ text: m.content || '' }] }
        continue
      }

      if (m.role === 'user') {
        contents.push({ role: 'user', parts: [{ text: m.content || '' }] })
        continue
      }

      if (m.role === 'assistant') {
        const parts: GeminiPart[] = []
        if (m.content) parts.push({ text: m.content })
        if (m.tool_calls?.length) {
          for (const tc of m.tool_calls) {
            let args: Record<string, unknown> = {}
            try {
              args =
                typeof tc.function?.arguments === 'string'
                  ? (JSON.parse(tc.function.arguments || '{}') as Record<string, unknown>)
                  : (tc.function?.arguments as unknown as Record<string, unknown>) || {}
            } catch {
              args = {}
            }
            parts.push({ functionCall: { name: tc.function?.name, args } })
          }
        }
        if (parts.length) contents.push({ role: 'model', parts })
        continue
      }

      if (m.role === 'tool') {
        let response: Record<string, unknown> = {}
        try {
          const parsed: unknown =
            typeof m.content === 'string'
              ? JSON.parse(m.content)
              : m.content || {}
          // Gemini tool javobi obyekt bo'lishi kerak
          if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) {
            response = { result: parsed }
          } else {
            response = parsed as Record<string, unknown>
          }
        } catch {
          response = { result: m.content }
        }
        contents.push({
          role: 'user',
          parts: [
            {
              functionResponse: {
                name: m.name || 'tool',
                response,
              },
            },
          ],
        })
        continue
      }
    }

    return { systemInstruction, contents }
  }

  /**
   * OpenAI tool definitions → Gemini functionDeclarations
   */
  private convertTools(tools: GroqTool[]): GeminiFunctionDeclarations[] {
    return [
      {
        functionDeclarations: tools.map((t) => ({
          name: t.function.name,
          description: t.function.description,
          parameters: this.cleanSchema(t.function.parameters),
        })),
      },
    ]
  }

  /** Gemini ba'zi OpenAPI field'larni qabul qilmaydi */
  private cleanSchema(schema: unknown): unknown {
    if (!schema || typeof schema !== 'object') return schema
    if (Array.isArray(schema)) return schema.map((s: unknown) => this.cleanSchema(s))
    const input = schema as Record<string, unknown>
    const out: Record<string, unknown> = {}
    for (const k of Object.keys(input)) {
      if (k === 'additionalProperties' || k === '$schema') continue
      out[k] = this.cleanSchema(input[k])
    }
    // Gemini bo'sh properties object'ni qabul qilmasligi mumkin
    if (
      out.type === 'object' &&
      (!out.properties || Object.keys(out.properties as Record<string, unknown>).length === 0)
    ) {
      delete out.properties
    }
    return out
  }

  /**
   * Gemini response → OpenAI-style { content, tool_calls }
   */
  private parseResponse(data: GeminiApiResponse): GroqChatResponse {
    const candidate = data?.candidates?.[0]
    if (!candidate) return { content: '' }

    const parts = candidate.content?.parts || []
    let content = ''
    const toolCalls: GroqToolCall[] = []

    for (let i = 0; i < parts.length; i++) {
      const p = parts[i]
      if (p.text) content += p.text
      if (p.functionCall) {
        toolCalls.push({
          id: `call_${Date.now()}_${i}`,
          type: 'function',
          function: {
            name: p.functionCall.name,
            arguments: JSON.stringify(p.functionCall.args || {}),
          },
        })
      }
    }

    return {
      content: content || null,
      ...(toolCalls.length ? { tool_calls: toolCalls } : {}),
    }
  }
}
