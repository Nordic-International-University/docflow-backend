import { IsNotEmpty, IsString } from 'class-validator'
import { DocumentTemplateDeleteRequest } from '../interfaces'
import { ApiProperty } from '@nestjs/swagger'

export class DocumentTemplateDeleteDto implements DocumentTemplateDeleteRequest {
  @ApiProperty({
    example: '123e4567-e89b-12d3-a456-426614174000',
    description: 'ID of the document template to delete',
  })
  @IsNotEmpty()
  @IsString()
  id: string
}
