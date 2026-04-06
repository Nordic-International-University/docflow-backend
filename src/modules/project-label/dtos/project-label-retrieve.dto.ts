import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class ProjectLabelRetrieveQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string

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

export class ProjectLabelListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class ProjectLabelResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  projectId: string

  @ApiProperty()
  name: string

  @ApiProperty()
  color: string

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty({ required: false })
  taskCount?: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
