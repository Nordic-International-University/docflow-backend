import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskDependencyRetrieveQueryDto {
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

  @ApiProperty({ required: false, description: 'Filter by dependent task ID' })
  @IsOptional()
  @IsString()
  @IsUUID()
  taskId?: string

  @ApiProperty({ required: false, description: 'Filter by blocking task ID' })
  @IsOptional()
  @IsString()
  @IsUUID()
  dependsOnTaskId?: string
}

export class TaskDependencyListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class TaskDependencyResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  dependsOnTaskId: string

  @ApiProperty()
  task: {
    id: string
    title: string
    status: string
    priority: string
  }

  @ApiProperty()
  dependsOnTask: {
    id: string
    title: string
    status: string
    priority: string
  }

  @ApiProperty()
  createdAt: Date
}
