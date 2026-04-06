import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsInt, IsOptional, IsUUID, Max, Min } from 'class-validator'
import { Transform } from 'class-transformer'

export class KpiRewardRetrieveQueryDto {
  @ApiPropertyOptional({ description: 'Filter by user ID' })
  @IsOptional()
  @IsUUID()
  userId?: string

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

  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['PENDING', 'APPROVED', 'PAID', 'REJECTED'],
  })
  @IsOptional()
  @IsEnum(['PENDING', 'APPROVED', 'PAID', 'REJECTED'])
  status?: string

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
