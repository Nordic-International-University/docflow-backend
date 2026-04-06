import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { tap } from 'rxjs/operators'
import { Reflector } from '@nestjs/core'
import { AuditLogService } from '@modules'

export const AUDIT_LOG_KEY = 'auditLog'

export interface AuditLogMetadata {
  entity: string
  action: string
  getEntityId?: (result: any, req: any) => string
  getChanges?: (result: any, req: any, body: any) => Record<string, any>
  getOldValues?: (result: any, req: any, body: any) => Record<string, any>
  getNewValues?: (result: any, req: any, body: any) => Record<string, any>
}

@Injectable()
export class AuditLogInterceptor implements NestInterceptor {
  constructor(
    private reflector: Reflector,
    private auditLogService: AuditLogService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const auditMetadata = this.reflector.get<AuditLogMetadata>(
      AUDIT_LOG_KEY,
      context.getHandler(),
    )

    if (!auditMetadata) {
      return next.handle()
    }

    const request = context.switchToHttp().getRequest()
    const user = request.user

    if (!user || !user.userId) {
      return next.handle()
    }

    return next.handle().pipe(
      tap(async (result) => {
        try {
          const entityId = auditMetadata.getEntityId
            ? auditMetadata.getEntityId(result, request)
            : request.params?.id || result?.id

          const changes = auditMetadata.getChanges
            ? auditMetadata.getChanges(result, request, request.body)
            : undefined

          const oldValues = auditMetadata.getOldValues
            ? auditMetadata.getOldValues(result, request, request.body)
            : undefined

          const newValues = auditMetadata.getNewValues
            ? auditMetadata.getNewValues(result, request, request.body)
            : undefined

          await this.auditLogService.logAction(
            auditMetadata.entity,
            entityId,
            auditMetadata.action,
            user.userId,
            {
              changes,
              oldValues,
              newValues,
              ipAddress: request.ipAddress || request.ip,
              userAgent: request.headers['user-agent'],
            },
          )
        } catch (error) {
          console.error('Failed to create audit log:', error)
        }
      }),
    )
  }
}
