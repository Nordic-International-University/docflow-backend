import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsUUID } from 'class-validator'
import { TaskWatcherCreateRequest } from '../interfaces'

export class TaskWatcherCreateDto implements Omit<
  TaskWatcherCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'Task ID to watch',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  taskId: string

  @ApiProperty({
    description: 'User ID of the watcher (defaults to current user)',
    example: '550e8400-e29b-41d4-a716-446655440001',
    required: false,
  })
  @IsUUID()
  @IsOptional()
  userId?: string
}
