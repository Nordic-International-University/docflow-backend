import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsPositive,
  IsString,
} from 'class-validator'
import { DocumentTemplateRetrieveAllRequest } from '../interfaces'
import { Type } from 'class-transformer'
import { ApiProperty } from '@nestjs/swagger'

export class DocumentTemplateRetrieveAllDto implements DocumentTemplateRetrieveAllRequest {
  @ApiProperty({
    example: 1,
    description: 'Page number for pagination',
    required: false,
  })
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  pageNumber?: number

  @ApiProperty({
    example: 10,
    description: 'Number of items per page',
    required: false,
  })
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  pageSize?: number

  @ApiProperty({
    example: 'contract',
    description: 'Search term for template name or description',
    required: false,
  })
  @IsString()
  @IsOptional()
  search?: string

  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'Filter by document type ID',
    required: false,
  })
  @IsString()
  @IsOptional()
  documentTypeId?: string

  @ApiProperty({
    example: true,
    description: 'Filter by active status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isActive?: boolean

  @ApiProperty({
    example: false,
    description: 'Filter by public status',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isPublic?: boolean
}
