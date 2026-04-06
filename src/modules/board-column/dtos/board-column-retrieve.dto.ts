import { IsUUID, IsOptional, IsBoolean } from 'class-validator'
import { Transform } from 'class-transformer'

export class BoardColumnRetrieveQueryDto {
  @IsUUID()
  projectId: string

  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  @IsOptional()
  includeTaskCount?: boolean
}
