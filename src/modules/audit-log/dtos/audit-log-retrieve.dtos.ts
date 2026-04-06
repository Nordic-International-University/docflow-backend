import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  IsUUID,
  IsEnum,
  IsDateString,
  IsNumberString,
  MaxLength,
} from 'class-validator'
import { AuditAction } from '../interfaces'

export class AuditLogRetrieveAllDto {
  @ApiPropertyOptional({
    description: 'Page number (1-indexed)',
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  pageNumber?: number

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  pageSize?: number

  @ApiPropertyOptional({
    description: 'Search term to filter results',
    example: 'Document',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by entity type',
    example: 'Document',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @MaxLength(255)
  entity?: string

  @ApiPropertyOptional({
    description: 'Filter by entity ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  entityId?: string

  @ApiPropertyOptional({
    description: 'Filter by action type',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @IsOptional()
  @IsEnum(AuditAction)
  action?: AuditAction

  @ApiPropertyOptional({
    description: 'Filter by user who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsOptional()
  @IsUUID()
  performedByUserId?: string

  @ApiPropertyOptional({
    description: 'Filter by start date (ISO 8601 format)',
    example: '2025-01-01T00:00:00Z',
  })
  @IsOptional()
  @IsDateString()
  startDate?: Date

  @ApiPropertyOptional({
    description: 'Filter by end date (ISO 8601 format)',
    example: '2025-12-31T23:59:59Z',
  })
  @IsOptional()
  @IsDateString()
  endDate?: Date
}
