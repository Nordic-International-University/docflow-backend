import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common'
import { FileInterceptor } from '@nestjs/platform-express'
import { ApiBearerAuth, ApiConsumes, ApiTags } from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PoliciesGuard, CheckPolicies } from '../../casl'
import type { AuthenticatedRequest } from '../../common/types/request.types'
import { PERMISSIONS } from '@constants'
import { ChatService } from './chat.service'
import { ChatGateway } from './chat.gateway'
import {
  AddMembersDto,
  AddReactionDto,
  ArchiveChatDto,
  CreateDirectChatDto,
  CreateGroupChatDto,
  EditMessageDto,
  ForwardEntityDto,
  ForwardMessageDto,
  InitiateCallDto,
  JoinByInviteDto,
  JoinByUsernameDto,
  MuteChatDto,
  PinChatDto,
  SearchMessagesDto,
  SendMessageDto,
  UpdateChatSettingsDto,
  UpdateGroupChatDto,
  UpdateGroupPermissionsDto,
  UpdateGroupVisibilityDto,
} from './dtos'

@ApiBearerAuth()
@ApiTags('Chat')
@UseGuards(AuthGuard, PermissionGuard, PoliciesGuard)
@Controller({ path: 'chat', version: '1' })
export class ChatController {
  constructor(
    private readonly chat: ChatService,
    private readonly gateway: ChatGateway,
  ) {}

  private ctx(req: AuthenticatedRequest) {
    return { userId: req.user.userId, roleName: req.user.roleName }
  }

  // ============ CHATS ============

  @Get()
  @Permissions(PERMISSIONS.CHAT.LIST)
  async list(
    @Req() req: AuthenticatedRequest,
    @Query('search') search?: string,
    @Query('limit') limit?: number,
  ) {
    return this.chat.listChats(this.ctx(req), {
      search,
      limit: Math.min(Number(limit) || 50, 100),
    })
  }

  @Post('direct')
  @Permissions(PERMISSIONS.CHAT.CREATE_DIRECT)
  async createDirect(@Body() payload: CreateDirectChatDto, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.createOrGetDirectChat(payload, this.ctx(req))
    if (result.created) {
      this.gateway.emitChatCreated(result.id, [req.user.userId, payload.userId])
    }
    return result
  }

  @Post('group')
  @Permissions(PERMISSIONS.CHAT.CREATE_GROUP)
  async createGroup(@Body() payload: CreateGroupChatDto, @Req() req: AuthenticatedRequest) {
    const chat = await this.chat.createGroupChat(payload, this.ctx(req))
    this.gateway.emitChatCreated(
      chat.id,
      chat.members.map((m: { userId: string }) => m.userId),
    )
    return chat
  }

  // ============ STATIC ROUTES (must be BEFORE :id catch-all) ============

  @Get('settings/me')
  @Permissions(PERMISSIONS.CHAT.SETTINGS)
  async getSettingsStatic(@Req() req: AuthenticatedRequest) {
    return this.chat.getSettings(this.ctx(req))
  }

  @Patch('settings/me')
  @Permissions(PERMISSIONS.CHAT.SETTINGS)
  async updateSettingsStatic(
    @Body() payload: UpdateChatSettingsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.updateSettings(payload, this.ctx(req))
  }

  @Get('search/messages')
  @Permissions(PERMISSIONS.CHAT.READ)
  async searchMessagesStatic(
    @Query() query: SearchMessagesDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.searchMessages(query.q, query.chatId, this.ctx(req))
  }

  @Get('messages/:messageId/reads')
  @Permissions(PERMISSIONS.CHAT.READ)
  async getMessageReadsStatic(
    @Param('messageId') messageId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.getMessageReads(messageId, this.ctx(req))
  }

  // ============ BLOCK / PUBLIC SEARCH (Faza 3) ============

  @Post('block/:userId')
  @Permissions(PERMISSIONS.CHAT.SETTINGS)
  async blockUser(@Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
    return this.chat.blockUser(userId, this.ctx(req))
  }

  @Delete('block/:userId')
  @Permissions(PERMISSIONS.CHAT.SETTINGS)
  async unblockUser(@Param('userId') userId: string, @Req() req: AuthenticatedRequest) {
    return this.chat.unblockUser(userId, this.ctx(req))
  }

