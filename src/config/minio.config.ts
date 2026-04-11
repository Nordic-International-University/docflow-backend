import { registerAs } from '@nestjs/config'

interface MinIoServiceOptions {
  endPoint: string
  port?: number
  useSSL: boolean
  accessKey: string
  secretKey: string
  bucket: string
}

export const minioConfig = registerAs<MinIoServiceOptions>(
  'minio',
  (): MinIoServiceOptions => ({
    endPoint: process.env.MINIO_ENDPOINT || 'cdn.nordicuniversity.org',
    port: process.env.MINIO_PORT
      ? parseInt(process.env.MINIO_PORT, 10)
      : undefined,
    useSSL: process.env.MINIO_USE_SSL !== 'false',
    accessKey: process.env.MINIO_ACCESS_KEY || '',
    secretKey: process.env.MINIO_SECRET_KEY || '',
    bucket: process.env.MINIO_BUCKET || 'docflow-files',
  }),
)
