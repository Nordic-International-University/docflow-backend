import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsOptional,
  IsString,
  Length,
  Matches,
} from 'class-validator'
import { TaskCategoryUpdateRequest } from '../interfaces'

export class TaskCategoryUpdateDto implements Partial<TaskCategoryUpdateRequest> {
  @ApiProperty({
    description: 'Category name',
    required: false,
  })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  name?: string

  @ApiProperty({
    description: 'Category description',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string

  @ApiProperty({
    description: 'Category color (hex code)',
    required: false,
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  @IsOptional()
  color?: string

  @ApiProperty({
    description: 'Whether category is active',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
