import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, MaxLength } from 'class-validator'
import { TaskAttachmentUpdateRequest } from '../interfaces'

export class TaskAttachmentUpdateDto implements Partial<TaskAttachmentUpdateRequest> {
  @ApiProperty({
    description: 'Description of the attachment',
    required: false,
    maxLength: 500,
  })
  @IsString()
  @MaxLength(500)
  @IsOptional()
  description?: string
}
