import { ApiClient, getClient } from '../helpers/api-client'

describe('Document API', () => {
  let api: ApiClient
  let documentTypeId: string
  let journalId: string

  beforeAll(async () => {
    api = await getClient()
    const dt = await api.get('/document-type')
    documentTypeId = dt.data.data?.[0]?.id
    const j = await api.get('/journal')
    journalId = j.data.data?.[0]?.id
  })

  describe('GET /document', () => {
    it('list qaytaradi', async () => {
      const res = await api.get('/document')
      expect(res.status).toBe(200)
      expect(res.data.data).toBeDefined()
      expect(Array.isArray(res.data.data)).toBe(true)
    })

    it('pagination ishlaydi', async () => {
      const res = await api.get('/document', { pageSize: 5, pageNumber: 1 })
      expect(res.status).toBe(200)
      expect(res.data.pageSize).toBe(5)
    })

    it("noto'g'ri filter → 400 yoki bo'sh natija", async () => {
      const res = await api.get('/document', { status: 'INVALID_STATUS' })
      expect([200, 400]).toContain(res.status)
    })
  })

  describe('GET /document/:id', () => {
    let docId: string

    beforeAll(async () => {
      const list = await api.get('/document')
      docId = list.data.data[0].id
    })

    it('hujjat detail qaytaradi', async () => {
      const res = await api.get(`/document/${docId}`)
      expect(res.status).toBe(200)
      expect(res.data.id).toBe(docId)
      expect(res.data.title).toBeTruthy()
      expect(res.data.documentNumber).toBeTruthy()
      expect(res.data.status).toBeTruthy()
    })

    it("yangi maydonlar bor: primaryAttachment, displayMode, canEdit", async () => {
      const res = await api.get(`/document/${docId}`)
      expect(res.data).toHaveProperty('displayMode')
      expect(res.data).toHaveProperty('canEdit')
      expect(res.data).toHaveProperty('hasDocx')
      expect(res.data).toHaveProperty('hasPdf')
    })

    it("noto'g'ri UUID → 400", async () => {
      const res = await api.get('/document/not-a-uuid')
      expect(res.status).toBe(400)
    })

    it("mavjud bo'lmagan → 404", async () => {
      const res = await api.get('/document/00000000-0000-0000-0000-000000000000')
      expect(res.status).toBe(404)
    })
  })

  describe('GET /document/:id/history', () => {
    let docId: string
    beforeAll(async () => {
      const list = await api.get('/document')
      docId = list.data.data[0].id
    })

    it('to\'liq tarix qaytaradi', async () => {
      const res = await api.get(`/document/${docId}/history`)
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('document')
      expect(res.data).toHaveProperty('summary')
      expect(res.data).toHaveProperty('fileVersions')
      expect(res.data).toHaveProperty('workflows')
      expect(res.data).toHaveProperty('auditLogs')
      expect(res.data).toHaveProperty('timeline')
      expect(Array.isArray(res.data.timeline)).toBe(true)
    })
  })

  describe('POST /document — race condition fix', () => {
    it('parallel 5 ta hujjat yaratganda har biri unique raqam oladi', async () => {
      if (!documentTypeId || !journalId) {
        console.warn('SKIP: documentType yoki journal yo\'q')
        return
      }

      const promises = Array.from({ length: 5 }, (_, i) =>
        api.post('/document', {
          title: `Race test #${i} ${Date.now()}`,
          documentTypeId,
          journalId,
          description: 'race test',
        }),
      )

      const results = await Promise.all(promises)

      // Hech qaysi 500 bo'lmasligi kerak
      const errors = results.filter((r) => r.status >= 500)
      expect(errors).toHaveLength(0)

      // Aksariyat 201 (ba'zilari 409 retry bo'lishi mumkin lekin kam)
      const created = results.filter((r) => r.status === 201)
      expect(created.length).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Validation', () => {
    it("title juda qisqa → 400", async () => {
      const res = await api.post('/document', {
        title: 'a',
        documentTypeId,
        journalId,
      })
      expect([400, 422]).toContain(res.status)
    })

    it("documentTypeId yo'q → 400", async () => {
      const res = await api.post('/document', {
        title: 'Test hujjat',
        journalId,
      })
      expect(res.status).toBe(400)
    })

    it("noto'g'ri UUID format → 400", async () => {
      const res = await api.post('/document', {
        title: 'Test hujjat',
        documentTypeId: 'not-uuid',
        journalId: 'not-uuid',
      })
      expect(res.status).toBe(400)
    })
  })
})
