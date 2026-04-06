import { ApiProperty } from '@nestjs/swagger'
import { IsUUID } from 'class-validator'
import { TaskLabelCreateRequest } from '../interfaces'

export class TaskLabelCreateDto implements Omit<
  TaskLabelCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'Task ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  taskId: string

  @ApiProperty({
    description: 'Label ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  labelId: string
}
