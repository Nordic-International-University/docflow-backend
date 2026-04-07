import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger'
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  MaxLength,
  ArrayMinSize,
  ArrayMaxSize,
} from 'class-validator'

export enum ChatMessageTypeDto {
  TEXT = 'TEXT',
  IMAGE = 'IMAGE',
  VIDEO = 'VIDEO',
  VOICE = 'VOICE',
  FILE = 'FILE',
  WORKFLOW = 'WORKFLOW',
  DOCUMENT = 'DOCUMENT',
  TASK = 'TASK',
}

export class CreateDirectChatDto {
  @ApiProperty()
  @IsUUID()
  userId: string
}

export class CreateGroupChatDto {
  @ApiProperty()
  @IsString()
  @Length(1, 255)
  title: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string

  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(500)
  @IsUUID('4', { each: true })
  memberIds: string[]
}

export class UpdateGroupChatDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @Length(1, 255)
  title?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(1000)
  description?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  avatarUrl?: string
}

export class AddMembersDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @IsUUID('4', { each: true })
  userIds: string[]
}

export class SendMessageDto {
  @ApiPropertyOptional({ enum: ChatMessageTypeDto })
  @IsOptional()
  @IsEnum(ChatMessageTypeDto)
  type?: ChatMessageTypeDto

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(10000)
  content?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  replyToId?: string

  // Media fields (fillable when type != TEXT). Alternatively use multipart endpoint.
  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileUrl?: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  fileName?: string

  @ApiPropertyOptional()
  @IsOptional()
  mimeType?: string

  @ApiPropertyOptional()
  @IsOptional()
  fileSize?: number

  @ApiPropertyOptional()
  @IsOptional()
  duration?: number

  @ApiPropertyOptional()
  @IsOptional()
  thumbnailUrl?: string
}

export class EditMessageDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  @MaxLength(10000)
  content: string
}

export class AddReactionDto {
  @ApiProperty()
  @IsString()
  @Length(1, 20)
  emoji: string
}

export class ForwardMessageDto {
  @ApiProperty({ type: [String] })
  @IsArray()
  @ArrayMinSize(1)
  @ArrayMaxSize(50)
  @IsUUID('4', { each: true })
  toChatIds: string[]
}

export class ForwardEntityDto {
  @ApiProperty()
  @IsUUID()
  toChatId: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  @MaxLength(2000)
  caption?: string
}

export class UpdateChatSettingsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowCalls?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowVideoCalls?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowGroupInvites?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showOnlineStatus?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showLastSeen?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  showReadReceipts?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifySound?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  notifyPreview?: boolean
}

export class MuteChatDto {
  @ApiPropertyOptional({ description: "ISO vaqt. null bo'lsa unmute." })
  @IsOptional()
  @IsString()
  mutedUntil?: string | null
}

export class PinChatDto {
  @ApiProperty()
  @IsBoolean()
  pinned: boolean
}

export class ArchiveChatDto {
  @ApiProperty()
  @IsBoolean()
  archived: boolean
}

export class SearchMessagesDto {
  @ApiProperty()
  @IsString()
  @Length(1, 200)
  q: string

  @ApiPropertyOptional()
  @IsOptional()
  @IsUUID()
  chatId?: string
}

export enum GroupVisibilityDto {
  PRIVATE = 'PRIVATE',
  PUBLIC = 'PUBLIC',
}

export class UpdateGroupVisibilityDto {
  @ApiProperty({ enum: GroupVisibilityDto })
  @IsEnum(GroupVisibilityDto)
  visibility: GroupVisibilityDto

  @ApiPropertyOptional({ description: "Public guruh uchun unique username" })
  @IsOptional()
  @IsString()
  @Length(3, 32)
  username?: string
}

export class UpdateGroupPermissionsDto {
  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowMemberInvite?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowMemberSendMedia?: boolean

  @ApiPropertyOptional()
  @IsOptional()
  @IsBoolean()
  allowMemberPin?: boolean
}

export class JoinByInviteDto {
  @ApiProperty()
  @IsString()
  @Length(4, 64)
  code: string
}

export class JoinByUsernameDto {
  @ApiProperty()
  @IsString()
  @Length(3, 32)
  username: string
}

export class InitiateCallDto {
  @ApiProperty({ enum: ['AUDIO', 'VIDEO'] })
  @IsEnum(['AUDIO', 'VIDEO'])
  type: 'AUDIO' | 'VIDEO'
}
