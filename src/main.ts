import { Logger, ValidationPipe, VersioningType } from '@nestjs/common'
import { NestFactory } from '@nestjs/core'
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger'
import { App } from './app'
import { NestExpressApplication } from '@nestjs/platform-express'
import { HttpExceptionFilter } from './filters/http-exception.filter'
import { ResponseInterceptor } from '@common'
import { warmPdfConverter } from './common/utils/pdf-converter.util'

setImmediate(async (): Promise<void> => {
  const app = await NestFactory.create<NestExpressApplication>(App)

  app.set('trust proxy', true)

  // CORS — .env'dan yoki default qiymatlar
  const corsOrigins = (process.env.CORS_ORIGINS || 'http://localhost:3000,https://docverse.uz,https://www.docverse.uz,https://e-hujjat.nordicuniversity.org')
    .split(',')
    .map((s) => s.trim())
    .filter(Boolean)
  app.enableCors({
    origin: corsOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
  })

  app.useGlobalFilters(new HttpExceptionFilter())
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  )

  const config = new DocumentBuilder()
    .setTitle('NORDIC DOCFLOW API GATEWAY')
    .setDescription('Nordic Docflow API Gateway')
    .addBearerAuth({
      description: `[just text field] Please enter token in following format: Bearer <JWT>`,
      name: 'Authorization',
      bearerFormat: 'Bearer',
      scheme: 'Bearer',
      type: 'http',
      in: 'Header',
    })
    .build()

  app.enableVersioning({
    prefix: 'api/v',
    type: VersioningType.URI,
  })

  app.useGlobalInterceptors(new ResponseInterceptor())

  const document = SwaggerModule.createDocument(app, config)

  SwaggerModule.setup('docs', app, document)

  const port = parseInt(process.env.PORT || '5072', 10)
  await app.listen(port, '0.0.0.0')

  // Gotenberg ping — fire-and-forget, bloklamasdan health'ni log qiladi.
  // Muvaffaqiyatsiz bo'lsa backend shunchaki warning chiqaradi, boshqa
  // API'lar ishlayveradi; faqat PDF konversiya endpointlari fail bo'ladi.
  void warmPdfConverter()

  // Graceful shutdown — GotenbergClient stateless, maxsus to'xtatish kerak emas,
  // faqat NestJS app.close() chaqirib ochiq resurslar (DB, Redis, WS) tozalanadi.
  const shutdownLogger = new Logger('Shutdown')
  let shuttingDown = false
  const shutdown = async (signal: string) => {
    if (shuttingDown) return
    shuttingDown = true
    shutdownLogger.log(`Received ${signal}, shutting down…`)
    try {
      await app.close()
    } catch (e: any) {
      shutdownLogger.error(`Shutdown error: ${e?.message}`)
    } finally {
      process.exit(0)
    }
  }
  process.on('SIGTERM', () => void shutdown('SIGTERM'))
  process.on('SIGINT', () => void shutdown('SIGINT'))
})
