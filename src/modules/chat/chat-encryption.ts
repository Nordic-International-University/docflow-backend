import { Injectable, Logger } from '@nestjs/common'
import * as crypto from 'crypto'

/**
 * Server-side xabar tarkibini shifrlash (at-rest).
 * AES-256-GCM. Kalit .env dagi CHAT_ENCRYPTION_KEY (32 bytes hex yoki base64) dan olinadi.
 * Transport darajasida allaqachon TLS (HTTPS/WSS) bor.
 *
 * Eslatma: True E2E (client-side keys) alohida feature — bu faqat DB at-rest himoya.
 */
@Injectable()
export class ChatEncryptionService {
  private readonly logger = new Logger(ChatEncryptionService.name)
  private readonly key: Buffer
  private readonly enabled: boolean

  constructor() {
    const raw = process.env.CHAT_ENCRYPTION_KEY || ''
    if (!raw) {
      this.enabled = false
      this.key = Buffer.alloc(0)
      this.logger.warn('CHAT_ENCRYPTION_KEY belgilanmagan — chat xabarlari shifrlanmaydi')
      return
    }
    try {
      // Hex yoki base64 — 32 byte bo'lishi kerak
      let buf = Buffer.from(raw, 'hex')
      if (buf.length !== 32) buf = Buffer.from(raw, 'base64')
      if (buf.length !== 32) {
        throw new Error('CHAT_ENCRYPTION_KEY 32 byte (hex yoki base64) bo\'lishi kerak')
      }
      this.key = buf
      this.enabled = true
    } catch (err: any) {
      this.logger.error(`Encryption key xato: ${err.message}`)
      this.enabled = false
      this.key = Buffer.alloc(0)
    }
  }

  /**
   * Matnni shifrlash — natija: enc:v1:<iv_base64>:<ciphertext_base64>:<tag_base64>
   */
  encrypt(plain: string | null | undefined): string | null {
    if (plain == null) return null
    if (!this.enabled) return plain
    try {
      const iv = crypto.randomBytes(12)
      const cipher = crypto.createCipheriv('aes-256-gcm', this.key, iv)
      const enc = Buffer.concat([cipher.update(plain, 'utf8'), cipher.final()])
      const tag = cipher.getAuthTag()
      return `enc:v1:${iv.toString('base64')}:${enc.toString('base64')}:${tag.toString('base64')}`
    } catch (err: any) {
      this.logger.error(`Encrypt failed: ${err.message}`)
      return plain
    }
  }

  decrypt(cipherText: string | null | undefined): string | null {
    if (cipherText == null) return null
    if (typeof cipherText !== 'string' || !cipherText.startsWith('enc:v1:')) {
      return cipherText as any
    }
    if (!this.enabled) return cipherText
    try {
      const [, , ivB64, ctB64, tagB64] = cipherText.split(':')
      const iv = Buffer.from(ivB64, 'base64')
      const ct = Buffer.from(ctB64, 'base64')
      const tag = Buffer.from(tagB64, 'base64')
      const decipher = crypto.createDecipheriv('aes-256-gcm', this.key, iv)
      decipher.setAuthTag(tag)
      const dec = Buffer.concat([decipher.update(ct), decipher.final()])
      return dec.toString('utf8')
    } catch (err: any) {
      this.logger.error(`Decrypt failed: ${err.message}`)
      return '[shifrlangan xabar]'
    }
  }
}
