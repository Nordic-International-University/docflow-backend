import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { DocumentStatus } from '../interfaces/document-enums'
import { DocumentRetrieveOneResponse } from '../interfaces'

class RelatedUserDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string

  @ApiProperty({ example: 'Jane Doe' })
  fullname: string
}

class RelatedTypeDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string

  @ApiProperty({ example: 'Financial Report' })
  name: string
}

class AttachmentDto {
  @ApiProperty({ example: '3fa85f64-5717-4562-b3fc-2c963f66afa6' })
  id: string

  @ApiProperty({ example: 'report.pdf' })
  fileName: string

  @ApiProperty({ example: 'https://example.com/report.pdf' })
  fileUrl: string
}

export class DocumentResponseDto implements DocumentRetrieveOneResponse {
  @ApiProperty({
    description: 'Document ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string

  @ApiProperty({
    description: 'Title of the document',
    example: 'Q1 Financial Report',
  })
  title: string

  @ApiPropertyOptional({
    description: 'Description for the document',
    example: 'A detailed report of the first quarter financials.',
    nullable: true,
  })
  description: string | null

  @ApiPropertyOptional({
    description: 'Unique document identifier or number',
    example: 'FIN-2024-Q1-001',
    nullable: true,
  })
  documentNumber: string | null

  @ApiProperty({
    description: 'Status of the document',
    enum: DocumentStatus,
    example: DocumentStatus.PUBLISHED,
  })
  status: DocumentStatus

  @ApiProperty({ type: RelatedTypeDto })
  documentType: RelatedTypeDto

  @ApiProperty({ type: RelatedTypeDto })
  journal: RelatedTypeDto

  @ApiProperty({ type: RelatedUserDto })
  createdBy: RelatedUserDto

  @ApiPropertyOptional({ type: RelatedUserDto, nullable: true })
  updatedBy: RelatedUserDto | null

  @ApiProperty({ type: [AttachmentDto] })
  attachments: AttachmentDto[]

  @ApiProperty({ example: '2023-04-14T10:30:00Z' })
  createdAt: Date

  @ApiProperty({ example: '2023-04-14T11:00:00Z' })
  updatedAt: Date
}

export class DocumentListResponseDto {
  @ApiProperty({ description: 'Total count of documents', example: 50 })
  count: number

  @ApiProperty({ description: 'Current page number', example: 1 })
  pageNumber: number

  @ApiProperty({ description: 'Number of items per page', example: 10 })
  pageSize: number

  @ApiProperty({ description: 'Total number of pages', example: 5 })
  pageCount: number

  @ApiProperty({
    description: 'Array of documents',
    type: [DocumentResponseDto],
  })
  data: DocumentResponseDto[]
}
