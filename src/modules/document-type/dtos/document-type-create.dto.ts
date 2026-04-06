import { ApiProperty } from '@nestjs/swagger'
import { IsOptional, IsString, Length, IsBoolean } from 'class-validator'
import { DocumentTypeCreateRequest } from '../interfaces'

export class DocumentTypeCreateDto implements DocumentTypeCreateRequest {
  @ApiProperty({
    description: 'Name of the document type',
    example: 'Contract Agreement',
    minLength: 2,
    maxLength: 100,
  })
  @IsString()
  @Length(2, 100)
  name: string

  @ApiProperty({
    description: 'Description of the document type',
    example: 'Legal contracts and agreement documents',
    minLength: 2,
    maxLength: 255,
  })
  @IsString()
  @Length(2, 255)
  description: string

  @ApiProperty({
    description: 'Whether the document type is active',
    example: true,
    default: true,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean
}
