import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common'
import { Request, Response } from 'express'

const ERROR_TRANSLATIONS: Record<string, string> = {
  // ==================== AUTH & GUARDS ====================
  'Missing authentication token': 'Autentifikatsiya tokeni topilmadi',
  'Invalid or expired token': 'Token yaroqsiz yoki muddati tugagan',
  'Token has been revoked': 'Token bekor qilingan',
  'User not found or inactive': 'Foydalanuvchi topilmadi yoki faol emas',
  'User not authenticated': 'Foydalanuvchi autentifikatsiya qilinmagan',
  'Invalid credentials': "Login yoki parol noto'g'ri",
  'Invalid username or password': "Login yoki parol noto'g'ri",
  'Invalid refresh token': 'Yangilash tokeni yaroqsiz',
  'Invalid or expired refresh token':'Yangilash tokeni yaroqsiz yoki muddati tugagan',
  'User account is inactive or deleted':"Foydalanuvchi hisobi faol emas yoki o'chirilgan",
  'Insufficient permissions': 'Ruxsat yetarli emas',
  'Missing WOPI access token': 'WOPI kirish tokeni topilmadi',
  'Invalid WOPI access token': 'WOPI kirish tokeni yaroqsiz',
  'Access token is required': 'Kirish tokeni talab qilinadi',
  'Invalid access token': 'Kirish tokeni yaroqsiz',
  'Access token has expired': 'Kirish tokeni muddati tugagan',
  'User is no longer active': 'Foydalanuvchi endi faol emas',

  // ==================== USER ====================
  'User not found': 'Foydalanuvchi topilmadi',
  'Username already exists': 'Bu foydalanuvchi nomi allaqachon mavjud',
  'Telegram ID already exists': 'Bu Telegram ID allaqachon ishlatilgan',

  // ==================== ROLE ====================
  'Role not found': 'Rol topilmadi',
  'Role name must be unique': 'Rol nomi takrorlanmasligi kerak',

  // ==================== PERMISSION ====================
  'Permission not found': 'Ruxsat topilmadi',
  'Permission key already used': 'Bu ruxsat kaliti allaqachon ishlatilgan',

  // ==================== DEPARTMENT ====================
  'Department not found': "Bo'lim topilmadi",
  'Department code must be unique': "Bo'lim kodi takrorlanmasligi kerak",

  // ==================== DOCUMENT ====================
  'Document not found': 'Hujjat topilmadi',
  'Document type not found': 'Hujjat turi topilmadi',
  'Document number must be unique': 'Hujjat raqami takrorlanmasligi kerak',
  'Document template not found': 'Hujjat shabloni topilmadi',
  'Tags are required when using a template': 'Shablon ishlatilganda teglar kiritilishi shart',
  'PDF URL not found for this document': 'Bu hujjat uchun PDF fayl topilmadi',
  'PDF file not found for this document': 'Bu hujjat uchun PDF fayl topilmadi',
  'You must be assigned to a department to create documents': "Hujjat yaratish uchun bo'limga biriktirilgan bo'lishingiz kerak",
  'You can only create documents with journals from your own department': "Faqat o'z bo'limingiz jurnalidan hujjat yaratishingiz mumkin",

  // ==================== JOURNAL ====================
  'Journal not found': 'Jurnal topilmadi',

  // ==================== ATTACHMENT ====================
  'Attachment not found': 'Fayl topilmadi',
  'No file provided': 'Fayl yuklanmadi',
  'No file provided. Make sure the request is multipart/form-data with field name "file"':
    'Fayl yuklanmadi. So\'rov multipart/form-data formatda "file" maydoni bilan yuborilishi kerak',
  'File not found': 'Fayl topilmadi',
  'File no longer exists': 'Fayl endi mavjud emas',

  // ==================== WORKFLOW ====================
  'Workflow not found': 'Ish jarayoni topilmadi',
  'Workflow not found for this document': 'Bu hujjat uchun ish jarayoni topilmadi',
  'Workflow already exists for this document': 'Bu hujjat uchun ish jarayoni allaqachon mavjud',
  'Workflow template has no steps defined': 'Ish jarayoni shablonida bosqichlar belgilanmagan',
  'Workflow step not found': 'Ish jarayoni bosqichi topilmadi',
  'Workflow template not found': 'Ish jarayoni shabloni topilmadi',
  'Workflow is not active': 'Ish jarayoni faol emas',
  'This step has already been completed': 'Bu bosqich allaqachon yakunlangan',
  'User ID is required to reject a step': "Bosqichni rad etish uchun foydalanuvchi ID si kerak",
  'Rollback user not found': 'Qaytarish foydalanuvchisi topilmadi',
  'Step orders must be unique': "Bosqich tartib raqamlari takrorlanmasligi kerak",
  'Assigned user not found': "Tayinlangan foydalanuvchi topilmadi",
  'One or more assigned users not found': "Bir yoki bir nechta tayinlangan foydalanuvchi topilmadi",
  'One or more assigned roles not found': "Bir yoki bir nechta tayinlangan rol topilmadi",

  // ==================== PROJECT ====================
  'Project not found': 'Loyiha topilmadi',
  'Project key must be unique': 'Loyiha kaliti takrorlanmasligi kerak',

  // ==================== PROJECT MEMBER ====================
  'Project member not found': "Loyiha a'zosi topilmadi",
  'User is already a member of this project': "Foydalanuvchi allaqachon bu loyiha a'zosi",

  // ==================== PROJECT LABEL ====================
  'Project label not found': "Loyiha yorlig'i topilmadi",
  'Label name must be unique within project': "Yorliq nomi loyiha ichida takrorlanmasligi kerak",
  'Label not found': "Yorliq topilmadi",

  // ==================== BOARD ====================
  'Board column not found': 'Ustun topilmadi',
  'Task not found in this project': 'Bu loyihada topshiriq topilmadi',
  'Target column not found in this project': 'Bu loyihada maqsad ustun topilmadi',

  // ==================== TASK ====================
  'Task not found': 'Topshiriq topilmadi',
  'Task category not found': 'Topshiriq kategoriyasi topilmadi',
  'Task category name must be unique': 'Topshiriq kategoriyasi nomi takrorlanmasligi kerak',

  // ==================== TASK CHECKLIST ====================
  'Task checklist not found': "Topshiriq tekshiruv ro'yxati topilmadi",
  'Task checklist item not found': "Tekshiruv ro'yxati bandi topilmadi",

  // ==================== TASK COMMENT ====================
  'Task comment not found': 'Topshiriq izohi topilmadi',

  // ==================== TASK ATTACHMENT ====================
  'Task attachment not found': 'Topshiriq fayli topilmadi',
  'This attachment is already linked to the task': 'Bu fayl allaqachon topshiriqqa biriktirilgan',

  // ==================== TASK DEPENDENCY ====================
  'Task dependency not found': "Topshiriq bog'liqligi topilmadi",
  'A task cannot depend on itself': "Topshiriq o'ziga bog'liq bo'la olmaydi",
  'This dependency already exists': "Bu bog'liqlik allaqachon mavjud",
  'Dependent task not found': "Bog'liq topshiriq topilmadi",
  'Blocking task not found': "Bloklayotgan topshiriq topilmadi",

  // ==================== TASK WATCHER ====================
  'Task watcher not found': 'Topshiriq kuzatuvchisi topilmadi',
  'User is already watching this task': 'Foydalanuvchi allaqachon bu topshiriqni kuzatmoqda',

  // ==================== TASK TIME ENTRY ====================
  'Time entry not found': 'Vaqt yozuvi topilmadi',

  // ==================== TASK LABEL ====================
  'Task label not found': "Topshiriq yorlig'i topilmadi",
  'Label is already assigned to this task': "Yorliq allaqachon bu topshiriqqa biriktirilgan",

  // ==================== TASK ACTIVITY ====================
  'Task activity not found': 'Topshiriq faoliyati topilmadi',

  // ==================== KPI ====================
  'Task score config not found': 'Topshiriq ball konfiguratsiyasi topilmadi',
  'KPI reward tier not found': 'KPI mukofot darajasi topilmadi',
  'KPI reward not found': 'KPI mukofoti topilmadi',
  'User monthly KPI not found': 'Foydalanuvchi oylik KPI topilmadi',
  'minScore cannot be greater than maxScore': 'Minimal ball maksimal balldan katta bo\'la olmaydi',
  'Cannot reject a paid reward': "To'langan mukofotni rad etib bo'lmaydi",

  // ==================== NOTIFICATION ====================
  'Notification not found': 'Bildirishnoma topilmadi',

  // ==================== SESSION ====================
  'Sessiya topilmadi': 'Sessiya topilmadi',
  'Session not found': 'Sessiya topilmadi',

  // ==================== AUDIT ====================
  'Audit log entry not found': 'Audit log yozuvi topilmadi',

  // ==================== DOCUMENT (qo'shimcha) ====================
  'Document does not have an associated workflow': "Hujjatga ish jarayoni biriktirilmagan",
  'Document workflow is not completed. Only approved documents can be downloaded.': "Hujjat ish jarayoni yakunlanmagan. Faqat tasdiqlangan hujjatlarni yuklab olish mumkin.",
  'Document is not approved. Only approved documents can be downloaded.': "Hujjat tasdiqlanmagan. Faqat tasdiqlangan hujjatlarni yuklab olish mumkin.",
  'You do not have permission to download this document': "Siz bu hujjatni yuklab olish huquqiga ega emassiz",
  'Missing required tags': "Kerakli teglar kiritilmagan",

  // ==================== DOCUMENT TEMPLATE (qo'shimcha) ====================
  'Document template with this name already exists': "Bu nomdagi hujjat shabloni allaqachon mavjud",
  'Cannot delete template that is being used by documents': "Hujjatlar tomonidan ishlatiladigan shablonni o'chirib bo'lmaydi",

  // ==================== WORKFLOW (qo'shimcha) ====================
  'Workflow template not found or is inactive': "Ish jarayoni shabloni topilmadi yoki faol emas",
  'Either workflowTemplateId or steps must be provided': "workflowTemplateId yoki bosqichlar ko'rsatilishi kerak",
  'Step with the specified order does not exist': "Ko'rsatilgan tartib raqamli bosqich mavjud emas",
  'Workflow template with this name already exists': "Bu nomdagi ish jarayoni shabloni allaqachon mavjud",
  'One or more assigned departments not found': "Bir yoki bir nechta tayinlangan bo'lim topilmadi",

  // ==================== WORKFLOW STEP (qo'shimcha) ====================
  'This workflow has been completed and cannot be modified': "Bu ish jarayoni yakunlangan va o'zgartirib bo'lmaydi",
  'Only the workflow creator can add workflow steps': "Faqat ish jarayoni yaratuvchisi bosqich qo'sha oladi",
  'Only the workflow creator can update workflow steps': "Faqat ish jarayoni yaratuvchisi bosqichni yangilay oladi",
  'Only the workflow creator can delete workflow steps': "Faqat ish jarayoni yaratuvchisi bosqichni o'chira oladi",
  'Only the workflow creator can reassign workflow steps': "Faqat ish jarayoni yaratuvchisi bosqichni qayta tayinlay oladi",
  'A step with this order already exists in the workflow': "Bu tartib raqamli bosqich allaqachon ish jarayonida mavjud",
  'VERIFICATION type workflow steps cannot be reassigned. They must be completed by the originally assigned user.': "TEKSHIRUV turidagi bosqichlarni qayta tayinlab bo'lmaydi. Ular dastlab tayinlangan foydalanuvchi tomonidan bajarilishi kerak.",
  'VERIFICATION type workflow steps cannot be rejected or rolled back. They can only be completed with file attachments.': "TEKSHIRUV turidagi bosqichlarni rad etib yoki qaytarib bo'lmaydi. Ular faqat fayl biriktirish orqali yakunlanadi.",
  'Cannot complete this step. Current workflow step is': "Bu bosqichni yakunlab bo'lmaydi. Bosqichlar tartib bo'yicha yakunlanishi kerak.",
  'Cannot reject this step. Current workflow step is': "Bu bosqichni rad etib bo'lmaydi. Bosqichlar tartib bo'yicha qayta ishlanishi kerak.",
  'Creator step not found in this workflow. Unable to reject to creator.': "Yaratuvchi bosqichi topilmadi. Yaratuvchiga qaytarib bo'lmaydi.",
  'Rollback feature is only available for CONSECUTIVE workflows': "Qaytarish funksiyasi faqat KETMA-KET ish jarayonlari uchun mavjud",
  'Cannot complete': "Bu bosqichni yakunlab bo'lmaydi",
  'At least one file attachment is required for verification steps': "Tekshiruv bosqichlari uchun kamida bitta fayl biriktirish talab qilinadi",
  'This endpoint is only for VERIFICATION type workflow steps': "Bu endpoint faqat TEKSHIRUV turidagi bosqichlar uchun",

  // ==================== WOPI (qo'shimcha) ====================
  'You do not have permission to edit this document': "Siz bu hujjatni tahrirlash huquqiga ega emassiz",
  'You do not have permission to access this document.': "Siz bu hujjatga kirish huquqiga ega emassiz",
  'You do not have permission to edit XFDF annotations. Only users with an active workflow step can perform this action.': "XFDF annotatsiyalarini tahrirlash huquqingiz yo'q. Faqat faol bosqichga ega foydalanuvchilar bu amalni bajara oladi.",
  'You do not have permission to access this file': "Siz bu faylga kirish huquqiga ega emassiz",

  // ==================== TASK DEPENDENCY (qo'shimcha) ====================
  'Both tasks must be in the same project to create a dependency': "Bog'liqlik yaratish uchun ikkala topshiriq bir loyihada bo'lishi kerak",
  'Cannot create circular dependency: the blocking task already depends on the dependent task': "Davriy bog'liqlik yaratib bo'lmaydi: bloklayotgan topshiriq allaqachon bog'liq topshiriqqa bog'langan",
  'Cannot create dependency: this would create a circular dependency chain': "Bog'liqlik yaratib bo'lmaydi: bu davriy bog'liqlik zanjirini hosil qiladi",

  // ==================== TASK (qo'shimcha) ====================
  'Parent task not found or not in same project': "Asosiy topshiriq topilmadi yoki boshqa loyihada",
  'Board column not found or not in same project': "Ustun topilmadi yoki boshqa loyihada",
  'Label must belong to the same project as the task': "Yorliq topshiriq bilan bir loyihaga tegishli bo'lishi kerak",

  // ==================== TASK COMMENT (qo'shimcha) ====================
  'Parent comment not found or does not belong to this task': "Asosiy izoh topilmadi yoki bu topshiriqqa tegishli emas",

  // ==================== BOARD (qo'shimcha) ====================
  'Column name must be unique within the project': "Ustun nomi loyiha ichida takrorlanmasligi kerak",
  'Cannot delete column with tasks. Move or delete tasks first.': "Topshiriqlari bor ustunni o'chirib bo'lmaydi. Avval topshiriqlarni ko'chiring yoki o'chiring.",
  'Some columns were not found or do not belong to this project': "Ba'zi ustunlar topilmadi yoki bu loyihaga tegishli emas",

  // ==================== DEPARTMENT (qo'shimcha) ====================
  'This user is already assigned as a director of another department': "Bu foydalanuvchi allaqachon boshqa bo'lim direktori etib tayinlangan",

  // ==================== ATTACHMENT (qo'shimcha) ====================
  'Attachment with same file name and URL already exists': "Bir xil fayl nomi va URL bilan biriktirma allaqachon mavjud",

  // ==================== USER (qo'shimcha) ====================
  'This Telegram ID is already linked to another account': "Bu Telegram ID allaqachon boshqa hisobga ulangan",
  'No Telegram account is linked to this user': "Bu foydalanuvchiga Telegram hisob ulanmagan",

  // ==================== KPI (qo'shimcha) ====================
  'Cannot approve reward with status': "Bu holat bilan mukofotni tasdiqlab bo'lmaydi",
  'Cannot mark as paid with status': "Bu holat bilan to'langan deb belgilab bo'lmaydi",
  'Score range overlaps with existing tier': "Ball diapazoni mavjud daraja bilan ustma-ust tushadi",
  'Task score config for priority level': "Ushbu ustuvorlik darajasi uchun ball konfiguratsiyasi",

  // ==================== PERMISSION (qo'shimcha) ====================
  'Permission key already used by another permission': "Bu ruxsat kaliti boshqa ruxsat tomonidan ishlatilgan",
}


