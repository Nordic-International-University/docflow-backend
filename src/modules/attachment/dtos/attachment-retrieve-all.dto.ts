// attachment-retrieve.dtos.ts
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional } from 'class-validator'

export class AttachmentResponseDto {
  @ApiProperty({
    description: 'Attachment ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string

  @ApiProperty({
    description: 'File name of the attachment',
    example: 'document.pdf',
  })
  fileName: string

  @ApiProperty({
    description: 'URL where the file is stored',
    example: 'https://example.com/files/document.pdf',
  })
  fileUrl: string

  @ApiProperty({
    description: 'File size in bytes',
    example: 1024000,
  })
  fileSize: number

  @ApiProperty({
    description: 'MIME type of the file',
    example: 'application/pdf',
  })
  mimeType: string

  @ApiPropertyOptional({
    description: 'Document information',
    example: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      title: 'Project Report',
    },
    nullable: true,
  })
  document?: {
    id: string
    title: string
  } | null

  @ApiPropertyOptional({
    description: 'User who uploaded the attachment',
    example: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      fullname: 'John Doe',
      username: 'john_doe',
    },
    nullable: true,
  })
  uploadedBy?: {
    id: string
    fullname: string
    username: string
  } | null

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2023-04-14T10:30:00Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2023-04-14T10:30:00Z',
  })
  updatedAt: Date

  @ApiPropertyOptional({
    description: 'Deletion timestamp',
    example: '2023-04-14T10:30:00Z',
    nullable: true,
  })
  deletedAt?: Date | null
}

export class AttachmentListResponseDto {
  @ApiProperty({
    description: 'Total count of attachments',
    example: 100,
  })
  count: number

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  pageNumber: number

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  pageSize: number

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  pageCount: number

  @ApiProperty({
    description: 'Array of attachments',
    type: [AttachmentResponseDto],
  })
  data: AttachmentResponseDto[]
}

export class AttachmentRetrieveAllDto {
  @ApiPropertyOptional({
    description: 'Page number for pagination',
    example: 1,
    default: 1,
  })
  @IsOptional()
  pageNumber?: number

  @ApiPropertyOptional({
    description: 'Number of items per page',
    example: 10,
    default: 10,
  })
  @IsOptional()
  pageSize?: number

  @ApiPropertyOptional({
    description: 'Search term for file name',
    example: 'document',
  })
  @IsOptional()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by document ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  documentId?: string

  @ApiPropertyOptional({
    description: 'Filter by uploaded user ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  uploadedById?: string
}