  @Get('block/list')
  @Permissions(PERMISSIONS.CHAT.SETTINGS)
  async listBlocked(@Req() req: AuthenticatedRequest) {
    return this.chat.getBlockedUsers(this.ctx(req))
  }

  @Get('public/search')
  @Permissions(PERMISSIONS.CHAT.LIST)
  async publicSearch(@Query('q') q: string) {
    return this.chat.searchPublicChats(q || '')
  }

  @Post('join/invite')
  @Permissions(PERMISSIONS.CHAT.CREATE_GROUP)
  async joinByInvite(@Body() payload: JoinByInviteDto, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.joinByInviteCode(payload.code, this.ctx(req))
    this.gateway.emitChatCreated(result.chatId, [req.user.userId])
    return result
  }

  @Post('join/username')
  @Permissions(PERMISSIONS.CHAT.CREATE_GROUP)
  async joinByUsername(@Body() payload: JoinByUsernameDto, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.joinByUsername(
      payload.username,
      this.ctx(req),
    )
    this.gateway.emitChatCreated(result.chatId, [req.user.userId])
    return result
  }

  // ============ CHAT BY ID ============

  @Get(':id')
  @Permissions(PERMISSIONS.CHAT.READ)
  async getChat(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.chat.getChat(id, this.ctx(req))
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async updateGroup(
    @Param('id') id: string,
    @Body() payload: UpdateGroupChatDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const chat = await this.chat.updateGroupChat(id, payload, this.ctx(req))
    this.gateway.emitChatUpdated(id, chat)
    return chat
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async deleteChat(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.deleteChat(id, this.ctx(req))
    this.gateway.emitChatDeleted(id)
    return result
  }

  // ============ MEMBERS ============

  @Post(':id/members')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async addMembers(
    @Param('id') id: string,
    @Body() payload: AddMembersDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.addMembers(id, payload, this.ctx(req))
    this.gateway.emitChatUpdated(id, { membersAdded: result.userIds })
    return result
  }

  @Delete(':id/members/:userId')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async removeMember(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.removeMember(id, userId, this.ctx(req))
    this.gateway.emitChatUpdated(id, { memberRemoved: userId })
    return result
  }

  @Post(':id/leave')
  @Permissions(PERMISSIONS.CHAT.READ)
  async leaveChat(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.removeMember(
      id,
      req.user.userId,
      this.ctx(req),
    )
    this.gateway.emitChatUpdated(id, { memberLeft: req.user.userId })
    return result
  }

  @Patch(':id/members/:userId/role')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async setMemberRole(
    @Param('id') id: string,
    @Param('userId') userId: string,
    @Body() body: { role: 'ADMIN' | 'MEMBER' },
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.setMemberRole(id, userId, body.role, this.ctx(req))
  }

  // ============ MESSAGES ============

  @Get(':id/messages')
  @Permissions(PERMISSIONS.CHAT.READ)
  async getMessages(
    @Param('id') id: string,
    @Query('before') before: string | undefined,
    @Query('limit') limit: string | undefined,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.getMessages(id, this.ctx(req), {
      before,
      limit: Math.min(Number(limit) || 50, 100),
    })
  }

  @Post(':id/messages')
  @Permissions(PERMISSIONS.CHAT.SEND)
  @UseInterceptors(FileInterceptor('file'))
  @ApiConsumes('multipart/form-data', 'application/json')
  async sendMessage(
    @Param('id') id: string,
    @Body() payload: SendMessageDto,
    @UploadedFile() file: Express.Multer.File,
    @Req() req: AuthenticatedRequest,
  ) {
    const message = await this.chat.sendMessage(
      id,
      payload,
      this.ctx(req),
      file,
    )
    const memberIds = await this.chat.getChatMemberIds(id)
    this.gateway.emitNewMessage(id, memberIds, message)
    return message
  }

  @Patch('messages/:messageId')
  @Permissions(PERMISSIONS.CHAT.SEND)
  async editMessage(
    @Param('messageId') messageId: string,
    @Body() payload: EditMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const updated = await this.chat.editMessage(
      messageId,
      payload,
      this.ctx(req),
    )
    const memberIds = await this.chat.getChatMemberIds(updated.chatId)
    this.gateway.emitMessageUpdated(updated.chatId, memberIds, updated)
    return updated
  }

  @Delete('messages/:messageId')
  @Permissions(PERMISSIONS.CHAT.SEND)
  async deleteMessage(@Param('messageId') messageId: string, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.deleteMessage(messageId, this.ctx(req))
    const memberIds = await this.chat.getChatMemberIds(result.chatId)
    this.gateway.emitMessageDeleted(result.chatId, memberIds, result.messageId)
    return result
  }

  @Post('messages/:messageId/reactions')
  @Permissions(PERMISSIONS.CHAT.SEND)
  async addReaction(
    @Param('messageId') messageId: string,
    @Body() payload: AddReactionDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.addReaction(
      messageId,
      payload,
      this.ctx(req),
    )
    const memberIds = await this.chat.getChatMemberIds(result.chatId)
    this.gateway.emitReaction(result.chatId, memberIds, {
      messageId,
      userId: req.user.userId,
      emoji: payload.emoji,
      action: 'add',
    })
    return result
  }

  @Delete('messages/:messageId/reactions/:emoji')
  @Permissions(PERMISSIONS.CHAT.SEND)
  async removeReaction(
    @Param('messageId') messageId: string,
    @Param('emoji') emoji: string,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.removeReaction(
      messageId,
      emoji,
      this.ctx(req),
    )
    const memberIds = await this.chat.getChatMemberIds(result.chatId)
    this.gateway.emitReaction(result.chatId, memberIds, {
      messageId,
      userId: req.user.userId,
      emoji,
      action: 'remove',
    })
    return result
  }

  @Post('messages/:messageId/forward')
  @Permissions(PERMISSIONS.CHAT.FORWARD)
  async forwardMessage(
    @Param('messageId') messageId: string,
    @Body() payload: ForwardMessageDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.forwardMessage(
      messageId,
      payload,
      this.ctx(req),
    )
    for (const f of result.forwarded) {
      const memberIds = await this.chat.getChatMemberIds(f.chatId)
        // @ts-expect-error — partial forward broadcast
      this.gateway.emitNewMessage(f.chatId, memberIds, {
        id: f.messageId,
        forwarded: true,
      })
    }
    return result
  }

  @Post(':id/read')
  @Permissions(PERMISSIONS.CHAT.READ)
  async markRead(
    @Param('id') id: string,
    @Body() body: { upToMessageId?: string },
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.markChatRead(
      id,
      this.ctx(req),
      body?.upToMessageId,
    )
    const memberIds = await this.chat.getChatMemberIds(id)
    this.gateway.emitReadReceipt(id, memberIds, {
      userId: req.user.userId,
      upToMessageId: body?.upToMessageId,
      readAt: result.readAt,
    })
    return result
  }

  // ============ FORWARD ENTITIES ============

  @Post('forward/workflow/:workflowId')
  @Permissions(PERMISSIONS.CHAT.FORWARD_DOCUMENT)
  async forwardWorkflow(
    @Param('workflowId') workflowId: string,
    @Body() payload: ForwardEntityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const msg = await this.chat.forwardWorkflow(
      workflowId,
      payload,
      this.ctx(req),
    )
    const memberIds = await this.chat.getChatMemberIds(payload.toChatId)
    this.gateway.emitNewMessage(payload.toChatId, memberIds, msg as any)
    return msg
  }

  @Post('forward/document/:documentId')
  @Permissions(PERMISSIONS.CHAT.FORWARD_DOCUMENT)
  async forwardDocument(
    @Param('documentId') documentId: string,
    @Body() payload: ForwardEntityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const msg = await this.chat.forwardDocument(
      documentId,
      payload,
      this.ctx(req),
    )
    const memberIds = await this.chat.getChatMemberIds(payload.toChatId)
    this.gateway.emitNewMessage(payload.toChatId, memberIds, msg as any)
    return msg
  }

  @Post('forward/task/:taskId')
  @Permissions(PERMISSIONS.CHAT.FORWARD_DOCUMENT)
  async forwardTask(
    @Param('taskId') taskId: string,
    @Body() payload: ForwardEntityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const msg = await this.chat.forwardTask(taskId, payload, this.ctx(req))
    const memberIds = await this.chat.getChatMemberIds(payload.toChatId)
    this.gateway.emitNewMessage(payload.toChatId, memberIds, msg as any)
    return msg
  }

  // ============ MUTE / PIN / ARCHIVE (Faza 2) ============

  @Post(':id/mute')
  @Permissions(PERMISSIONS.CHAT.READ)
  async muteChat(
    @Param('id') id: string,
    @Body() payload: MuteChatDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.muteChat(id, payload.mutedUntil ?? null, this.ctx(req))
  }

  @Post(':id/pin')
  @Permissions(PERMISSIONS.CHAT.READ)
  async pinChat(
    @Param('id') id: string,
    @Body() payload: PinChatDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.pinChat(id, payload.pinned, this.ctx(req))
  }

  @Post(':id/archive')
  @Permissions(PERMISSIONS.CHAT.READ)
  async archiveChat(
    @Param('id') id: string,
    @Body() payload: ArchiveChatDto,
    @Req() req: AuthenticatedRequest,
  ) {
    return this.chat.archiveChat(id, payload.archived, this.ctx(req))
  }

  @Post(':id/clear-history')
  @Permissions(PERMISSIONS.CHAT.READ)
  async clearHistory(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.chat.clearChatHistory(id, this.ctx(req))
  }

  // ============ GROUP VISIBILITY / INVITE / PERMISSIONS (Faza 3) ============

  @Post(':id/visibility')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async updateVisibility(
    @Param('id') id: string,
    @Body() payload: UpdateGroupVisibilityDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.updateGroupVisibility(
      id,
      payload,
      this.ctx(req),
    )
    this.gateway.emitChatUpdated(id, { visibility: result.visibility })
    return result
  }

  @Post(':id/permissions')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async updatePermissions(
    @Param('id') id: string,
    @Body() payload: UpdateGroupPermissionsDto,
    @Req() req: AuthenticatedRequest,
  ) {
    const result = await this.chat.updateGroupPermissions(
      id,
      payload,
      this.ctx(req),
    )
    this.gateway.emitChatUpdated(id, { permissions: result })
    return result
  }

  @Post(':id/invite/regenerate')
  @Permissions(PERMISSIONS.CHAT.MANAGE_GROUP)
  async regenerateInvite(@Param('id') id: string, @Req() req: AuthenticatedRequest) {
    return this.chat.regenerateInviteCode(id, this.ctx(req))
  }

  // ============ CALLS ============

  @Post(':id/call')
  @Permissions(PERMISSIONS.CHAT.CALL_AUDIO)
  async initiateCall(
    @Param('id') id: string,
    @Body() payload: InitiateCallDto,
    @Req() req: AuthenticatedRequest,
  ) {
    if (
      payload.type === 'VIDEO' &&
      !req.user.permissions?.includes(PERMISSIONS.CHAT.CALL_VIDEO)
    ) {
      return { error: "Video qo'ng'iroqlar uchun ruxsat yo'q" }
    }
    const call = await this.chat.initiateCall(id, payload, this.ctx(req))
    const memberIds = await this.chat.getChatMemberIds(id)
    this.gateway.emitCallIncoming(id, memberIds, call)
    return call
  }

  @Post('calls/:callId/accept')
  @Permissions(PERMISSIONS.CHAT.CALL_AUDIO)
  async acceptCall(@Param('callId') callId: string, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.respondToCall(
      callId,
      'accept',
      this.ctx(req),
    )
    this.gateway.emitCallStatus(callId, {
      action: 'accepted',
      userId: req.user.userId,
      user: { id: req.user.userId, fullname: req.user.fullname },
      chatId: result.chatId,
    })
    return result
  }

  @Post('calls/:callId/reject')
  @Permissions(PERMISSIONS.CHAT.CALL_AUDIO)
  async rejectCall(@Param('callId') callId: string, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.respondToCall(
      callId,
      'reject',
      this.ctx(req),
    )
    this.gateway.emitCallStatus(callId, {
      action: 'rejected',
      userId: req.user.userId,
      user: { id: req.user.userId, fullname: req.user.fullname },
      chatId: result.chatId,
    })
    return result
  }

  @Post('calls/:callId/end')
  @Permissions(PERMISSIONS.CHAT.CALL_AUDIO)
  async endCall(@Param('callId') callId: string, @Req() req: AuthenticatedRequest) {
    const result = await this.chat.respondToCall(callId, 'end', this.ctx(req))
    this.gateway.emitCallStatus(callId, {
      action: 'ended',
      userId: req.user.userId,
      user: { id: req.user.userId, fullname: req.user.fullname },
      chatId: result.chatId,
      duration: (result as any).duration,
    })
    return result
  }
}
