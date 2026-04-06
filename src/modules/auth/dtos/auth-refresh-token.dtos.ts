import { IsNotEmpty, IsString } from 'class-validator'
import { AuthRefreshTokenRequest } from '../interfaces/auth-refresh-token.interface'
import { ApiProperty } from '@nestjs/swagger'

export class AuthRefreshTokenDto implements AuthRefreshTokenRequest {
  @ApiProperty({
    example: 'some-refresh-token',
    description: 'Refresh token provided to the user',
  })
  @IsNotEmpty()
  @IsString()
  refreshToken: string
}
