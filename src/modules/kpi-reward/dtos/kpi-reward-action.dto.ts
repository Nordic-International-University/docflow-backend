import { ApiPropertyOptional } from '@nestjs/swagger'
import { IsNotEmpty, IsOptional, IsString } from 'class-validator'

export class KpiRewardActionDto {
  @ApiPropertyOptional({ description: 'Notes for this action' })
  @IsOptional()
  @IsString()
  notes?: string
}

export class KpiRewardRejectDto {
  @ApiPropertyOptional({ description: 'Reason for rejection' })
  @IsString()
  @IsNotEmpty()
  notes: string
}
