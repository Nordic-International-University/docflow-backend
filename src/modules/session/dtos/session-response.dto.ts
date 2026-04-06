import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'

export class SessionItemDto {
  @ApiProperty({
    description: 'Sessiya IDsi',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string

  @ApiPropertyOptional({
    description: 'IP manzil',
    example: '192.168.1.1',
  })
  ipAddress: string | null

  @ApiPropertyOptional({
    description: "Brauzer/qurilma ma'lumoti",
    example: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
  })
  userAgent: string | null

  @ApiProperty({
    description: 'Sessiya yaratilgan vaqt',
    example: '2024-01-15T10:30:00.000Z',
  })
  createdAt: Date

  @ApiProperty({
    description: 'Sessiya tugash vaqti',
    example: '2024-01-22T10:30:00.000Z',
  })
  expiresAt: Date
}

export class SessionListResponseDto {
  @ApiProperty({
    description: 'Jami sessiyalar soni',
    example: 5,
  })
  count: number

  @ApiProperty({
    description: 'Joriy sahifa raqami',
    example: 1,
  })
  pageNumber: number

  @ApiProperty({
    description: 'Sahifadagi elementlar soni',
    example: 10,
  })
  pageSize: number

  @ApiProperty({
    description: 'Jami sahifalar soni',
    example: 1,
  })
  pageCount: number

  @ApiProperty({
    description: "Sessiyalar ro'yxati",
    type: [SessionItemDto],
  })
  data: SessionItemDto[]
}
