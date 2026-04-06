import { ApiPropertyOptional } from '@nestjs/swagger'
import { Transform } from 'class-transformer'
import { IsOptional, IsString, Length, IsUUID } from 'class-validator'
import { DepartmentUpdateRequest } from '../interfaces'

export class DepartmentUpdateDto implements Omit<
  DepartmentUpdateRequest,
  'id'
> {
  @ApiPropertyOptional({
    description: 'Name of the department',
    example: 'Finance Department',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  name?: string

  @ApiPropertyOptional({
    description: 'Description of the department',
    example: 'Manages financial operations and budgeting.',
    minLength: 2,
    maxLength: 1000,
  })
  @IsOptional()
  @IsString()
  @Length(2, 1000)
  description?: string

  @ApiPropertyOptional({
    description: 'ID of the head of the department',
    example: 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUUID()
  parentId?: string

  @ApiPropertyOptional({
    description: 'ID of the director of the department',
    example: 'p5o4n3m2-l1k0-j9i8-h7g6-f5e4d3c2b1a0',
  })
  @Transform(({ value }) => (value === '' ? undefined : value))
  @IsOptional()
  @IsUUID()
  directorId?: string

  @ApiPropertyOptional({
    description: 'Unique code for the department',
    example: 'FIN-001',
    minLength: 2,
    maxLength: 50,
  })
  @IsOptional()
  @IsString()
  @Length(2, 50)
  code?: string

  @ApiPropertyOptional({
    description: 'Location of the department',
    example: 'Building A, Floor 3',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  location?: string
}
