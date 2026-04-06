import { ApiProperty } from '@nestjs/swagger'
import { IsNotEmpty, IsString } from 'class-validator'

export class LinkTelegramDto {
  @ApiProperty({
    description: 'Telegram ID of the user',
    example: '123456789',
  })
  @IsNotEmpty()
  @IsString()
  telegramId: string
}

export class TelegramLinkResponseDto {
  @ApiProperty({
    description: 'Deep link URL for linking Telegram account',
    example:
      'https://t.me/docflow_bot?start=550e8400-e29b-41d4-a716-446655440000',
  })
  deepLink: string

  @ApiProperty({
    description: 'User ID for manual linking',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  userId: string

  @ApiProperty({
    description: 'Instructions for linking',
    example:
      'Click the link above or send this command to @docflow_bot: /link 550e8400-e29b-41d4-a716-446655440000',
  })
  instructions: string
}
