/**
 * Test API client — har test'da qayta-qayta ishlatiladi
 */

const BASE_URL = process.env.TEST_API_URL || 'https://api.docverse.uz/api/v1'
const USERNAME = process.env.TEST_USERNAME || 'superadmin'
const PASSWORD = process.env.TEST_PASSWORD || '12345678'

export interface ApiResponse<T = any> {
  status: number
  data: T
  ok: boolean
}

export class ApiClient {
  public token: string | null = null
  public userId: string | null = null
  public role: string | null = null

  constructor(public readonly baseUrl: string = BASE_URL) {}

  async login(username = USERNAME, password = PASSWORD): Promise<void> {
    const res = await this.request<any>('POST', '/auth/login', {
      body: { username, password },
      auth: false,
    })
    if (!res.ok) {
      throw new Error(`Login failed: ${JSON.stringify(res.data)}`)
    }
    this.token = res.data.accessToken
    this.userId = res.data.user?.id
    this.role = res.data.user?.role
  }

  async request<T = any>(
    method: string,
    path: string,
    options: {
      body?: any
      query?: Record<string, any>
      auth?: boolean
      formData?: FormData
    } = {},
  ): Promise<ApiResponse<T>> {
    const { body, query, auth = true, formData } = options

    let url = `${this.baseUrl}${path}`
    if (query) {
      const params = new URLSearchParams()
      for (const [k, v] of Object.entries(query)) {
        if (v !== undefined && v !== null) params.append(k, String(v))
      }
      const qs = params.toString()
      if (qs) url += `?${qs}`
    }

    const headers: Record<string, string> = {}
    if (auth && this.token) {
      headers['Authorization'] = `Bearer ${this.token}`
    }
    if (body && !formData) {
      headers['Content-Type'] = 'application/json'
    }

    const res = await fetch(url, {
      method,
      headers,
      body: formData ? (formData as any) : body ? JSON.stringify(body) : undefined,
    })

    let data: any
    const contentType = res.headers.get('content-type') || ''
    if (contentType.includes('application/json')) {
      data = await res.json()
    } else {
      data = await res.text()
    }

    return {
      status: res.status,
      data,
      ok: res.ok,
    }
  }

  // Convenience methods
  get<T = any>(path: string, query?: Record<string, any>) {
    return this.request<T>('GET', path, { query })
  }
  post<T = any>(path: string, body?: any) {
    return this.request<T>('POST', path, { body })
  }
  patch<T = any>(path: string, body?: any) {
    return this.request<T>('PATCH', path, { body })
  }
  delete<T = any>(path: string) {
    return this.request<T>('DELETE', path)
  }
}

/** Bitta global client — testlar orasida qayta ishlatiladi */
let _client: ApiClient | null = null
export async function getClient(): Promise<ApiClient> {
  if (_client && _client.token) return _client
  _client = new ApiClient()
  await _client.login()
  return _client
}

/** Test ID generator (cleanup uchun) */
export function testId(prefix = 'test'): string {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
