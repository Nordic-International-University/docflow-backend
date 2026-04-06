import { IsOptional, IsString, IsNumber, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskRetrieveQueryDto {
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number

  @IsOptional()
  @IsString()
  search?: string

  @IsOptional()
  @IsUUID()
  projectId?: string

  @IsOptional()
  @IsString()
  priority?: string

  @IsOptional()
  @IsUUID()
  assigneeId?: string

  @IsOptional()
  @IsUUID()
  createdById?: string

  @IsOptional()
  @IsUUID()
  categoryId?: string
}
