import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsNumber,
  IsOptional,
  Min,
  Max,
  ArrayMaxSize,
} from 'class-validator'

export class NotificationSettingsDto {
  @ApiPropertyOptional({
    description: 'Workflow deadline oldidan ogohlantirish (daqiqalarda)',
    example: [1440, 120, 30],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(5, { each: true })
  @Max(43200, { each: true }) // max 30 kun
  @ArrayMaxSize(10)
  workflowReminders?: number[]

  @ApiPropertyOptional({
    description: 'Task deadline oldidan ogohlantirish (daqiqalarda)',
    example: [1440, 60],
    type: [Number],
  })
  @IsOptional()
  @IsArray()
  @IsNumber({}, { each: true })
  @Min(5, { each: true })
  @Max(43200, { each: true })
  @ArrayMaxSize(10)
  taskReminders?: number[]

  @ApiPropertyOptional({
    description: 'In-app notification yoqilganmi',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  inAppEnabled?: boolean

  @ApiPropertyOptional({
    description: 'Telegram notification yoqilganmi',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  telegramEnabled?: boolean

  @ApiPropertyOptional({
    description: 'Muddati o\'tganida xabar berishmi',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnExpired?: boolean

  @ApiPropertyOptional({
    description: 'Muddatdan oldin ogohlantirish',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  notifyOnApproaching?: boolean
}

export class NotificationSettingsResponseDto {
  @ApiProperty({ example: [1440, 120] })
  workflowReminders: number[]

  @ApiProperty({ example: [1440, 60] })
  taskReminders: number[]

  @ApiProperty({ example: true })
  inAppEnabled: boolean

  @ApiProperty({ example: true })
  telegramEnabled: boolean

  @ApiProperty({ example: true })
  notifyOnExpired: boolean

  @ApiProperty({ example: true })
  notifyOnApproaching: boolean

  @ApiPropertyOptional({
    description: 'Reminder oynalari odam tilida',
    example: {
      workflow: ['1 kun oldin', '2 soat oldin'],
      task: ['1 kun oldin', '1 soat oldin'],
    },
  })
  readableReminders?: {
    workflow: string[]
    task: string[]
  }
}
