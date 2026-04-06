import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator'
import { Transform } from 'class-transformer'

export class UserMonthlyKpiRetrieveQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @IsUUID()
  departmentId?: string

  @ApiPropertyOptional({ description: 'Filter by year', example: 2024 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  year?: number

  @ApiPropertyOptional({ description: 'Filter by month (1-12)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => parseInt(value, 10))
  month?: number

  @ApiPropertyOptional({ description: 'Filter by finalized status' })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === 'true' || value === true)
  isFinalized?: boolean

  @ApiPropertyOptional({ description: 'Page number', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Transform(({ value }) => parseInt(value, 10))
  pageNumber?: number

  @ApiPropertyOptional({ description: 'Page size', example: 10 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  pageSize?: number
}

export class LeaderboardQueryDto {
  @ApiPropertyOptional({ description: 'Year', example: 2024 })
  @IsOptional()
  @IsInt()
  @Transform(({ value }) => parseInt(value, 10))
  year?: number

  @ApiPropertyOptional({ description: 'Month (1-12)', example: 1 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(12)
  @Transform(({ value }) => parseInt(value, 10))
  month?: number

  @ApiPropertyOptional({ description: 'Filter by department ID' })
  @IsOptional()
  @IsUUID()
  departmentId?: string

  @ApiPropertyOptional({ description: 'Limit results', example: 50 })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(100)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number
}

export class UserKpiHistoryQueryDto {
  @ApiPropertyOptional({ description: 'User ID (defaults to current user)' })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiPropertyOptional({
    description: 'Number of months to retrieve',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  @Max(24)
  @Transform(({ value }) => parseInt(value, 10))
  limit?: number
}
