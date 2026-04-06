import { Injectable, Logger, OnModuleInit } from '@nestjs/common'
import * as Minio from 'minio'

@Injectable()
export class MinioService implements OnModuleInit {
  private readonly logger = new Logger(MinioService.name)
  private minioClient: Minio.Client
  private readonly bucketName: string

  constructor() {
    this.bucketName = 'docflow-files'

    this.minioClient = new Minio.Client({
      endPoint: 'cdn.nordicuniversity.org',
      useSSL: true,
      accessKey: 'VkZ8kGPGVAILcURlwI62',
      secretKey: 'rzxgnz300PDlJZKEyqM8mKqOWlJtZ9bmogp2qc6X',
    })
  }

  async onModuleInit() {
    await this.ensureBucketExists()
  }

  private async ensureBucketExists(): Promise<void> {
    try {
      const exists = await this.minioClient.bucketExists(this.bucketName)
      if (!exists) {
        await this.minioClient.makeBucket(this.bucketName)
        this.logger.log(`Bucket ${this.bucketName} created successfully`)
      }
    } catch (error) {
      this.logger.error(`Error ensuring bucket exists: ${error.message}`)
      throw error
    }
  }

  async uploadFile(
    file: Express.Multer.File,
    folder: string = '',
  ): Promise<string> {
    const fileName = this.generateFileName(file.originalname, folder)
    const metaData = {
      'Content-Type': file.mimetype,
    }

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        file.buffer,
        file.size,
        metaData,
      )
      this.logger.log(`File uploaded successfully: ${fileName}`)
      return fileName
    } catch (error) {
      this.logger.error(`Error uploading file: ${error.message}`)
      throw error
    }
  }

  private generateFileName(originalName: string, folder: string = ''): string {
    const sanitized = this.sanitizeFileName(originalName)

    const timestamp = Date.now()
    const randomStr = Math.random().toString(36).substring(2, 8)

    const finalName = `${timestamp}-${randomStr}-${sanitized}`

    if (folder) {
      const normalizedFolder = folder.endsWith('/') ? folder : `${folder}/`
      return `${normalizedFolder}${finalName}`
    }

    return finalName
  }

  /**
   * Sanitizes a filename to be URL-safe and compatible with object storage.
   * Handles Cyrillic, special characters, and other non-ASCII characters.
   * @param originalName - The original filename (may contain Cyrillic or special chars)
   * @returns A sanitized, URL-safe filename
   */
  sanitizeFileName(originalName: string): string {
    const lastDotIndex = originalName.lastIndexOf('.')
    const hasExtension = lastDotIndex > 0

    const extension = hasExtension
      ? originalName.substring(lastDotIndex).toLowerCase()
      : ''
    const nameWithoutExt = hasExtension
      ? originalName.substring(0, lastDotIndex)
      : originalName

    // Transliterate Cyrillic to Latin characters
    const transliterated = this.transliterate(nameWithoutExt)

    // Sanitize: lowercase, replace non-alphanumeric with hyphen, clean up
    const sanitized = transliterated
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    // Ensure we have a valid filename (fallback to 'file' if empty)
    const finalName = sanitized || 'file'

    return `${finalName}${extension}`
  }

  /**
   * Transliterates Cyrillic characters to Latin equivalents.
   */
  private transliterate(text: string): string {
    const cyrillicToLatin: Record<string, string> = {
      // Russian/Cyrillic lowercase
      а: 'a',
      б: 'b',
      в: 'v',
      г: 'g',
      д: 'd',
      е: 'e',
      ё: 'yo',
      ж: 'zh',
      з: 'z',
      и: 'i',
      й: 'y',
      к: 'k',
      л: 'l',
      м: 'm',
      н: 'n',
      о: 'o',
      п: 'p',
      р: 'r',
      с: 's',
      т: 't',
      у: 'u',
      ф: 'f',
      х: 'kh',
      ц: 'ts',
      ч: 'ch',
      ш: 'sh',
      щ: 'shch',
      ъ: '',
      ы: 'y',
      ь: '',
      э: 'e',
      ю: 'yu',
      я: 'ya',
      // Russian/Cyrillic uppercase
      А: 'A',
      Б: 'B',
      В: 'V',
      Г: 'G',
      Д: 'D',
      Е: 'E',
      Ё: 'Yo',
      Ж: 'Zh',
      З: 'Z',
      И: 'I',
      Й: 'Y',
      К: 'K',
      Л: 'L',
      М: 'M',
      Н: 'N',
      О: 'O',
      П: 'P',
      Р: 'R',
      С: 'S',
      Т: 'T',
      У: 'U',
      Ф: 'F',
      Х: 'Kh',
      Ц: 'Ts',
      Ч: 'Ch',
      Ш: 'Sh',
      Щ: 'Shch',
      Ъ: '',
      Ы: 'Y',
      Ь: '',
      Э: 'E',
      Ю: 'Yu',
      Я: 'Ya',
      // Uzbek specific characters
      ў: 'o',
      Ў: 'O',
      қ: 'q',
      Қ: 'Q',
      ғ: 'g',
      Ғ: 'G',
      ҳ: 'h',
      Ҳ: 'H',
    }

    return text
      .split('')
      .map((char) => cyrillicToLatin[char] ?? char)
      .join('')
  }

  async getFile(fileName: string): Promise<Buffer> {
    try {
      const dataStream = await this.minioClient.getObject(
        this.bucketName,
        fileName,
      )

      const chunks: Buffer[] = []
      return new Promise((resolve, reject) => {
        dataStream.on('data', (chunk) => chunks.push(chunk))
        dataStream.on('end', () => resolve(Buffer.concat(chunks)))
        dataStream.on('error', reject)
      })
    } catch (error) {
      this.logger.error(`Error getting file: ${error.message}`)
      throw error
    }
  }

  async putFile(
    fileName: string,
    content: Buffer,
    mimeType: string,
  ): Promise<void> {
    const metaData = {
      'Content-Type': mimeType,
    }

    try {
      await this.minioClient.putObject(
        this.bucketName,
        fileName,
        content,
        content.length,
        metaData,
      )
      this.logger.log(`File updated successfully: ${fileName}`)
    } catch (error) {
      this.logger.error(`Error updating file: ${error.message}`)
      throw error
    }
  }

  async deleteFile(fileName: string): Promise<void> {
    try {
      await this.minioClient.removeObject(this.bucketName, fileName)
      this.logger.log(`File deleted successfully: ${fileName}`)
    } catch (error) {
      this.logger.error(`Error deleting file: ${error.message}`)
      throw error
    }
  }
}
