import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  IsArray,
} from 'class-validator'
import { TaskCommentCreateRequest } from '../interfaces'

export class TaskCommentCreateDto implements Omit<
  TaskCommentCreateRequest,
  'userId'
> {
  @ApiProperty({
    description: 'Task ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  @IsNotEmpty()
  taskId: string

  @ApiProperty({
    description: "Izoh matni (fayl yuborilganda bo'sh bo'lishi mumkin)",
    example: "Bu topshiriqqa qo'shimcha ma'lumot kerak",
  })
  @IsString()
  @IsOptional()
  content?: string

  @ApiPropertyOptional({
    description: 'Javob berilayotgan izoh ID (reply uchun)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string

  @ApiPropertyOptional({
    description:
      'Biriktiriladigan fayllar ID lari (rasm, video, ovozli xabar). Avval /attachment ga yuklang.',
    type: [String],
    example: ['550e8400-e29b-41d4-a716-446655440002'],
  })
  @IsOptional()
  @IsArray()
  @IsUUID('4', { each: true })
  attachmentIds?: string[]
}
