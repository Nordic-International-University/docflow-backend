import { ApiProperty } from '@nestjs/swagger'
import {
  IsDateString,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator'
import { Type } from 'class-transformer'

export class TaskActivityRetrieveQueryDto {
  @ApiProperty({ required: true, description: 'Task ID to filter activities' })
  @IsUUID()
  taskId: string

  @ApiProperty({ required: false, description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiProperty({
    required: false,
    description:
      'Filter by action type (e.g., CREATED, UPDATED, STATUS_CHANGED)',
  })
  @IsOptional()
  @IsString()
  action?: string

  @ApiProperty({
    required: false,
    description: 'Filter activities from this date',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiProperty({
    required: false,
    description: 'Filter activities until this date',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number
}

export class TaskActivityUserDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  fullname: string

  @ApiProperty()
  @ApiProperty()
  email: string
}

export class TaskActivityResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  action: string

  @ApiProperty({ required: false })
  changes?: Record<string, any>

  @ApiProperty({ required: false })
  metadata?: Record<string, any>

  @ApiProperty({ type: TaskActivityUserDto })
  user: TaskActivityUserDto

  @ApiProperty()
  createdAt: Date
}

export class TaskActivityListResponseDto {
  @ApiProperty({ type: [TaskActivityResponseDto] })
  data: TaskActivityResponseDto[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}
