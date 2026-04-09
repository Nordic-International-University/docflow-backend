import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import { User } from '@prisma/client'
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'

export class UserRetrieveAllDto {
  @ApiPropertyOptional({
    description: 'Page number',
    example: 1,
  })
  @IsOptional()
  @IsString()
  pageNumber?: string

  @ApiPropertyOptional({
    description: 'Page size',
    example: 10,
  })
  @IsOptional()
  @IsString()
  pageSize?: string

  @ApiPropertyOptional({
    description: 'Search by fullname or username',
    example: 'john',
  })
  @IsOptional()
  @IsString()
  search?: string

  @ApiPropertyOptional({
    description: 'Filter by department ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string

  @ApiPropertyOptional({
    description:
      'Filter users that have access to this project (department + members)',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  projectId?: string
}

export class UserResponseDto {
  @ApiProperty({
    description: 'User ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string

  @ApiProperty({
    description: 'Full name of the user',
    example: 'John Doe',
  })
  fullname: string

  @ApiProperty({
    description: 'Username',
    example: 'john_doe',
  })
  username: string

  @ApiPropertyOptional({
    description: 'URL of the user avatar',
    example: 'https://example.com/avatar.jpg',
    nullable: true,
  })
  avatarUrl?: string | null

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
  })
  isActive: boolean

  @ApiPropertyOptional({
    description: 'User role information',
    example: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Administrator',
    },
    nullable: true,
  })
  role?: {
    id: string
    name: string
  } | null

  @ApiPropertyOptional({
    description: 'User department information',
    example: {
      id: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
      name: 'Engineering',
    },
    nullable: true,
  })
  department?: {
    id: string
    name: string
  } | null

  @ApiPropertyOptional({
    description: 'User last login timestamp',
    example: '2023-04-14T10:30:00Z',
    nullable: true,
  })
  lastLogin?: Date | null

  @ApiPropertyOptional({
    description: 'Telegram account link status',
    example: {
      isLinked: true,
      telegramId: '123456789',
    },
    nullable: true,
  })
  telegram?: {
    isLinked: boolean
    telegramId?: string
  }
}

export class UserListResponseDto {
  @ApiProperty({
    description: 'Total count of users',
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
    description: 'Array of users',
    type: [UserResponseDto],
  })
  data: UserResponseDto[]
}
