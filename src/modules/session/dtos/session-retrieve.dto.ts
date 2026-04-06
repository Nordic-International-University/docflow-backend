import { IsOptional, IsNumberString } from 'class-validator'
import { ApiPropertyOptional } from '@nestjs/swagger'

export class SessionRetrieveAllDto {
  @ApiPropertyOptional({
    description: 'Sahifa raqami',
    example: 1,
  })
  @IsOptional()
  @IsNumberString()
  pageNumber?: number

  @ApiPropertyOptional({
    description: 'Sahifadagi elementlar soni',
    example: 10,
  })
  @IsOptional()
  @IsNumberString()
  pageSize?: number
}
