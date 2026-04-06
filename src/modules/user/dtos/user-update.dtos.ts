import { ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsBoolean,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator'

export class UserUpdateDto {
  @ApiPropertyOptional({
    description: 'Full name of the user',
    example: 'John Doe',
    minLength: 2,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(2, 255)
  fullname?: string

  @ApiPropertyOptional({
    description: 'Username for login',
    example: 'john_doe',
    minLength: 3,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(3, 255)
  username?: string

  @ApiPropertyOptional({
    description: 'User password',
    example: 'NewStrongP@ss123',
    minLength: 8,
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(8, 255)
  @Matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)[a-zA-Z\d\w\W]{8,}$/, {
    message:
      'Password must contain at least one uppercase letter, one lowercase letter, and one number',
  })
  password?: string

  @ApiPropertyOptional({
    description: 'Role ID of the user',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  roleId?: string | null

  @ApiPropertyOptional({
    description: 'Department ID of the user',
    example: '3fa85f64-5717-4562-b3fc-2c963f66afa6',
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string | null

  @ApiPropertyOptional({
    description: 'URL of the user avatar',
    example: 'https://example.com/avatar.jpg',
    maxLength: 255,
  })
  @IsOptional()
  @IsString()
  @Length(0, 255)
  avatarUrl?: string | null

  @ApiPropertyOptional({
    description: 'Telegram ID for Telegram bot integration',
    example: '123456789',
    maxLength: 100,
  })
  @IsOptional()
  @IsString()
  @Length(0, 100)
  telegramId?: string | null

  @ApiPropertyOptional({
    description: 'Whether the user account is active',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean
}
