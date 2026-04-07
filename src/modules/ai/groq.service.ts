import { Injectable, Logger } from '@nestjs/common'

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions'
const MODEL = 'llama-3.3-70b-versatile'

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
    if (!this.apiKey) {
      throw new Error('GROQ_API_KEY .env da topilmadi')
    }

    const body: any = {
      model: MODEL,
      messages,
      temperature: 0.3,
      max_tokens: 2048,
    }

    if (tools && tools.length > 0) {
      body.tools = tools
      body.tool_choice = 'auto'
    }

    try {
      const res = await fetch(GROQ_API, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(body),
      })

      if (!res.ok) {
        const text = await res.text()
        this.logger.error(`Groq API error ${res.status}: ${text}`)
        throw new Error(`Groq API xatosi: ${res.status}`)
      }

      const data = await res.json()
      return data.choices?.[0]?.message
    } catch (err: any) {
      this.logger.error(`Groq request failed: ${err.message}`)
      throw err
    }
  }
}
