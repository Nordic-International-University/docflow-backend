import {
  Controller,
  Get,
  Post,
  Param,
  Res,
  Req,
  HttpStatus,
  HttpCode,
  Body,
  UseGuards,
} from '@nestjs/common'
import { Response, Request } from 'express'
import { WopiService } from './wopi.service'
import { WopiTokenService } from './wopi-token.service'
import { WopiAuthGuard } from '@guards'
import { AuthGuard } from '@guards'
import { WopiGenerateTokenRequestDto } from './dtos'
import {
  ApiBearerAuth,
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiUnauthorizedResponse,
  ApiForbiddenResponse,
  ApiParam,
} from '@nestjs/swagger'

@ApiTags('WOPI')
@ApiBearerAuth()
@Controller({
  path: 'wopi',
  version: '1',
})
export class WopiController {
  constructor(
    private readonly wopiService: WopiService,
    private readonly wopiTokenService: WopiTokenService,
  ) {}

  @Post('token')
  @UseGuards(AuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Generate WOPI access token for document editing',
    description:
      "Generates a WOPI access token for a file with permissions based on the user's workflow step action type. All action types (APPROVAL, SIGN, REVIEW, ACKNOWLEDGE, VERIFICATION) allow editing XFDF annotations.",
  })
  @ApiOkResponse({
    description: 'WOPI access token generated successfully',
    schema: {
      type: 'object',
      properties: {
        accessToken: {
          type: 'string',
          description: 'The WOPI access token',
          example: 'a1b2c3d4e5f6g7h8i9j0...',
        },
        expiresAt: {
          type: 'string',
          format: 'date-time',
          description: 'Token expiration timestamp',
          example: '2024-12-31T23:59:59.000Z',
        },
        wopiSrc: {
          type: 'string',
          description: 'WOPI source URL for the file',
          example:
            'https://docflow-back.nordicuniversity.org/api/v1/wopi/files/uuid',
        },
      },
    },
  })
  @ApiUnauthorizedResponse({
    description: 'User not authenticated or has no access to the file',
    schema: {
      type: 'object',
      properties: {
        message: {
          type: 'string',
          example: 'You do not have permission to access this file',
        },
      },
    },
  })
  async generateToken(
    @Body() body: WopiGenerateTokenRequestDto,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const user = req['user']

      if (!user || !user.userId) {
        return res.status(HttpStatus.UNAUTHORIZED).json({
          message: 'User not authenticated',
        })
      }

      const tokenResponse = await this.wopiTokenService.generateToken(
        { fileId: body.fileId },
        user.userId,
      )

      return res.status(HttpStatus.OK).json({
        accessToken: tokenResponse.accessToken,
        expiresAt: tokenResponse.expiresAt,
        wopiSrc: tokenResponse.wopiSrc,
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Error generating WOPI token',
      })
    }
  }

  @Get('files/:fileId')
  @UseGuards(WopiAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Get WOPI file information with workflow-based permissions',
    description:
      "Returns file metadata and permissions based on the user's workflow step. Permissions (UserCanWrite, ReadOnly, WebEditingDisabled) are dynamically calculated from StepActionType.",
  })
  @ApiParam({
    name: 'fileId',
    description: 'The ID of the file',
    type: 'string',
  })
  async checkFileInfo(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const wopiContext = req['wopiContext']

      const fileInfo = await this.wopiService.checkFileInfo(
        { fileId },
        wopiContext.userId,
      )

      res.setHeader('Content-Type', 'application/json')

      return res.status(HttpStatus.OK).json(fileInfo)
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Error retrieving file info',
      })
    }
  }

  @Get('files/:fileId/contents')
  @UseGuards(WopiAuthGuard)
  async getFile(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const wopiContext = req['wopiContext']

      const fileContent = await this.wopiService.getFileContent(
        { fileId },
        wopiContext.userId,
      )

      const fileInfo = await this.wopiService.checkFileInfo(
        { fileId },
        wopiContext.userId,
      )

      res.setHeader('Content-Type', 'application/octet-stream')
      res.setHeader('Content-Length', fileContent.length.toString())

      // RFC 5987: filename'da non-ASCII (kirill, parantez) bo'lsa
      // HTTP header'ga to'g'ridan-to'g'ri yozib bo'lmaydi.
      // ASCII fallback + UTF-8 encoded versiya bilan.
      const rawName = fileInfo.BaseFileName || 'document'
      const asciiFallback = rawName
        .replace(/[^\x20-\x7E]/g, '_')
        .replace(/"/g, '')
      const utf8Encoded = encodeURIComponent(rawName)
      res.setHeader(
        'Content-Disposition',
        `attachment; filename="${asciiFallback}"; filename*=UTF-8''${utf8Encoded}`,
      )

      return res.status(HttpStatus.OK).send(fileContent)
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Error retrieving file',
      })
    }
  }

  @Post('files/:fileId/contents')
  @UseGuards(WopiAuthGuard)
  @HttpCode(HttpStatus.OK)
  async putFile(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const wopiContext = req['wopiContext']
      const chunks: Buffer[] = []

      req.on('data', (chunk: Buffer) => {
        chunks.push(chunk)
      })

      req.on('end', async () => {
        try {
          const content = Buffer.concat(chunks)

          await this.wopiService.putFileContent(
            {
              fileId,
              content,
            },
            wopiContext.userId,
          )

          const fileInfo = await this.wopiService.checkFileInfo(
            { fileId },
            wopiContext.userId,
          )

          res.setHeader('Content-Type', 'application/json')
          return res.status(HttpStatus.OK).json({
            Name: fileInfo.BaseFileName,
            Size: fileInfo.Size,
            Version: fileInfo.Version,
            LastModifiedTime: fileInfo.LastModifiedTime,
          })
        } catch (error) {
          return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
            message: error.message || 'Error saving file',
          })
        }
      })

      req.on('error', (error) => {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
          message: error.message || 'Error reading file content',
        })
      })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Error processing file upload',
      })
    }
  }

  @Post('files/:fileId')
  @UseGuards(WopiAuthGuard)
  @HttpCode(HttpStatus.OK)
  async lockFile(
    @Param('fileId') fileId: string,
    @Req() req: Request,
    @Res() res: Response,
  ) {
    try {
      const wopiOverride = req.headers['x-wopi-override']
      const lock = req.headers['x-wopi-lock'] as string
      const oldLock = req.headers['x-wopi-oldlock'] as string

      if (wopiOverride === 'LOCK') {
        // Lock the file
        res.setHeader('X-WOPI-Lock', lock || '')
        return res.status(HttpStatus.OK).json({ message: 'File locked' })
      } else if (wopiOverride === 'UNLOCK') {
        // Unlock the file
        return res.status(HttpStatus.OK).json({ message: 'File unlocked' })
      } else if (wopiOverride === 'REFRESH_LOCK') {
        // Refresh the lock
        res.setHeader('X-WOPI-Lock', lock || '')
        return res.status(HttpStatus.OK).json({ message: 'Lock refreshed' })
      } else if (wopiOverride === 'GET_LOCK') {
        // Get current lock status
        res.setHeader('X-WOPI-Lock', '')
        return res.status(HttpStatus.OK).json({ message: 'Lock status' })
      } else if (wopiOverride === 'PUT_RELATIVE') {
        // Save file with a new name
        return res
          .status(HttpStatus.NOT_IMPLEMENTED)
          .json({ message: 'PUT_RELATIVE not implemented' })
      }

      return res
        .status(HttpStatus.BAD_REQUEST)
        .json({ message: 'Unknown WOPI operation' })
    } catch (error) {
      return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
        message: error.message || 'Error processing lock operation',
      })
    }
  }
}
