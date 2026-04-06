import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
import { TaskTimeEntryUpdateRequest } from '../interfaces'

export class TaskTimeEntryUpdateDto implements Partial<TaskTimeEntryUpdateRequest> {
  @ApiProperty({
    description: 'Description of work performed',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Hours worked',
    required: false,
    minimum: 0,
  })
  @IsNumber()
  @IsPositive()
  @IsOptional()
  hours?: number

  @ApiProperty({
    description: 'Date of work',
    required: false,
  })
  @IsDateString()
  @IsOptional()
  date?: Date

  @ApiProperty({
    description: 'Whether the time is billable',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isBillable?: boolean
}
