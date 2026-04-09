import { ApiClient, getClient } from '../helpers/api-client'

describe('Task API + KPI flow', () => {
  let api: ApiClient
  let projectId: string

  beforeAll(async () => {
    api = await getClient()
    const projects = await api.get('/project')
    projectId = projects.data.data[0]?.id
  })

  describe('GET /task', () => {
    it('list', async () => {
      const res = await api.get('/task')
      expect(res.status).toBe(200)
      expect(res.data.data).toBeDefined()
    })
  })

  describe('Task lifecycle', () => {
    let taskId: string

    it('CREATE task', async () => {
      const res = await api.post('/task', {
        title: 'E2E test task',
        projectId,
        priority: 'MEDIUM',
        score: 15,
      })
      expect([200, 201]).toContain(res.status)

      // Bug: backend ID qaytarmaydi, list orqali topamiz
      const list = await api.get('/task')
      const found = list.data.data.find(
        (t: any) => t.title === 'E2E test task',
      )
      expect(found).toBeDefined()
      taskId = found.id
    })

    it('GET task', async () => {
      const res = await api.get(`/task/${taskId}`)
      expect(res.status).toBe(200)
      expect(res.data.title).toBe('E2E test task')
      expect(res.data.score).toBe(15)
    })

    it('UPDATE task', async () => {
      const res = await api.patch(`/task/${taskId}`, {
        title: 'Updated task',
      })
      expect([200, 201]).toContain(res.status)
    })

    it('Add comment', async () => {
      const res = await api.post('/task-comment', {
        taskId,
        content: 'Test comment',
      })
      expect([200, 201]).toContain(res.status)
      expect(res.data.id).toBeTruthy()
    })

    it('Add checklist (title field)', async () => {
      const res = await api.post('/task-checklist', {
        taskId,
        title: 'Subtask 1',
      })
      expect([200, 201]).toContain(res.status)
    })

    it('Time entry (hours field, ISO date)', async () => {
      const res = await api.post('/task-time-entry', {
        taskId,
        hours: 0.5,
        date: '2026-04-09T10:00:00Z',
        description: 'worked',
      })
      expect([200, 201]).toContain(res.status)
    })

    it('Activity log mavjud', async () => {
      const res = await api.get('/task-activity', { taskId })
      expect(res.status).toBe(200)
      expect(res.data.data.length).toBeGreaterThanOrEqual(1)
    })

    it('Complete task → KPI ta\'siri', async () => {
      const res = await api.post(`/task/${taskId}/complete`)
      expect([200, 201]).toContain(res.status)
      expect(res.data.completedAt).toBeTruthy()
      expect(res.data.score).toBeDefined()
    })

    it('DELETE task (cleanup)', async () => {
      const res = await api.delete(`/task/${taskId}`)
      expect([200, 204]).toContain(res.status)
    })
  })

  describe('Validation', () => {
    it('Bo\'sh body → 400', async () => {
      const res = await api.post('/task', {})
      expect(res.status).toBe(400)
    })

    it('title juda qisqa → 400', async () => {
      const res = await api.post('/task', {
        title: 'a',
        projectId,
      })
      expect(res.status).toBe(400)
    })

    it("noto'g'ri projectId → 400 yoki 404", async () => {
      const res = await api.post('/task', {
        title: 'Test task',
        projectId: '00000000-0000-0000-0000-000000000000',
      })
      expect([400, 404]).toContain(res.status)
    })
  })
})
