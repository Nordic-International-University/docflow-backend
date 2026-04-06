import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator'
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
    description: 'Comment content',
    example: 'This task needs more clarification',
  })
  @IsString()
  @IsNotEmpty()
  content: string

  @ApiProperty({
    description: 'Parent comment ID for replies',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  parentCommentId?: string
}
