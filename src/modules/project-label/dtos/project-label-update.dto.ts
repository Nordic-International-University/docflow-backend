import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  Length,
  Matches,
  MaxLength,
} from 'class-validator'
import { ProjectLabelUpdateRequest } from '../interfaces'

export class ProjectLabelUpdateDto implements Partial<ProjectLabelUpdateRequest> {
  @ApiProperty({
    description: 'Label name',
    required: false,
  })
  @IsString()
  @Length(2, 100)
  @IsOptional()
  name?: string

  @ApiProperty({
    description: 'Label color (hex code)',
    required: false,
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  @IsOptional()
  color?: string

  @ApiProperty({
    description: 'Label description',
    required: false,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string
}
