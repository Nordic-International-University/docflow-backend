import { IsInt, IsOptional, IsPositive, IsString } from 'class-validator'
import { PermissionRetrieveAllRequest } from '../interfaces'
import { Type } from 'class-transformer'

export class PermissionRetrieveAllDto implements PermissionRetrieveAllRequest {
  @IsPositive()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  pageNumber?: number

  @IsPositive()
  @IsInt()
  @Type(() => Number)
  @IsOptional()
  pageSize?: number

  @IsString()
  @IsOptional()
  search?: string
}
