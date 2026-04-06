import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

export class TaskScoreConfigUpdateDto {
  @ApiPropertyOptional({ description: 'Priority code', example: '№1' })
  @IsOptional()
  @IsString()
  priorityCode?: string

  @ApiPropertyOptional({
    description: 'Base score for this priority',
    example: 50,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  baseScore?: number

  @ApiPropertyOptional({
    description: 'Recommended days to complete',
    example: 12,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  recommendedDays?: number

  @ApiPropertyOptional({
    description: 'Penalty per day late (negative number)',
    example: -10,
  })
  @IsOptional()
  @IsInt()
  @Max(0)
  penaltyPerDay?: number

  @ApiPropertyOptional({
    description: 'Maximum days penalty applies',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPenaltyDays?: number

  @ApiPropertyOptional({ description: 'Description of this priority level' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({ description: 'Measurable criteria' })
  @IsOptional()
  @IsString()
  criteria?: string

  @ApiPropertyOptional({ description: 'Is active' })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
