import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common'
import { Observable } from 'rxjs'
import { map } from 'rxjs/operators'
import { Response } from 'express'

const METHOD_MESSAGES: Record<string, string> = {
  POST: 'Muvaffaqiyatli yaratildi',
  PATCH: 'Muvaffaqiyatli yangilandi',
  PUT: 'Muvaffaqiyatli yangilandi',
  DELETE: "Muvaffaqiyatli o'chirildi",
}

@Injectable()
export class ResponseInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest()
    const response = context.switchToHttp().getResponse<Response>()
    const method = request.method

    return next.handle().pipe(
      map((data) => {
        const statusCode = response.statusCode

        // If data is already a structured response with 'data' or 'total', return as-is
        if (data && typeof data === 'object' && ('data' in data || 'total' in data || 'accessToken' in data)) {
          return data
        }

        // If response is void/undefined/null — return success message
        if (data === undefined || data === null) {
          return {
            statusCode,
            message: METHOD_MESSAGES[method] || 'Muvaffaqiyatli bajarildi',
          }
        }

        // If data is a plain object (single entity response), return as-is
        return data
      }),
    )
  }
}
