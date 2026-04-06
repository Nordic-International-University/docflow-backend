import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsNumber, IsOptional, IsString, IsUUID } from 'class-validator'
import { Type } from 'class-transformer'

export class ProjectMemberRetrieveQueryDto {
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
  @IsString()
  search?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  projectId?: string

  @ApiProperty({ required: false })
  @IsOptional()
  @IsUUID()
  userId?: string

  @ApiProperty({
    required: false,
    enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
  })
  @IsOptional()
  @IsIn(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'])
  role?: string
}

export class ProjectMemberUserDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  fullname: string

  @ApiProperty()
  @ApiProperty()
  email: string
}

export class ProjectMemberProjectDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  name: string
}

export class ProjectMemberResponseDto {
  @ApiProperty()
  id: string

  @ApiProperty()
  projectId: string

  @ApiProperty()
  userId: string

  @ApiProperty({ enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'] })
  role: string

  @ApiProperty()
  joinedAt: Date

  @ApiProperty({ type: ProjectMemberProjectDto, required: false })
  project?: ProjectMemberProjectDto

  @ApiProperty({ type: ProjectMemberUserDto, required: false })
  user?: ProjectMemberUserDto

  @ApiProperty()
  createdAt: Date

  @ApiProperty()
  updatedAt: Date
}

export class ProjectMemberListResponseDto {
  @ApiProperty({ type: [ProjectMemberResponseDto] })
  data: ProjectMemberResponseDto[]

  @ApiProperty()
  count: number

  @ApiProperty()
  pageNumber: number

  @ApiProperty()
  pageSize: number
}
