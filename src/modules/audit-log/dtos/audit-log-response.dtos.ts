import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class AuditLogPerformedByDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ example: 'John Doe' })
  fullname: string

  @ApiProperty({ example: 'johndoe' })
  username: string
}

export class AuditLogResponseDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ example: 'Document' })
  entity: string

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  entityId: string

  @ApiProperty({ example: 'CREATE' })
  action: string

  @ApiPropertyOptional({ example: { status: 'DRAFT' } })
  changes: any

  @ApiPropertyOptional({ example: { status: 'PENDING' } })
  oldValues: any

  @ApiPropertyOptional({ example: { status: 'APPROVED' } })
  newValues: any

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress: string | null

  @ApiPropertyOptional({ example: 'Mozilla/5.0...' })
  userAgent: string | null

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  performedByUserId: string

  @ApiProperty({ type: AuditLogPerformedByDto })
  performedBy: AuditLogPerformedByDto

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  performedAt: Date

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  createdAt: Date
}

export class AuditLogListItemDto {
  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  id: string

  @ApiProperty({ example: 'Document' })
  entity: string

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  entityId: string

  @ApiProperty({ example: 'CREATE' })
  action: string

  @ApiProperty({ example: '123e4567-e89b-12d3-a456-426614174000' })
  performedByUserId: string

  @ApiProperty({ type: AuditLogPerformedByDto })
  performedBy: AuditLogPerformedByDto

  @ApiProperty({ example: '2025-01-15T10:30:00Z' })
  performedAt: Date

  @ApiPropertyOptional({ example: '192.168.1.1' })
  ipAddress: string | null

  @ApiPropertyOptional({ example: { status: 'DRAFT' } })
  changes: any
}

export class AuditLogListResponseDto {
  @ApiProperty({ example: 100 })
  count: number

  @ApiProperty({ example: 1 })
  pageNumber: number

  @ApiProperty({ example: 10 })
  pageSize: number

  @ApiProperty({ example: 10 })
  pageCount: number

  @ApiProperty({ type: [AuditLogListItemDto] })
  data: AuditLogListItemDto[]
}
