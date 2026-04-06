import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsOptional,
  IsString,
  Length,
  IsBoolean,
  IsUUID,
} from 'class-validator'
import { DocumentTypeUpdateRequest } from '../interfaces'

export class DocumentTypeUpdateDto implements Omit<
  DocumentTypeUpdateRequest,
  'id'
> {
  @ApiPropertyOptional({
    description: 'Name of the document type',
    example: 'Updated Contract Agreement',
    minLength: 2,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(2, 100)
  name?: string

  @ApiPropertyOptional({
    description: 'Description of the document type',
    example: 'Updated description for legal contracts',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  description?: string

  @ApiPropertyOptional({
    description: 'Whether the document type is active',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
