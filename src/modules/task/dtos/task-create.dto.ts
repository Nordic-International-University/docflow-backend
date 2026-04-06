import {
  IsOptional,
  IsString,
  IsNumber,
  IsDateString,
  IsUUID,
  Length,
  IsArray,
} from 'class-validator'

export class TaskCreateDto {
  @IsString()
  @Length(2, 500)
  title: string

  @IsString()
  @IsOptional()
  description?: string

  @IsUUID()
  projectId: string

  @IsUUID()
  @IsOptional()
  categoryId?: string

  @IsString()
  @IsOptional()
  priority?: string

  @IsArray()
  @IsUUID('4', { each: true })
  @IsOptional()
  assigneeIds?: string[]

  @IsUUID()
  @IsOptional()
  parentTaskId?: string

  @IsDateString()
  @IsOptional()
  startDate?: Date

  @IsDateString()
  @IsOptional()
  dueDate?: Date

  @IsNumber()
  @IsOptional()
  estimatedHours?: number

  @IsNumber()
  @IsOptional()
  position?: number

  @IsUUID()
  @IsOptional()
  boardColumnId?: string

  @IsNumber()
  @IsOptional()
  score?: number

  @IsUUID()
  @IsOptional()
  scoreConfigId?: string

  @IsString()
  @IsOptional()
  coverImageUrl?: string
}
