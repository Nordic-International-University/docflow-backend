import { ApiProperty } from '@nestjs/swagger'
import { IsIn, IsOptional } from 'class-validator'
import { ProjectMemberUpdateRequest } from '../interfaces'

export class ProjectMemberUpdateDto implements Partial<ProjectMemberUpdateRequest> {
  @ApiProperty({
    description: 'Member role in the project',
    required: false,
    enum: ['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'],
  })
  @IsIn(['OWNER', 'MANAGER', 'MEMBER', 'VIEWER'])
  @IsOptional()
  role?: string
}
