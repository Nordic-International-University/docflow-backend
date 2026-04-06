import { ApiProperty } from '@nestjs/swagger'

export class DocumentTypeResponseDto {
  @ApiProperty({
    description: 'Document type ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string

  @ApiProperty({
    description: 'Name of the document type',
    example: 'Contract Agreement',
  })
  name: string

  @ApiProperty({
    description: 'Description of the document type',
    example: 'Legal contracts and agreement documents',
  })
  description: string

  @ApiProperty({
    description: 'Whether the document type is active',
    example: true,
  })
  isActive: boolean
}

export class DocumentTypeListResponseDto {
  @ApiProperty({
    description: 'Total count of document types',
    example: 50,
  })
  count: number

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  pageNumber: number

  @ApiProperty({
    description: 'Page size',
    example: 10,
  })
  pageSize: number

  @ApiProperty({
    description: 'List of document types',
    type: [DocumentTypeResponseDto],
  })
  data: DocumentTypeResponseDto[]
}
