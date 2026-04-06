import { IsOptional, IsString, IsNumber } from 'class-validator'
import { Type } from 'class-transformer'

export class ProjectRetrieveQueryDto {
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
  @IsString()
  status?: string

  @IsOptional()
  @IsString()
  departmentId?: string
}
