import { ApiProperty } from '@nestjs/swagger'
import { AuthLoginRequest } from '../interfaces'
import { IsNotEmpty, IsString } from 'class-validator'

export class AuthLoginRequestDto implements AuthLoginRequest {
  @ApiProperty({
    example: 'admin',
    description: 'Username of the user',
    minLength: 3,
    maxLength: 30,
  })
  @IsNotEmpty()
  @IsString()
  username: string

  @ApiProperty({
    description: 'New user password',
    example: 'admin',
    minLength: 8,
    maxLength: 16,
  })
  @IsNotEmpty()
  @IsString()
  password: string
}

export interface AuthLoginResponseDto {
  accessToken: string
  refreshToken?: string
  expiresIn?: number
  userId: string
}
