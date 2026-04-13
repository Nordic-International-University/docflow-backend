/**
 * Document public / external access service.
 *
 * document.service.ts'dan ajratildi — ~260 qator self-contained logika.
 * QR-code orqali hujjat tekshirish va approved PDF yuklab olish
 * (watermark olib tashlash bilan).
 */

import {
  Injectable,
  Logger,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common'
import { PrismaService } from '@prisma'
import { MinioService } from '@clients'
import { removeWatermark } from '@common'
import { DocumentStatus, WorkflowStatus } from '@prisma/client'
import { DocumentPublicVerificationResponse } from './document.types'

@Injectable()
export class DocumentPublicService {
  private readonly logger = new Logger(DocumentPublicService.name)

  constructor(
    private readonly prisma: PrismaService,
    private readonly minio: MinioService,
  ) {}

  async verify(
    documentId: string,
  ): Promise<DocumentPublicVerificationResponse> {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        description: true,
        documentNumber: true,
        status: true,
        createdAt: true,
        documentType: { select: { id: true, name: true } },
        createdBy: {
          select: {
            id: true,
            fullname: true,
            username: true,
          },
        },
        workflow: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
            type: true,
            currentStepOrder: true,
            createdAt: true,
            updatedAt: true,
            workflowSteps: {
              where: {
                deletedAt: null,
              },
              orderBy: {
                order: 'asc',
              },
              select: {
                id: true,
                order: true,
                status: true,
                actionType: true,
                startedAt: true,
                completedAt: true,
                isRejected: true,
                rejectionReason: true,
                assignedToUser: {
                  select: {
                    id: true,
                    fullname: true,
                    username: true,
                  },
                },
                actions: {
                  where: {
                    deletedAt: null,
                  },
                  orderBy: {
                    createdAt: 'desc',
                  },
                  select: {
                    id: true,
                    actionType: true,
                    comment: true,
                    createdAt: true,
                    performedBy: {
                      select: {
                        id: true,
                        fullname: true,
                        username: true,
                      },
                    },
                  },
                },
              },
            },
          },
        },
      },
    })

    if (!document) {
      throw new NotFoundException('Hujjat topilmadi')
    }

    return {
      id: document.id,
      title: document.title,
      description: document.description,
      documentNumber: document.documentNumber,
      status: document.status,
      documentType: document.documentType,
      createdBy: document.createdBy,
      createdAt: document.createdAt.toISOString(),
      workflow: document.workflow[0]
        ? {
            id: document.workflow[0].id,
            status: document.workflow[0].status,
            type: document.workflow[0].type,
            currentStepOrder: document.workflow[0].currentStepOrder,
            steps: document.workflow[0].workflowSteps.map((step) => ({
              id: step.id,
              order: step.order,
              status: step.status,
              actionType: step.actionType,
              assignedToUser: step.assignedToUser,
              startedAt: step.startedAt?.toISOString(),
              completedAt: step.completedAt?.toISOString(),
              isRejected: step.isRejected,
              rejectionReason: step.rejectionReason,
              actions: step.actions.map((action) => ({
                id: action.id,
                actionType: action.actionType,
                comment: action.comment,
                performedBy: action.performedBy,
                createdAt: action.createdAt.toISOString(),
              })),
            })),
            createdAt: document.workflow[0].createdAt.toISOString(),
            updatedAt: document.workflow[0].updatedAt.toISOString(),
          }
        : null,
    }
  }

  async downloadAccepted(
    documentId: string,
    userId?: string,
  ): Promise<{ pdfBuffer: Buffer; fileName: string }> {
    const document = await this.prisma.document.findFirst({
      where: {
        id: documentId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        status: true,
        pdfUrl: true,
        createdById: true,
        workflow: {
          where: {
            deletedAt: null,
          },
          select: {
            id: true,
            status: true,
            workflowSteps: {
              where: {
                deletedAt: null,
              },
              select: {
                id: true,
                assignedToUserId: true,
              },
            },
          },
        },
      },
    })

    if (!document) {
      throw new NotFoundException('Hujjat topilmadi')
    }

    if (!document.workflow || document.workflow.length === 0) {
      throw new BadRequestException(
        'Hujjatga ish jarayoni biriktirilmagan',
      )
    }

    const workflow = document.workflow[0]
    if (workflow.status !== WorkflowStatus.COMPLETED) {
      throw new BadRequestException(
        "Hujjat ish jarayoni yakunlanmagan. Faqat tasdiqlangan hujjatlarni yuklab olish mumkin",
      )
    }

    if (document.status !== DocumentStatus.APPROVED) {
      throw new BadRequestException(
        "Hujjat hali tasdiqlanmagan. Faqat tasdiqlangan hujjatlarni yuklab olish mumkin",
      )
    }

    if (userId) {
      const isCreator = document.createdById === userId
      const wasAssigned = workflow.workflowSteps.some(
        (step) => step.assignedToUserId === userId,
      )

      if (!isCreator && !wasAssigned) {
        throw new BadRequestException(
          "Bu hujjatni yuklab olish uchun sizda ruxsat mavjud emas",
        )
      }
    }

    if (!document.pdfUrl) {
      throw new NotFoundException('Bu hujjat uchun PDF fayl topilmadi')
    }

    try {
      const pdfFileName = this.minio.extractFileName(document.pdfUrl)
      const pdfBuffer = await this.minio.getFile(pdfFileName)

      const result = await removeWatermark(pdfBuffer)
      this.logger.log(
        `Watermark removal completed: ${result.watermarksRemoved} watermark(s) removed`,
      )

      const fileName = pdfFileName.split('/').pop() || 'document.pdf'

      return {
        pdfBuffer: result.cleanPdfBuffer,
        fileName,
      }
    } catch (error) {
      this.logger.error(
        'Error downloading document with watermark removal:',
        error,
      )
      throw new Error(
        `Failed to download document: ${(error as Error).message}`,
      )
    }
  }
}
