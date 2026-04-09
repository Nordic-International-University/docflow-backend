import { ApiClient, getClient } from '../helpers/api-client'

/**
 * SMOKE TEST — eng asosiy endpointlar 200 qaytaradimi.
 * Tezkor (~10 soniya), har deploy'dan keyin run qilinadi.
 */
describe('Smoke: All major endpoints respond', () => {
  let api: ApiClient

  beforeAll(async () => {
    api = await getClient()
  })

  describe('Auth', () => {
    it('login bilan token oladi', () => {
      expect(api.token).toBeTruthy()
      expect(api.userId).toBeTruthy()
    })

    it("noto'g'ri parol → 401", async () => {
      const fresh = new ApiClient()
      const res = await fresh.request('POST', '/auth/login', {
        body: { username: 'superadmin', password: 'wrong' },
        auth: false,
      })
      expect(res.status).toBe(401)
    })
  })

  describe('GET endpoints (200)', () => {
    const endpoints = [
      '/user',
      '/role',
      '/permission',
      '/department',
      '/document-type',
      '/journal',
      '/document',
      '/document-template',
      '/workflow',
      '/workflow-template',
      '/workflow-step',
      '/project',
      '/task',
      '/task-category',
      '/task-label',
      '/attachment',
      '/audit-log',
      '/notifications',
      '/notifications/unread-count',
      '/notifications/online-users',
      '/analytics/dashboard',
      '/user-monthly-kpi',
      '/kpi-reward-tier',
      '/kpi-reward',
      '/task-score-config',
      '/chat',
      '/chat/settings/me',
      '/ai/history',
    ]

    test.each(endpoints)('GET %s → 200', async (path) => {
      const res = await api.get(path)
      expect(res.status).toBe(200)
    })
  })

  describe('Validation', () => {
    it("noto'g'ri UUID → 400", async () => {
      const res = await api.get('/document/not-a-uuid')
      expect(res.status).toBe(400)
    })

    it("mavjud bo'lmagan UUID → 404", async () => {
      const res = await api.get('/document/00000000-0000-0000-0000-000000000000')
      expect(res.status).toBe(404)
    })

    it('auth yo\'q → 401 yoki 404', async () => {
      const fresh = new ApiClient()
      const res = await fresh.request('GET', '/document', { auth: false })
      expect([401, 404]).toContain(res.status)
    })
  })
})
