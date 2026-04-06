import { ApiProperty } from '@nestjs/swagger'
import { IsBoolean, IsNumber, IsOptional, IsString } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskCategoryRetrieveQueryDto {
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

  @ApiProperty({ required: false })
  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  isActive?: boolean
}

export class TaskCategoryListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class TaskCategoryResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty({ required: false })
  color?: string

  @ApiProperty()
  isActive: boolean

  @ApiProperty({ required: false })
  taskCount?: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
