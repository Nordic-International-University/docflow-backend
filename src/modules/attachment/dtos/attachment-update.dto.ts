// attachment-update.dtos.ts
import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
  IsUUID,
  Length,
  Max,
  Min,
} from 'class-validator'

export class AttachmentUpdateDto {
  @ApiPropertyOptional({
    description: 'File name of the attachment',
    example: 'updated-document.pdf',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  fileName?: string

  @ApiPropertyOptional({
    description: 'URL where the file is stored',
    example: 'https://example.com/files/updated-document.pdf',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  fileUrl?: string

  @ApiPropertyOptional({
    description: 'File size in bytes',
    example: 2048000,
    minimum: 1,
  })
  @IsOptional()
  @IsInt()
  @IsPositive()
  @Min(1)
  fileSize?: number

  @ApiPropertyOptional({
    description: 'MIME type of the file',
    example: 'application/pdf',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  mimeType?: string

  @ApiPropertyOptional({
    description: 'Document ID that this attachment belongs to',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  documentId?: string | null

  @ApiPropertyOptional({
    description: 'User ID who uploaded the attachment',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  uploadedById?: string | null
}
