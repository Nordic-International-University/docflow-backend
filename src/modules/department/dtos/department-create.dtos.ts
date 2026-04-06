import { ApiProperty } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsString, Length } from 'class-validator'
import { DepartmentCreateRequest } from '../interfaces'

export class DepartmentCreateDto implements DepartmentCreateRequest {
  @ApiProperty({
    description: 'Name of the department',
    example: 'IT Services',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @Length(2, 255)
  name: string

  @ApiProperty({
    description: 'Description of the department',
    example: 'Handles all information technology services and support.',
    minLength: 2,
    maxLength: 1000,
  })
  @IsString()
  @Length(2, 1000)
  description: string

  @ApiProperty({
    description: 'Department code/identifier',
    example: 'ITD',
    minLength: 2,
    maxLength: 1000,
  })
  @IsString()
  @Length(2, 1000)
  code: string

  @ApiProperty({
    description: 'ID of the parent department (for hierarchical structure)',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @IsOptional()
  parentId?: string

  @ApiProperty({
    description: 'Physical or virtual location of the department',
    example: 'Building A, Floor 3',
    required: false,
  })
  @IsString()
  @IsOptional()
  location?: string

  @ApiProperty({
    description: 'ID of the department director/head',
    example: 'b2c3d4e5-f6g7-8h9i-0j1k-l2m3n4o5p6q7',
    required: false,
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsString()
  @IsOptional()
  directorId?: string
}
