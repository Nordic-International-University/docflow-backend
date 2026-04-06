import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsOptional, IsString, IsUUID, Length } from 'class-validator'

export class JournalUpdateDto {
  @ApiPropertyOptional({
    description: 'Name of the journal',
    example: 'General Ledger Updated',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  name?: string

  @ApiPropertyOptional({
    description: 'Prefix for journal entries',
    example: 'HR',
    minLength: 1,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(1, 255)
  prefix?: string

  @ApiPropertyOptional({
    description: 'Format for journal entry numbering',
    example: '{YEAR}-{CODE}-{NUMBER}',
    minLength: 1,
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(1, 100)
  format?: string

  @ApiPropertyOptional({
    description: 'Department ID associated with the journal',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string | null

  @ApiPropertyOptional({
    description: 'Responsible user ID for the journal',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  responsibleUserId?: string | null
}
