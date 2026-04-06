import { IsUUID, IsNotEmpty } from 'class-validator'

// WOPI Token Generation Request DTO
export class WopiGenerateTokenRequestDto {
  @IsUUID()
  @IsNotEmpty()
  fileId: string
}

// WOPI Token Generation Response DTO
export class WopiGenerateTokenResponseDto {
  accessToken: string
  expiresAt: Date
  wopiSrc: string
}
