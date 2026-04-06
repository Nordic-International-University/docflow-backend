import { ApiProperty } from '@nestjs/swagger'

export class DepartmentParentDto {
  @ApiProperty({
    description: 'Parent department ID',
    example: '28709f45-05ba-443f-acae-ae5142b0bf3b',
  })
  id: string

  @ApiProperty({
    description: 'Parent department name',
    example: 'IT Services',
  })
  name: string
}

export class DepartmentDirectorDto {
  @ApiProperty({
    description: 'Director user ID',
    example: 'a695b85d-2245-4f56-b539-fa1fad452df5',
  })
  id: string

  @ApiProperty({
    description: 'Director full name',
    example: 'Admin User',
  })
  fullname: string

  @ApiProperty({
    description: 'Director username',
    example: 'nordicdoc',
  })
  username: string

  @ApiProperty({
    description: 'Director avatar URL',
    example: null,
    nullable: true,
  })
  avatarUrl: string | null
}

export class DepartmentResponseDto {
  @ApiProperty({
    description: 'Department ID',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  id: string

  @ApiProperty({
    description: 'Name of the department',
    example: 'IT Services',
  })
  name: string

  @ApiProperty({
    description: 'Description of the department',
    example: 'Handles all information technology services and support.',
  })
  description: string

  @ApiProperty({
    description: 'Parent department information',
    type: DepartmentParentDto,
    nullable: true,
  })
  parent: DepartmentParentDto | null

  @ApiProperty({
    description: 'Department director information',
    type: DepartmentDirectorDto,
    nullable: true,
  })
  director: DepartmentDirectorDto | null

  @ApiProperty({
    description: 'Department code',
    example: 'IT-001',
  })
  code: string

  @ApiProperty({
    description: 'Department location',
    example: 'Building A, Floor 3',
  })
  location: string
}

export class DepartmentListResponseDto {
  @ApiProperty({
    description: 'Total count of departments',
    example: 100,
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
    description: 'List of departments',
    type: [DepartmentResponseDto],
  })
  data: DepartmentResponseDto[]
}