const STATUS_TRANSLATIONS: Record<number, string> = {
  [HttpStatus.BAD_REQUEST]: "Noto'g'ri so'rov",
  [HttpStatus.UNAUTHORIZED]: 'Autentifikatsiya talab qilinadi',
  [HttpStatus.FORBIDDEN]: 'Ruxsat berilmagan',
  [HttpStatus.NOT_FOUND]: 'Topilmadi',
  [HttpStatus.CONFLICT]: 'Ziddiyat yuz berdi',
  [HttpStatus.INTERNAL_SERVER_ERROR]: 'Ichki server xatosi',
  [HttpStatus.UNPROCESSABLE_ENTITY]: "Ma'lumotlar noto'g'ri",
  [HttpStatus.TOO_MANY_REQUESTS]: "So'rovlar soni limitdan oshdi",
}

function translateMessage(message: string): string {
  if (ERROR_TRANSLATIONS[message]) {
    return ERROR_TRANSLATIONS[message]
  }

  // Partial match for dynamic messages like "Insufficient permissions. Required: xxx"
  for (const [key, value] of Object.entries(ERROR_TRANSLATIONS)) {
    if (message.startsWith(key)) {
      return value
    }
  }

  return message
}

/**
 * Prisma xatolarini foydalanuvchi tushunadigan xabarga aylantirish.
 * Internal ma'lumotlar (table nomi, SQL, stack trace) foydalanuvchiga ko'rinmaydi.
 */
