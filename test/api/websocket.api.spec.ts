import { io, Socket } from 'socket.io-client'
import { ApiClient, getClient } from '../helpers/api-client'

const WS_URL = (process.env.TEST_API_URL || 'https://api.docverse.uz/api/v1')
  .replace('/api/v1', '/chat')

describe('Chat WebSocket', () => {
  let api: ApiClient
  let socket: Socket
  let chatId: string

  beforeAll(async () => {
    api = await getClient()
    const list = await api.get('/chat')
    chatId = list.data.chats[0]?.id

    socket = io(WS_URL, {
      auth: { token: api.token },
      transports: ['websocket'],
      forceNew: true,
    })

    await new Promise<void>((resolve, reject) => {
      const t = setTimeout(() => reject(new Error('connect timeout')), 5000)
      socket.once('connect', () => {
        clearTimeout(t)
        resolve()
      })
      socket.once('connect_error', (err) => {
        clearTimeout(t)
        reject(err)
      })
    })
  })

  afterAll(() => {
    socket?.disconnect()
  })

  it('connect bo\'ldi', () => {
    expect(socket.connected).toBe(true)
  })

  it('chat:join — a\'zo bo\'lgan chatga qo\'shilish', async () => {
    if (!chatId) return
    const ack = await new Promise<any>((resolve) => {
      socket.emit('chat:join', { chatId }, resolve)
    })
    expect(ack.ok).toBe(true)
  })

  it('chat:join — a\'zo bo\'lmagan chatga 403', async () => {
    const ack = await new Promise<any>((resolve) => {
      socket.emit(
        'chat:join',
        { chatId: '00000000-0000-0000-0000-000000000000' },
        resolve,
      )
    })
    expect(ack.ok).toBe(false)
  })

  it('chat:typing — emit qabul qilinadi', async () => {
    if (!chatId) return
    // Faqat sender o'zini chiqarib tashlaganligini sinaymiz
    let received = false
    socket.once('chat:typing', () => {
      received = true
    })
    socket.emit('chat:typing', { chatId, isTyping: true, action: 'typing' })
    await new Promise((r) => setTimeout(r, 500))
    // Sender o'ziga qaytmaydi
    expect(received).toBe(false)
  })

  it('message:new — REST orqali yuborilgan xabar WS bilan keladi', async () => {
    if (!chatId) return
    let receivedMessage: any = null
    socket.once('message:new', (msg: any) => {
      receivedMessage = msg
    })
    // Wait small time for join
    await new Promise((r) => setTimeout(r, 200))

    // REST orqali xabar yuborish
    const res = await api.post(`/chat/${chatId}/messages`, {
      content: `WS test ${Date.now()}`,
    })
    expect(res.status).toBe(201)

    // Wait for WS event
    await new Promise((r) => setTimeout(r, 1000))
    expect(receivedMessage).toBeTruthy()
    expect(receivedMessage.id).toBe(res.data.id)
  })

  it('disconnect ishlaydi', () => {
    socket.disconnect()
    expect(socket.connected).toBe(false)
  })
})
