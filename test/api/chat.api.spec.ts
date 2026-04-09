import { ApiClient, getClient } from '../helpers/api-client'

describe('Chat API', () => {
  let api: ApiClient
  let chatId: string
  let groupId: string
  let messageId: string

  beforeAll(async () => {
    api = await getClient()
    const list = await api.get('/chat')
    chatId = list.data.chats?.[0]?.id
  })

  describe('GET /chat', () => {
    it('chatlar ro\'yxati qaytaradi', async () => {
      const res = await api.get('/chat')
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('chats')
      expect(Array.isArray(res.data.chats)).toBe(true)
    })

    it('peer.isOnline va lastSeen mavjud', async () => {
      const res = await api.get('/chat')
      const direct = res.data.chats.find((c: any) => c.type === 'DIRECT')
      if (direct) {
        expect(direct.peer).toBeDefined()
        expect(direct.peer).toHaveProperty('isOnline')
        expect(direct.peer).toHaveProperty('lastSeen')
      }
    })
  })

  describe('POST /chat/group → Lifecycle', () => {
    let createdGroupId: string

    it('guruh yaratadi', async () => {
      const peerListRes = await api.get('/user', { pageSize: 5 })
      const peer = peerListRes.data.data.find((u: any) => u.id !== api.userId)

      const res = await api.post('/chat/group', {
        title: `Test group ${Date.now()}`,
        memberIds: [peer.id],
      })
      expect([200, 201]).toContain(res.status)
      expect(res.data.id).toBeTruthy()
      createdGroupId = res.data.id
      groupId = res.data.id
    })

    it('GET /chat/:id ishlaydi', async () => {
      const res = await api.get(`/chat/${createdGroupId}`)
      expect(res.status).toBe(200)
      expect(res.data.type).toBe('GROUP')
      expect(res.data.membersCount).toBeGreaterThanOrEqual(2)
    })

    it('PATCH /chat/:id', async () => {
      const res = await api.patch(`/chat/${createdGroupId}`, {
        title: 'Updated group',
      })
      expect(res.status).toBe(200)
      expect(res.data.title).toBe('Updated group')
    })

    it('PUBLIC qila oladi', async () => {
      const username = `testgroup${Date.now()}`
      const res = await api.post(`/chat/${createdGroupId}/visibility`, {
        visibility: 'PUBLIC',
        username,
      })
      expect([200, 201]).toContain(res.status)
      expect(res.data.visibility).toBe('PUBLIC')
      expect(res.data.username).toBe(username)
    })

    it('Public search topadi', async () => {
      const res = await api.get('/chat/public/search', { q: 'testgroup' })
      expect(res.status).toBe(200)
      expect(res.data.count).toBeGreaterThanOrEqual(1)
    })

    it('PRIVATE → invite code paydo bo\'ladi', async () => {
      const res = await api.post(`/chat/${createdGroupId}/visibility`, {
        visibility: 'PRIVATE',
      })
      expect([200, 201]).toContain(res.status)
      expect(res.data.visibility).toBe('PRIVATE')
      expect(res.data.inviteCode).toBeTruthy()
    })

    it('Group permissions update', async () => {
      const res = await api.post(`/chat/${createdGroupId}/permissions`, {
        allowMemberInvite: true,
        allowMemberSendMedia: true,
      })
      expect([200, 201]).toContain(res.status)
      expect(res.data.allowMemberInvite).toBe(true)
    })

    it('Mute / Unmute', async () => {
      const r1 = await api.post(`/chat/${createdGroupId}/mute`, {
        mutedUntil: '2026-12-31T00:00:00Z',
      })
      expect(r1.data.mutedUntil).toBeTruthy()

      const r2 = await api.post(`/chat/${createdGroupId}/mute`, { mutedUntil: null })
      expect(r2.data.mutedUntil).toBeNull()
    })

    it('Pin / Unpin', async () => {
      const r1 = await api.post(`/chat/${createdGroupId}/pin`, { pinned: true })
      expect(r1.data.isPinned).toBe(true)

      const r2 = await api.post(`/chat/${createdGroupId}/pin`, { pinned: false })
      expect(r2.data.isPinned).toBe(false)
    })

    it('Archive / Unarchive', async () => {
      const r1 = await api.post(`/chat/${createdGroupId}/archive`, { archived: true })
      expect(r1.data.isArchived).toBe(true)

      const r2 = await api.post(`/chat/${createdGroupId}/archive`, { archived: false })
      expect(r2.data.isArchived).toBe(false)
    })

    it('Send message + reactions + delete', async () => {
      const r = await api.post(`/chat/${createdGroupId}/messages`, {
        content: 'Test message ' + Date.now(),
      })
      expect(r.status).toBe(201)
      expect(r.data.id).toBeTruthy()
      const mid = r.data.id

      const reaction = await api.post(`/chat/messages/${mid}/reactions`, {
        emoji: 'thumb',
      })
      expect(reaction.data.success).toBe(true)

      const del = await api.delete(`/chat/messages/${mid}`)
      expect(del.data.success).toBe(true)
    })

    it('Group delete (cleanup)', async () => {
      const res = await api.delete(`/chat/${createdGroupId}`)
      expect(res.data.success).toBe(true)
    })
  })

  describe('Block / Unblock', () => {
    let peerId: string

    beforeAll(async () => {
      const users = await api.get('/user', { pageSize: 5 })
      peerId = users.data.data.find((u: any) => u.id !== api.userId).id
    })

    it('Block + List + Unblock', async () => {
      const r1 = await api.post(`/chat/block/${peerId}`)
      expect(r1.data.blocked).toBe(true)

      const list = await api.get('/chat/block/list')
      expect(list.data.count).toBeGreaterThanOrEqual(1)
      expect(list.data.users.some((u: any) => u.id === peerId)).toBe(true)

      const r2 = await api.delete(`/chat/block/${peerId}`)
      expect(r2.data.blocked).toBe(false)
    })
  })

  describe('Direct chat idempotent', () => {
    it('Bir xil userId bilan ikki marta yaratganda bir xil chat qaytaradi', async () => {
      const users = await api.get('/user', { pageSize: 5 })
      const peerId = users.data.data.find((u: any) => u.id !== api.userId).id

      const r1 = await api.post('/chat/direct', { userId: peerId })
      const r2 = await api.post('/chat/direct', { userId: peerId })
      expect(r1.data.id).toBe(r2.data.id)
      expect(r2.data.created).toBe(false)
    })

    it('O\'zi bilan chat → 400', async () => {
      const res = await api.post('/chat/direct', { userId: api.userId })
      expect(res.status).toBe(400)
    })
  })

  describe('Search messages', () => {
    it('search/messages 200 qaytaradi', async () => {
      const res = await api.get('/chat/search/messages', { q: 'test' })
      expect(res.status).toBe(200)
      expect(res.data).toHaveProperty('messages')
    })
  })

  describe('Settings', () => {
    it('Settings GET + PATCH', async () => {
      const r1 = await api.get('/chat/settings/me')
      expect(r1.status).toBe(200)
      expect(r1.data).toHaveProperty('allowCalls')

      const r2 = await api.patch('/chat/settings/me', { showOnlineStatus: false })
      expect(r2.data.showOnlineStatus).toBe(false)

      // Revert
      await api.patch('/chat/settings/me', { showOnlineStatus: true })
    })
  })

  describe('Calls', () => {
    let callId: string

    it('Initiate call', async () => {
      const peers = await api.get('/chat')
      const direct = peers.data.chats.find((c: any) => c.type === 'DIRECT')
      if (!direct) {
        console.warn('SKIP: direct chat yo\'q')
        return
      }
      const res = await api.post(`/chat/${direct.id}/call`, { type: 'AUDIO' })
      expect(res.status).toBe(201)
      expect(res.data.status).toBe('RINGING')
      expect(res.data.initiator).toBeTruthy()
      expect(res.data.initiator.fullname).toBeTruthy()
      callId = res.data.id
    })

    it('End call', async () => {
      if (!callId) return
      const res = await api.post(`/chat/calls/${callId}/end`)
      expect(res.data.action).toBe('end')
    })
  })
})
