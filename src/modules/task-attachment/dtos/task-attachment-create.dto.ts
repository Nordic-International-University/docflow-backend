import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID, MaxLength } from 'class-validator'
import { TaskAttachmentCreateRequest } from '../interfaces'

export class TaskAttachmentCreateDto implements Omit<
  TaskAttachmentCreateRequest,
  'uploadedById'
> {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  taskId: string

  @ApiProperty({
    description: 'Attachment ID',
    example: '123e4567-e89b-12d3-a456-426614174001',
  })
  @IsUUID()
  attachmentId: string

  @ApiProperty({
    description: 'Description of the attachment',
    example: 'Screenshot of the bug',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string
}
