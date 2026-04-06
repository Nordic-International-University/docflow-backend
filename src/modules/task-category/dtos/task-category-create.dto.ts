import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator'
import { TaskCategoryCreateRequest } from '../interfaces'

export class TaskCategoryCreateDto implements Omit<
  TaskCategoryCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'Category name',
    example: 'Bug',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string

  @ApiProperty({
    description: 'Category description',
    example: 'Bug fixes and issue resolution',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Category color (hex code)',
    example: '#ff4444',
    required: false,
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  @IsOptional()
  color?: string

  @ApiProperty({
    description: 'Whether category is active',
    example: true,
    required: false,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
