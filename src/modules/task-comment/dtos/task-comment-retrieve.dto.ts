import { ApiProperty } from '@nestjs/swagger'
import { IsNumber, IsOptional, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class TaskCommentRetrieveQueryDto {
  @ApiProperty({
    description: 'Task ID to filter comments',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  taskId: string

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
}

export class TaskCommentUserDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  fullname: string

  @ApiProperty()
  @ApiProperty({ required: false })
  avatar?: string
}

export class TaskCommentListResponseDto {
  @ApiProperty()
  data: any[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}

export class TaskCommentResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  taskId: string

  @ApiProperty()
  userId: string

  @ApiProperty()
  content: string

  @ApiProperty({ required: false })
  parentCommentId?: string

  @ApiProperty()
  isEdited: boolean

  @ApiProperty({ required: false })
  editedAt?: Date

  @ApiProperty({ type: TaskCommentUserDto })
  user: TaskCommentUserDto

  @ApiProperty()
  repliesCount: number

  @ApiProperty()
  reactionsCount: number

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}
