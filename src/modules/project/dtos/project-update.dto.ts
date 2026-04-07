import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsUUID,
  Length,
} from 'class-validator'
import { ProjectVisibility } from './project-create.dto'

export class ProjectUpdateDto {
  @IsString()
  @Length(2, 255)
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @Length(2, 10)
  @IsOptional()
  key?: string

  @IsString()
  @IsOptional()
  status?: string

  @IsEnum(ProjectVisibility)
  @IsOptional()
  visibility?: ProjectVisibility

  @IsUUID()
  @IsOptional()
  departmentId?: string

  @IsDateString()
  @IsOptional()
  startDate?: Date

  @IsDateString()
  @IsOptional()
  endDate?: Date

  @IsNumber()
  @IsOptional()
  budget?: number

  @IsString()
  @IsOptional()
  color?: string

  @IsString()
  @IsOptional()
  icon?: string

  @IsNumber()
  @IsOptional()
  penaltyPerDay?: number
}
