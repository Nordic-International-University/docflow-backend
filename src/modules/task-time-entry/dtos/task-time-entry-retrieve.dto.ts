import { ApiProperty } from '@nestjs/swagger'
import {
  IsBoolean,
  IsDateString,
  IsNumber,
  IsOptional,
  IsUUID,
} from 'class-validator'
import { Type } from 'class-transformer'

export class TaskTimeEntryRetrieveQueryDto {
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
  @IsUUID()
  taskId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateFrom?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsDateString()
  dateTo?: Date

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isBillable?: boolean
}

export class TaskTimeEntryUserDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  fullname: string

  @ApiProperty()
  username: string
}

export class TaskTimeEntryTaskDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  title: string
}

export class TaskTimeEntryResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  userId: string

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty()
  hours: number

  @ApiProperty()
  date: Date

  @ApiProperty()
  isBillable: boolean

  @ApiProperty({ type: TaskTimeEntryUserDto })
  user: TaskTimeEntryUserDto

  @ApiProperty({ type: TaskTimeEntryTaskDto })
  task: TaskTimeEntryTaskDto

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class TaskTimeEntryListResponseDto {
  @ApiProperty({ type: [TaskTimeEntryResponseDto] })
  data: TaskTimeEntryResponseDto[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}
