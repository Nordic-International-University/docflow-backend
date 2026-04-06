import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskWatcherRetrieveQueryDto {
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
}

export class TaskWatcherUserResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  fullname: string

  @ApiProperty()
  @ApiProperty()
  email: string
}

export class TaskWatcherListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class TaskWatcherResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  userId: string

  @ApiProperty({ type: TaskWatcherUserResponseDto })
  user: TaskWatcherUserResponseDto

  @ApiProperty()
  createdAt: Date
}
