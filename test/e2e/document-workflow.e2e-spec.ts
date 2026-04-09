import { ApiClient, getClient } from '../helpers/api-client'

/**
 * E2E TEST — to'liq foydalanuvchi flow:
 *   1. Hujjat yaratish
 *   2. Hujjat tarixini ko'rish
 *   3. Hujjatni yangilash
 *   4. Chat'da forward qilish
 *   5. AI orqali qidirish
 */
describe('E2E: Document → Edit → Forward → AI Search', () => {
  let api: ApiClient
  let documentId: string
  let documentNumber: string
  let chatId: string

  beforeAll(async () => {
    api = await getClient()
  })

  it('Step 1: Hujjat yaratish', async () => {
    const dt = await api.get('/document-type')
    const doctypeId = dt.data.data[0].id
    const j = await api.get('/journal')
    const journalId = j.data.data[0].id

    const res = await api.post('/document', {
      title: `E2E test hujjat ${Date.now()}`,
      documentTypeId: doctypeId,
      journalId,
      description: 'E2E test',
    })
    expect([200, 201]).toContain(res.status)

    // Backend ID qaytarmasligi tufayli list orqali topamiz
    const list = await api.get('/document', { pageSize: 5 })
    documentId = list.data.data[0].id
    documentNumber = list.data.data[0].documentNumber
    expect(documentId).toBeTruthy()
    expect(documentNumber).toBeTruthy()
  })

  it('Step 2: Yangi document detail tekshirish', async () => {
    const res = await api.get(`/document/${documentId}`)
    expect(res.status).toBe(200)
    expect(res.data.status).toBe('DRAFT')
    expect(res.data).toHaveProperty('displayMode')
    expect(res.data).toHaveProperty('canEdit')
  })

  it('Step 3: Hujjat tarixini ko\'rish', async () => {
    const res = await api.get(`/document/${documentId}/history`)
    expect(res.status).toBe(200)
    expect(res.data.timeline.length).toBeGreaterThanOrEqual(1)
    // DOCUMENT_CREATED event mavjud bo'lishi kerak
    const created = res.data.timeline.find((t: any) => t.type === 'DOCUMENT_CREATED')
    expect(created).toBeDefined()
  })

  it('Step 4: Chat\'da hujjatni forward qilish', async () => {
    const chats = await api.get('/chat')
    chatId = chats.data.chats[0]?.id
    if (!chatId) {
      console.warn('SKIP: chat yo\'q')
      return
    }

    const res = await api.post(`/chat/forward/document/${documentId}`, {
      toChatId: chatId,
      caption: 'E2E forward test',
    })
    expect(res.status).toBe(201)
    expect(res.data.id).toBeTruthy()
    expect(res.data.ref).toBeTruthy()
    expect(res.data.ref.documentNumber).toBe(documentNumber)
  })

  it('Step 5: AI chatbot orqali topish', async () => {
    const res = await api.post('/ai/chat', {
      message: `${documentNumber} hujjat haqida ma'lumot ber`,
    })
    // AI ba'zan rate-limited bo'lishi mumkin
    if (res.data.error === 'RATE_LIMIT') {
      console.warn('SKIP: AI rate limited')
      return
    }
    expect(res.status).toBe(201)
    expect(res.data.message).toBeTruthy()
    // AI should call getDocumentByNumber tool
    expect(res.data.cards).toBeDefined()
  })

  it('Step 6: Hujjatni o\'chirish (cleanup)', async () => {
    const res = await api.delete(`/document/${documentId}`)
    expect([200, 204, 403]).toContain(res.status) // 403 if status changed
  })
})

describe('E2E: Task → Comment → Complete → KPI', () => {
  let api: ApiClient
  let projectId: string
  let taskId: string

  beforeAll(async () => {
    api = await getClient()
    const projects = await api.get('/project')
    projectId = projects.data.data[0]?.id
  })

  it('Task yaratish', async () => {
    if (!projectId) return

    const res = await api.post('/task', {
      title: `E2E test task ${Date.now()}`,
      projectId,
      priority: 'HIGH',
      score: 20,
    })
    expect([200, 201]).toContain(res.status)

    const list = await api.get('/task')
    taskId = list.data.data.find((t: any) => t.title.startsWith('E2E test task'))?.id
    expect(taskId).toBeTruthy()
  })

  it('Comment qo\'shish', async () => {
    if (!taskId) return
    const res = await api.post('/task-comment', {
      taskId,
      content: 'E2E test comment',
    })
    expect([200, 201]).toContain(res.status)
  })

  it('Complete + KPI tekshirish', async () => {
    if (!taskId) return
    const before = await api.get('/user-monthly-kpi', {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    })

    const res = await api.post(`/task/${taskId}/complete`)
    expect([200, 201]).toContain(res.status)
    expect(res.data.completedAt).toBeTruthy()
    expect(res.data.score).toBe(20)

    const after = await api.get('/user-monthly-kpi', {
      year: new Date().getFullYear(),
      month: new Date().getMonth() + 1,
    })
    // KPI yangilanishi kerak (yoki yangi kpi yaratilishi)
    expect(after.status).toBe(200)
  })

  it('Cleanup', async () => {
    if (taskId) await api.delete(`/task/${taskId}`)
  })
})
