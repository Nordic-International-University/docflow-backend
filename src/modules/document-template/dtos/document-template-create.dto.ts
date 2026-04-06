import {
  IsBoolean,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsObject,
} from 'class-validator'
import { DocumentTemplateCreateRequest } from '../interfaces'
import { ApiProperty } from '@nestjs/swagger'

export class DocumentTemplateCreateDto implements DocumentTemplateCreateRequest {
  @ApiProperty({
    example: 'Employee Contract',
    description: 'Name of the document template',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: 'Template for employee contracts',
    description: 'Description of the document template',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the document type',
  })
  @IsNotEmpty()
  @IsString()
  documentTypeId: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the template file',
  })
  @IsNotEmpty()
  @IsString()
  templateFileId: string

  @ApiProperty({
    example: {
      employeeName: 'string',
      position: 'string',
      startDate: 'string',
      salary: 'number',
    },
    description:
      'Required tags for the template (key-value pairs that define placeholders in the template)',
    required: false,
  })
  @IsOptional()
  @IsObject()
  requiredTags?: Record<string, any>

  @ApiProperty({
    example: true,
    description: 'Whether the template is active',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean

  @ApiProperty({
    example: false,
    description: 'Whether the template is public',
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  isPublic?: boolean
}
