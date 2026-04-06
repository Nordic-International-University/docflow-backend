import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsEnum, IsOptional, IsString, IsUUID, Length } from 'class-validator'
import { DocumentStatus } from '../interfaces/document-enums'

export class DocumentUpdateDto {
  @ApiPropertyOptional({
    description: 'Title of the document',
    example: 'Q1 Financial Report (Revised)',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  title?: string

  @ApiPropertyOptional({
    description: 'Optional description for the document',
    example:
      'A detailed report of the first quarter financials, with updated figures.',
    maxLength: 500,
  })
  @IsOptional()
  @IsString()
  @Length(0, 500)
  description?: string | null

  @ApiPropertyOptional({
    description: 'Unique document identifier or number',
    example: 'FIN-2024-Q1-001-REV1',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  documentNumber?: string | null

  @ApiPropertyOptional({
    description: 'Status of the document',
    enum: DocumentStatus,
    example: DocumentStatus.PUBLISHED,
  })
  @IsOptional()
  @IsEnum(DocumentStatus)
  status?: DocumentStatus

  @ApiPropertyOptional({
    description: 'ID of the document type',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  documentTypeId?: string

  @ApiPropertyOptional({
    description: 'ID of the journal',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  journalId?: string
}
