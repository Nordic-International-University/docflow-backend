import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  Length,
} from 'class-validator'

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

  @IsString()
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
