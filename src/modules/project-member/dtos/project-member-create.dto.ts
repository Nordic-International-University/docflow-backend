import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional, IsUUID } from 'class-validator'
import { ProjectMemberCreateRequest } from '../interfaces'

export class ProjectMemberCreateDto implements Omit<
  ProjectMemberCreateRequest,
  'createdBy'
> {
  @ApiProperty({
    description: 'Project ID',
    example: '550e8400-e29b-41d4-a716-446655440000',
  })
  @IsUUID()
  projectId: string

  @ApiProperty({
    description: 'User ID',
    example: '550e8400-e29b-41d4-a716-446655440001',
  })
  @IsUUID()
  userId: string

  @ApiProperty({
    description: 'Member role in the project',
    example: 'MEMBER',
    required: false,
    enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
    default: 'MEMBER',
  })
  @IsIn(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'])
  @IsOptional()
  role?: string
}
