import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskChecklistRetrieveQueryDto {
  @ApiProperty({ description: 'Task ID to filter checklists' })
  @IsUUID()
  taskId: string

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string
}

export class TaskChecklistItemRetrieveQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  search?: string
}

export class TaskChecklistListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class TaskChecklistItemResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  checklistId: string

  @ApiProperty()
  title: string

  @ApiProperty()
  isCompleted: boolean

  @ApiProperty({ required: false })
  completedById?: string

  @ApiProperty({ required: false })
  completedAt?: Date

  @ApiProperty()
  position: number

  @ApiProperty({ required: false })
  completedBy?: {
    id: string
    fullname: string
  }

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class TaskChecklistResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  title: string

  @ApiProperty()
  position: number

  @ApiProperty({ type: [TaskChecklistItemResponseDto] })
  items: TaskChecklistItemResponseDto[]

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
