import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class TaskCommentUpdateDto {
  @ApiProperty({
    description: 'Comment content',
    example: 'Updated comment content',
  })
  @IsString()
  @IsNotEmpty()
  content: string
}
