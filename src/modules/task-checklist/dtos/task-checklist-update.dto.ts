import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsInt,
  IsOptional,
  IsString,
  Length,
  Min,
} from 'class-validator'
import {
  TaskChecklistUpdateRequest,
  TaskChecklistItemUpdateRequest,
} from '../interfaces'

export class TaskChecklistUpdateDto implements Partial<TaskChecklistUpdateRequest> {
  @ApiProperty({
    description: 'Checklist title',
    required: false,
  })
  @IsString()
  @Length(2, 255)
  @IsOptional()
  title?: string

  @ApiProperty({
    description: 'Position in the list',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number
}

export class TaskChecklistItemUpdateDto implements Partial<TaskChecklistItemUpdateRequest> {
  @ApiProperty({
    description: 'Item title',
    required: false,
  })
  @IsString()
  @Length(2, 500)
  @IsOptional()
  title?: string

  @ApiProperty({
    description: 'Whether the item is completed',
    required: false,
  })
  @IsBoolean()
  @IsOptional()
  isCompleted?: boolean

  @ApiProperty({
    description: 'Position in the checklist',
    required: false,
  })
  @IsInt()
  @Min(0)
  @IsOptional()
  position?: number
}
