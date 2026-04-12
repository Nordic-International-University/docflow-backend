import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common'
import { UserService } from './user.service'
import { UserDeleteDto } from './dtos/user-delete.dtos'
import { UserCreateDto } from './dtos/user-create.dtos'
import { UserUpdateDto } from './dtos/user-update.dtos'
import {
  UserListResponseDto,
  UserResponseDto,
  UserRetrieveAllDto,
} from './dtos/user-retrieve.dtos'
import {
  LinkTelegramDto,
  TelegramLinkResponseDto,
} from './dtos/user-telegram.dtos'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger'

@ApiBearerAuth()
@ApiTags('User')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'user',
  version: '1',
})
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'User Retrieve All' })
  @Permissions(PERMISSIONS.USER.LIST)
  @ApiResponse({ status: 200, type: UserListResponseDto })
  async userRetrieveAll(@Query() payload: UserRetrieveAllDto) {
    return await this.userService.userRetrieveAll(payload)
  }

  @Get(':id')
  @ApiOperation({ summary: 'User Retrieve One' })
  @Permissions(PERMISSIONS.USER.READ)
  @ApiResponse({ status: 200, type: UserResponseDto })
  async userRetrieveOne(@Param('id') id: string) {
    return await this.userService.userRetrieveOne({ id })
  }

  @Post()
  @ApiOperation({ summary: 'User Create' })
  @Permissions(PERMISSIONS.USER.CREATE)
  @ApiResponse({ status: 201, description: 'User created successfully' })
  async userCreate(@Body() payload: UserCreateDto) {
    return await this.userService.userCreate(payload)
  }

  @Patch(':id')
  @ApiOperation({ summary: 'User Update' })
  @Permissions(PERMISSIONS.USER.UPDATE)
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  async userUpdate(@Param('id') id: string, @Body() payload: UserUpdateDto) {
    return await this.userService.userUpdate({
      id,
      ...payload,
    })
  }

  @Delete(':id')
  @ApiOperation({ summary: 'User Delete' })
  @Permissions(PERMISSIONS.USER.DELETE)
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  async userDelete(@Param() payload: UserDeleteDto) {
    return await this.userService.userDelete(payload)
  }

  // Telegram Integration Endpoints

  @Get(':id/telegram/link-info')
  @ApiOperation({
    summary: 'Get Telegram Link Information',
    description:
      'Get the deep link and instructions for linking a Telegram account to this user.',
  })
  @Permissions(PERMISSIONS.USER.READ)
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Telegram link information retrieved successfully',
    type: TelegramLinkResponseDto,
  })
  async getTelegramLinkInfo(@Param('id') id: string) {
    return await this.userService.getTelegramLinkInfo(id)
  }

  @Post(':id/telegram/link')
  @ApiOperation({
    summary: 'Link Telegram Account',
    description: 'Manually link a Telegram ID to this user account.',
  })
  @Permissions(PERMISSIONS.USER.UPDATE)
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: String,
  })
  @ApiBody({ type: LinkTelegramDto })
  @ApiResponse({
    status: 200,
    description: 'Telegram account linked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'Telegram ID already linked to another account',
  })
  async linkTelegramAccount(
    @Param('id') id: string,
    @Body() payload: LinkTelegramDto,
  ) {
    await this.userService.linkTelegramAccount(id, payload.telegramId)
    return { message: 'Telegram account linked successfully' }
  }

  @Delete(':id/telegram')
  @ApiOperation({
    summary: 'Unlink Telegram Account',
    description: 'Remove the Telegram link from this user account.',
  })
  @Permissions(PERMISSIONS.USER.UPDATE)
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Telegram account unlinked successfully',
  })
  @ApiResponse({
    status: 400,
    description: 'No Telegram account is linked to this user',
  })
  async unlinkTelegramAccount(@Param('id') id: string) {
    await this.userService.unlinkTelegramAccount(id)
    return { message: 'Telegram account unlinked successfully' }
  }

  @Get(':id/telegram/status')
  @ApiOperation({
    summary: 'Get Telegram Link Status',
    description: 'Check if a Telegram account is linked to this user.',
  })
  @Permissions(PERMISSIONS.USER.READ)
  @ApiParam({
    name: 'id',
    description: 'User ID',
    type: String,
  })
  @ApiResponse({
    status: 200,
    description: 'Telegram status retrieved successfully',
  })
  async getTelegramStatus(@Param('id') id: string) {
    return await this.userService.getTelegramStatus(id)
  }
}
