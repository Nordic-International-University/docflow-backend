import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsString,
  IsUUID,
  IsEnum,
  IsOptional,
  IsObject,
  MaxLength,
} from 'class-validator'
import { AuditAction } from '../interfaces'

export class AuditLogCreateDto {
  @ApiProperty({
    description: 'The entity type (e.g., User, Document, Role)',
    example: 'Document',
    maxLength: 255,
  })
  @IsString()
  @MaxLength(255)
  entity: string

  @ApiProperty({
    description: 'The UUID of the entity that was affected',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  entityId: string

  @ApiProperty({
    description: 'The action performed',
    enum: AuditAction,
    example: AuditAction.CREATE,
  })
  @IsEnum(AuditAction)
  action: AuditAction

  @ApiPropertyOptional({
    description: 'JSON object containing the changes made',
    example: { status: 'DRAFT' },
  })
  @IsOptional()
  @IsObject()
  changes?: Record<string, any>

  @ApiPropertyOptional({
    description: 'JSON object containing the old values before the change',
    example: { status: 'PENDING' },
  })
  @IsOptional()
  @IsObject()
  oldValues?: Record<string, any>

  @ApiPropertyOptional({
    description: 'JSON object containing the new values after the change',
    example: { status: 'APPROVED' },
  })
  @IsOptional()
  @IsObject()
  newValues?: Record<string, any>

  @ApiPropertyOptional({
    description: 'IP address of the user performing the action',
    example: '192.168.1.1',
    maxLength: 45,
  })
  @IsOptional()
  @IsString()
  @MaxLength(45)
  ipAddress?: string

  @ApiPropertyOptional({
    description: 'User agent string from the request',
    example: 'Mozilla/5.0...',
  })
  @IsOptional()
  @IsString()
  userAgent?: string

  @ApiProperty({
    description: 'UUID of the user who performed the action',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  performedByUserId: string
}
