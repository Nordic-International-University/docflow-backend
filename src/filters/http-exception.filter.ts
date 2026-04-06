import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
} from '@nestjs/common'
import { Response } from 'express'

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
  'Invalid or expired refresh token': 'Yangilash tokeni yaroqsiz yoki muddati tugagan',
  'User account is inactive or deleted': "Foydalanuvchi hisobi faol emas yoki o'chirilgan",
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

@Catch()
export class HttpExceptionFilter implements ExceptionFilter {
  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp()
    const response = ctx.getResponse<Response>()

    let status = HttpStatus.INTERNAL_SERVER_ERROR
    let message: string | string[] = 'Ichki server xatosi'

    if (exception instanceof HttpException) {
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
    } else if (exception?.message) {
      message = translateMessage(exception.message)
    }

    response.status(status).json({
      statusCode: status,
      message,
      error: STATUS_TRANSLATIONS[status] || 'Xatolik',
    })
  }
}
