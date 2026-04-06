import { ApiProperty } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
  MaxLength,
} from 'class-validator'
import { ProjectLabelCreateRequest } from '../interfaces'

export class ProjectLabelCreateDto implements Omit<
  ProjectLabelCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'Project ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  projectId: string

  @ApiProperty({
    description: 'Label name',
    example: 'Bug',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string

  @ApiProperty({
    description: 'Label color (hex code)',
    example: '#ff4444',
  })
  @IsString()
  @Matches(/^#[0-9A-Fa-f]{6}$/, { message: 'Color must be a valid hex code' })
  color: string

  @ApiProperty({
    description: 'Label description',
    example: 'Bug fixes and issue resolution',
    required: false,
  })
  @IsString()
  @MaxLength(255)
  @IsOptional()
  description?: string
}
