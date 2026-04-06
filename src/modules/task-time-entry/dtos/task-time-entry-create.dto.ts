import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
} from 'class-validator'
import { TaskTimeEntryCreateRequest } from '../interfaces'

export class TaskTimeEntryCreateDto implements Omit<
  TaskTimeEntryCreateRequest,
  'userId' | 'createdBy'
> {
  @ApiProperty({
    description: 'Task ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  taskId: string

  @ApiProperty({
    description: 'Description of work performed',
    example: 'Implemented authentication flow',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Hours worked',
    example: 2.5,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  hours: number

  @ApiProperty({
    description: 'Date of work',
    example: '2024-01-15',
  })
  @IsDateString()
  date: Date

  @ApiProperty({
    description: 'Whether the time is billable',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean
}
