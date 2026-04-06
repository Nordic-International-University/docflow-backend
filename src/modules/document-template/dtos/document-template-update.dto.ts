import { IsBoolean, IsOptional, IsString } from 'class-validator'
import { DocumentTemplateUpdateRequest } from '../interfaces'
import { ApiProperty } from '@nestjs/swagger'

export class DocumentTemplateUpdateDto implements Omit<
  DocumentTemplateUpdateRequest,
  'id'
> {
  @ApiProperty({
    example: 'Updated Employee Contract',
    description: 'Updated name of the document template',
    required: false,
  })
  @IsOptional()
  @IsString()
  name?: string

  @ApiProperty({
    example: 'Updated description for employee contracts',
    description: 'Updated description of the document template',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Updated template file ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  templateFileId?: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Updated document type ID',
    required: false,
  })
  @IsOptional()
  @IsString()
  documentTypeId?: string

  @ApiProperty({
    example: false,
    description: 'Updated active status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    example: true,
    description: 'Updated public status',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
