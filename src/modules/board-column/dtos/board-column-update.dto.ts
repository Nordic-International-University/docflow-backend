import {
  IsOptional,
  IsString,
  IsNumber,
  IsBoolean,
  Length,
  Min,
} from 'class-validator'

export class BoardColumnUpdateDto {
  @IsString()
  @Length(1, 100)
  @IsOptional()
  name?: string

  @IsString()
  @IsOptional()
  color?: string

  @IsNumber()
  @Min(0)
  @IsOptional()
  position?: number

  @IsNumber()
  @Min(1)
  @IsOptional()
  wipLimit?: number

  @IsBoolean()
  @IsOptional()
  isClosed?: boolean

  @IsBoolean()
  @IsOptional()
  isDefault?: boolean
}
