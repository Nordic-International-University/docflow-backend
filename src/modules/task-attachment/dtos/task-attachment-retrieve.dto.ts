import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskAttachmentRetrieveQueryDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageNumber?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  pageSize?: number

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  taskId?: string
}

export class TaskAttachmentListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class TaskAttachmentResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  attachmentId: string

  @ApiProperty()
  uploadedById: string

  @ApiProperty({ required: false })
  description?: string

  @ApiProperty()
  attachment: {
    id: string
    fileName: string
    fileSize: number
    mimeType: string
    url?: string
  }

  @ApiProperty()
  uploadedBy: {
    id: string
    fullname: string
  }

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
