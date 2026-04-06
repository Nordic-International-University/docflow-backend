// attachment-create.dtos.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
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

export class AttachmentCreateDto {
  @ApiProperty({
    description: 'File name of the attachment',
    example: 'document.pdf',
    minLength: 1,
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  fileName: string

  @ApiProperty({
    description: 'URL where the file is stored',
    example: 'https://example.com/files/document.pdf',
    maxLength: 255,
  })
  @IsString()
  @Length(1, 255)
  fileUrl: string

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
    minimum: 1,
  })
  @IsInt()
  @IsPositive()
  @Min(1)
  fileSize: number

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
    maxLength: 100,
  })
  @IsString()
  @Length(1, 100)
  mimeType: string

  @ApiPropertyOptional({
    description: 'Document ID that this attachment belongs to',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  documentId?: string

  @ApiPropertyOptional({
    description: 'User ID who uploaded the attachment',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  uploadedById?: string
}
