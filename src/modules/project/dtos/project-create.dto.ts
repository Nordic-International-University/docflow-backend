import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsEnum,
  IsUUID,
  Length,
  Matches,
} from 'class-validator'

export enum ProjectVisibility {
  PRIVATE = 'PRIVATE',
  DEPARTMENT = 'DEPARTMENT',
  PUBLIC = 'PUBLIC',
}

export class ProjectCreateDto {
  @IsString()
  @Length(2, 255)
  name: string

  @IsString()
  @IsOptional()
  description?: string

  @IsString()
  @Length(2, 10)
  @Matches(/^[A-Z0-9]+$/, {
    message: 'Project key must contain only uppercase letters and numbers',
  })
  key: string

  @IsString()
  @IsOptional()
  status?: string

  @IsEnum(ProjectVisibility)
  @IsOptional()
  visibility?: ProjectVisibility

  @IsUUID()
  @IsOptional()
  departmentId?: string

  @IsUUID('4', { each: true })
  @IsOptional()
  initialMemberIds?: string[]

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
