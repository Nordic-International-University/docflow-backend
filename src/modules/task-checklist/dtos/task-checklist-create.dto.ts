import { ApiProperty } from '@nestjs/swagger'
import {
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Min,
} from 'class-validator'
import {
  TaskChecklistCreateRequest,
  TaskChecklistItemCreateRequest,
} from '../interfaces'

export class TaskChecklistCreateDto implements Omit<
  TaskChecklistCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  taskId: string

  @ApiProperty({
    description: 'Checklist title',
    example: 'Development Tasks',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @Length(2, 255)
  title: string

  @ApiProperty({
    description: 'Position in the list',
    example: 0,
    required: false,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number
}

export class TaskChecklistItemCreateDto implements Omit<
  TaskChecklistItemCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'Checklist ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  checklistId: string

  @ApiProperty({
    description: 'Item title',
    example: 'Complete unit tests',
    minLength: 2,
    maxLength: 500,
  })
  @IsString()
  @Length(2, 500)
  title: string

  @ApiProperty({
    description: 'Position in the checklist',
    example: 0,
    required: false,
    default: 0,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number
}
