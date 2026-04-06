import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsNumber,
  IsOptional,
  IsString,
  Max,
  Min,
} from 'class-validator'

export class KpiRewardTierCreateDto {
  @ApiProperty({ description: 'Minimum score for this tier', example: 85 })
  @IsInt()
  @Min(0)
  @Max(100)
  minScore: number

  @ApiProperty({ description: 'Maximum score for this tier', example: 95 })
  @IsInt()
  @Min(0)
  @Max(100)
  maxScore: number

  @ApiPropertyOptional({ description: 'Reward in BHM units', example: 10 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardBhm?: number

  @ApiPropertyOptional({
    description: 'Reward amount in local currency',
    example: 3750000,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  rewardAmount?: number

  @ApiPropertyOptional({
    description: 'Is this a penalty tier',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  isPenalty?: boolean

  @ApiPropertyOptional({ description: 'Type of penalty', example: 'WARNING' })
  @IsOptional()
  @IsString()
  penaltyType?: string

  @ApiProperty({ description: 'Tier name', example: 'Yaxshi' })
  @IsString()
  @IsNotEmpty()
  name: string

  @ApiPropertyOptional({ description: 'Tier description' })
  @IsOptional()
  @IsString()
  description?: string

  @ApiPropertyOptional({
    description: 'Color for UI display',
    example: '#90EE90',
  })
  @IsOptional()
  @IsString()
  color?: string
}
