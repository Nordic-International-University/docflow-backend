import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString, IsUUID } from 'class-validator'
import { TaskDependencyCreateRequest } from '../interfaces'

export class TaskDependencyCreateDto implements Omit<
  TaskDependencyCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'The dependent task ID (task that depends on another)',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  taskId: string

  @ApiProperty({
    description: 'The blocking task ID (task that must be completed first)',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  dependsOnTaskId: string
}
