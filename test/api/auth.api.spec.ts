import { ApiClient } from '../helpers/api-client'

describe('Auth API', () => {
  let api: ApiClient

  beforeEach(() => {
    api = new ApiClient()
  })

  describe('POST /auth/login', () => {
    it('to\'g\'ri credentials bilan token qaytaradi', async () => {
      const res = await api.request('POST', '/auth/login', {
        body: { username: 'superadmin', password: '12345678' },
        auth: false,
      })
      expect(res.status).toBe(200)
      expect(res.data.accessToken).toBeTruthy()
      expect(res.data.refreshToken).toBeTruthy()
      expect(res.data.user).toBeTruthy()
      expect(res.data.user.username).toBe('superadmin')
      expect(res.data.sessionId).toBeTruthy()
    })

    it("noto'g'ri parol → 401", async () => {
      const res = await api.request('POST', '/auth/login', {
        body: { username: 'superadmin', password: 'wrong-password' },
        auth: false,
      })
      expect(res.status).toBe(401)
      expect(res.data.message).toMatch(/parol|noto'g'ri/i)
    })

    it('mavjud bo\'lmagan user → 401', async () => {
      const res = await api.request('POST', '/auth/login', {
        body: { username: 'nonexistent_user_xyz', password: '12345678' },
        auth: false,
      })
      expect(res.status).toBe(401)
    })

    it("password yo'q → 400 + validation", async () => {
      const res = await api.request('POST', '/auth/login', {
        body: { username: 'superadmin' },
        auth: false,
      })
      expect(res.status).toBe(400)
      expect(Array.isArray(res.data.message)).toBe(true)
    })

    it("username bo'sh → 400", async () => {
      const res = await api.request('POST', '/auth/login', {
        body: { username: '', password: '12345678' },
        auth: false,
      })
      expect(res.status).toBe(400)
    })

    it("body bo'sh → 400", async () => {
      const res = await api.request('POST', '/auth/login', {
        body: {},
        auth: false,
      })
      expect(res.status).toBe(400)
    })
  })

  describe('Token uses', () => {
    beforeAll(async () => {
      await api.login()
    })

    it('valid token bilan protected endpoint ishlaydi', async () => {
      const res = await api.get('/user')
      expect(res.status).toBe(200)
    })

    it('token yo\'q → 401', async () => {
      const fresh = new ApiClient()
      const res = await fresh.request('GET', '/user', { auth: false })
      expect([401, 404]).toContain(res.status)
    })

    it('noto\'g\'ri token → 401', async () => {
      api.token = 'fake-token-12345'
      const res = await api.get('/user')
      expect(res.status).toBe(401)
    })

    it('eskirgan token formati → 401', async () => {
      api.token = 'eyJhbGciOiJIUzI1NiJ9.invalid.token'
      const res = await api.get('/user')
      expect(res.status).toBe(401)
    })
  })

  describe('POST /auth/refresh-token', () => {
    it('valid refresh token bilan yangi access token oladi', async () => {
      const loginRes = await api.request('POST', '/auth/login', {
        body: { username: 'superadmin', password: '12345678' },
        auth: false,
      })
      const refreshToken = loginRes.data.refreshToken

      const res = await api.request('POST', '/auth/refresh-token', {
        body: { refreshToken },
        auth: false,
      })
      expect(res.status).toBe(200)
      expect(res.data.accessToken).toBeTruthy()
    })

    it("noto'g'ri refresh token → 401", async () => {
      const res = await api.request('POST', '/auth/refresh-token', {
        body: { refreshToken: 'invalid' },
        auth: false,
      })
      expect([400, 401]).toContain(res.status)
    })
  })
})