function translatePrismaError(exception: any): { status: number; message: string } | null {
  const code = exception?.code
  const name = exception?.constructor?.name

  if (!code && !name?.includes('Prisma')) return null

  const meta = exception?.meta || {}
  const target = Array.isArray(meta.target) ? meta.target.join(', ') : meta.target

  // Prisma error kodlari: https://www.prisma.io/docs/reference/api-reference/error-reference
  switch (code) {
    case 'P2002':
      // Unique constraint violation
      if (target?.includes('document_number')) {
        return {
          status: HttpStatus.CONFLICT,
          message: "Bu raqamli hujjat allaqachon mavjud. Iltimos qayta urining.",
        }
      }
      if (target?.includes('username')) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Bu foydalanuvchi nomi band.',
        }
      }
      if (target?.includes('email')) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Bu email allaqachon ro\'yxatdan o\'tgan.',
        }
      }
      if (target?.includes('key')) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Bu kalit (key) allaqachon band.',
        }
      }
      if (target?.includes('slug')) {
        return {
          status: HttpStatus.CONFLICT,
          message: 'Bu nom allaqachon band, boshqa variant tanlang.',
        }
      }
      return {
        status: HttpStatus.CONFLICT,
        message: "Bu ma'lumot allaqachon mavjud.",
      }

    case 'P2003':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Bog'liq ma'lumot topilmadi. Avval tegishli yozuvni yarating.",
      }

    case 'P2025':
      return {
        status: HttpStatus.NOT_FOUND,
        message: "So'ralgan ma'lumot topilmadi.",
      }

    case 'P2014':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Bu yozuvni o'chirib bo'lmaydi — unga bog'liq boshqa ma'lumotlar mavjud.",
      }

    case 'P2000':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Kiritilgan qiymat juda uzun.",
      }

    case 'P2001':
      return {
        status: HttpStatus.NOT_FOUND,
        message: "So'ralgan ma'lumot topilmadi.",
      }

    case 'P2011':
    case 'P2012':
      return {
        status: HttpStatus.BAD_REQUEST,
        message: "Majburiy maydon to'ldirilmagan.",
      }

    case 'P2034':
      return {
        status: HttpStatus.SERVICE_UNAVAILABLE,
        message: "Tizim band, iltimos qayta urining.",
      }
  }

  // Prisma validation yoki boshqa kutilmagan xatolar
  if (name === 'PrismaClientValidationError') {
    return {
      status: HttpStatus.BAD_REQUEST,
      message: "Kiritilgan ma'lumot noto'g'ri formatda.",
    }
  }
  if (name === 'PrismaClientKnownRequestError' || name === 'PrismaClientUnknownRequestError') {
    return {
      status: HttpStatus.INTERNAL_SERVER_ERROR,
      message: "Ma'lumotlar bazasi bilan ishlashda xatolik. Iltimos qayta urining.",
    }
  }
  if (name === 'PrismaClientInitializationError') {
    return {
      status: HttpStatus.SERVICE_UNAVAILABLE,
      message: "Tizim vaqtinchalik ishlamayapti. Biroz kuting.",
    }
  }

  return null
}

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger('HttpExceptionFilter')

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()
    const request = ctx.getRequest<Request>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Ichki server xatosi'

    // 1. Prisma error tekshirish
    const prismaError = translatePrismaError(exception)
    if (prismaError) {
      status = prismaError.status
      message = prismaError.message

      // Internal errorlarni log qilish (lekin foydalanuvchiga yubormaslik)
      this.logger.error(
        `Prisma error [${exception?.code}] on ${request?.method} ${request?.url}: ${exception?.message?.split('\n')[0]}`,
      )
    }
    // 2. HttpException
    else if (exception instanceof HttpException) {
      status = exception.getStatus()
      const exceptionResponse = exception.getResponse()

      if (typeof exceptionResponse === 'string') {
        message = translateMessage(exceptionResponse)
      } else if (typeof exceptionResponse === 'object') {
        const resp = exceptionResponse as any
        if (Array.isArray(resp.message)) {
          message = resp.message.map((m: string) => translateMessage(m))
        } else if (resp.message) {
          message = translateMessage(resp.message)
        }
      }
    }
    // 3. Internal/noma'lum xato — foydalanuvchiga stack trace KO'RSATILMAYDI
    else {
      status = HttpStatus.INTERNAL_SERVER_ERROR
      message = "Ichki server xatosi. Iltimos qayta urining yoki administratorga murojaat qiling."

      // Lekin serverda to'liq log
      this.logger.error(
        `Unhandled error on ${request?.method} ${request?.url}: ${exception?.message || exception}`,
        exception?.stack,
      )
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: STATUS_TRANSLATIONS[status] || 'Xatolik',
    })
  }
}
