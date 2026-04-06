import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

export class TaskScoreConfigCreateDto {
  @ApiProperty({
    description: 'Priority level (1-10, 1 is highest)',
    example: 1,
  })
  @IsInt()
  @Min(1)
  @Max(10)
  priorityLevel: number

  @ApiProperty({ description: 'Priority code', example: '№1' })
  @IsString()
  @IsNotEmpty()
  priorityCode: string

  @ApiProperty({ description: 'Base score for this priority', example: 50 })
  @IsInt()
  @Min(1)
  baseScore: number

  @ApiProperty({ description: 'Recommended days to complete', example: 12 })
  @IsInt()
  @Min(1)
  recommendedDays: number

  @ApiProperty({
    description: 'Penalty per day late (negative number)',
    example: -10,
  })
  @IsInt()
  @Max(0)
  penaltyPerDay: number

  @ApiPropertyOptional({
    description: 'Maximum days penalty applies',
    example: 10,
  })
  @IsOptional()
  @IsInt()
  @Min(1)
  maxPenaltyDays?: number

  @ApiProperty({ description: 'Description of this priority level' })
  @IsString()
  @IsNotEmpty()
  description: string

  @ApiPropertyOptional({ description: 'Measurable criteria' })
  @IsOptional()
  @IsString()
  criteria?: string
}
