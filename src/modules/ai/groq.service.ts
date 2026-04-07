import { Injectable, Logger } from '@nestjs/common'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const PRIMARY_MODEL = 'llama-3.3-70b-versatile'
const FALLBACK_MODELS = ['llama-3.1-8b-instant', 'llama3-70b-8192']

export interface GroqMessage {
  role: 'system' | 'user' | 'assistant' | 'tool'
  content: string | null
  tool_calls?: any[]
  tool_call_id?: string
  name?: string
}

export interface GroqTool {
  type: 'function'
  function: {
    name: string
    description: string
    parameters: {
      type: 'object'
      properties: Record<string, any>
      required?: string[]
    }
  }
}

@Injectable()
export class GroqService {
  private readonly logger = new Logger(GroqService.name)
  private readonly apiKey = process.env.GROQ_API_KEY || ''

  async chat(messages: GroqMessage[], tools?: GroqTool[]): Promise<any> {
    if (!this.apiKey) throw new Error('GROQ_API_KEY .env da topilmadi')

    const models = [PRIMARY_MODEL, ...FALLBACK_MODELS]
    let lastErr: any = null

    for (const model of models) {
      try {
        return await this.callWithRetry(model, messages, tools)
      } catch (err: any) {
        lastErr = err
        // 429 yoki rate-limit bo'lsa — keyingi modelga o'tish
        if (err?.status === 429 || /rate.?limit|429/i.test(err?.message || '')) {
          this.logger.warn(`${model} rate-limited, fallback modelga o'tish...`)
          continue
        }
        throw err
      }
    }
    throw lastErr || new Error('Barcha Groq modellar ishlamadi')
  }

  private async callWithRetry(
    model: string,
    messages: GroqMessage[],
    tools?: GroqTool[],
    maxRetries = 3,
  ): Promise<any> {
    const body: any = {
      model,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }
    if (tools?.length) {
      body.tools = tools
      body.tool_choice = 'auto'
    }

    let attempt = 0
    while (attempt < maxRetries) {
      attempt++
      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (res.ok) {
        const data = await res.json()
        return data.choices?.[0]?.message
      }

      const text = await res.text()

      // 429 — Retry-After ga amal qilish, keyin exponential backoff
      if (res.status === 429) {
        const retryAfterHeader = res.headers.get('retry-after')
        let waitMs = 0
        if (retryAfterHeader) {
          const parsed = parseFloat(retryAfterHeader)
          if (!isNaN(parsed)) waitMs = Math.ceil(parsed * 1000)
        }
        // Groq response body da ba'zida "try again in 2.5s" bor
        if (!waitMs) {
          const m = text.match(/try again in ([\d.]+)s/i)
          if (m) waitMs = Math.ceil(parseFloat(m[1]) * 1000)
        }
        if (!waitMs) waitMs = Math.min(1000 * Math.pow(2, attempt), 8000)

        if (attempt < maxRetries) {
          this.logger.warn(`Groq 429 (${model}), ${waitMs}ms kutish... (${attempt}/${maxRetries})`)
          await new Promise((r) => setTimeout(r, waitMs))
          continue
        }
        const err: any = new Error(`Groq rate limit (${model})`)
        err.status = 429
        err.body = text
        throw err
      }

      // 5xx — qisqa kutib qayta urinish
      if (res.status >= 500 && attempt < maxRetries) {
        const waitMs = 500 * attempt
        this.logger.warn(`Groq ${res.status}, ${waitMs}ms kutish...`)
        await new Promise((r) => setTimeout(r, waitMs))
        continue
      }

      this.logger.error(`Groq API error ${res.status}: ${text}`)
      const err: any = new Error(`Groq API xatosi: ${res.status}`)
      err.status = res.status
      err.body = text
      throw err
    }

    throw new Error('Groq: max retries tugadi')
  }
}
