import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsDateString, IsEnum, IsInt, Min } from 'class-validator'
import { Type } from 'class-transformer'

export enum TimeRange {
  TODAY = 'TODAY',
  WEEK = 'WEEK',
  MONTH = 'MONTH',
  QUARTER = 'QUARTER',
  YEAR = 'YEAR',
  CUSTOM = 'CUSTOM',
}

export class AnalyticsQueryDto {
  @ApiPropertyOptional({
    description: 'Predefined time range for analytics',
    enum: TimeRange,
    example: TimeRange.MONTH,
  })
  @IsOptional()
  @IsEnum(TimeRange)
  timeRange?: TimeRange

  @ApiPropertyOptional({
    description: 'Start date for custom time range (ISO 8601 format)',
    example: '2025-01-01T00:00:00.000Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: string

  @ApiPropertyOptional({
    description: 'End date for custom time range (ISO 8601 format)',
    example: '2025-01-31T23:59:59.999Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: string

  @ApiPropertyOptional({
    description: 'Department ID to filter analytics',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  departmentId?: number

  @ApiPropertyOptional({
    description: 'User ID to filter analytics',
    example: 1,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  userId?: number
}
