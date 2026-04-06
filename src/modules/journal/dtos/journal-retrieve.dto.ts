import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class JournalResponseDto {
  @ApiProperty({
    description: 'Journal ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string

  @ApiProperty({
    description: 'Name of the journal',
    example: 'General Ledger',
  })
  name: string

  @ApiProperty({
    description: 'Prefix for journal entries',
    example: 'HR',
  })
  prefix: string

  @ApiProperty({
    description: 'Format for journal entry numbering',
    example: '{YEAR}-{CODE}-{NUMBER}',
  })
  format: string

  @ApiPropertyOptional({
    description: 'Department information',
    example: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Finance',
    },
    nullable: true,
  })
  department?: {
    id: string
    name: string
  } | null

  @ApiPropertyOptional({
    description: 'Responsible user information',
    example: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      fullname: 'John Doe',
      username: 'john_doe',
    },
    nullable: true,
  })
  responsibleUser?: {
    id: string
    fullname: string
    username: string
  } | null

  @ApiProperty({
    description: 'Format for journal entry numbering',
    example: '234',
  })
  documentsCount: number
}

export class JournalListResponseDto {
  @ApiProperty({
    description: 'Total count of journals',
    example: 50,
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
    example: 5,
  })
  pageCount: number

  @ApiProperty({
    description: 'Array of journals',
    type: [JournalResponseDto],
  })
  data: JournalResponseDto[]
}
