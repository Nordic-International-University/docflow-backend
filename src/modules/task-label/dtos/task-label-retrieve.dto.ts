import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskLabelRetrieveQueryDto {
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
  labelId?: string
}

export class TaskLabelLabelDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ required: false })
  color?: string
}

export class TaskLabelListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class TaskLabelResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  labelId: string

  @ApiProperty({ type: TaskLabelLabelDto })
  label: TaskLabelLabelDto

  @ApiProperty()
  createdAt: Date
}
