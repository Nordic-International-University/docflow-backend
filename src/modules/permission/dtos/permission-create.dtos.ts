import { IsNotEmpty, IsString } from 'class-validator'
import { PermissionCreateRequest } from '../interfaces'
import { ApiProperty } from '@nestjs/swagger'

export class PermissionCreteateDto implements PermissionCreateRequest {
  @ApiProperty({
    example: 'user:create',
    description: 'Unique key for the permission',
  })
  @IsNotEmpty()
  @IsString()
  key: string

  @ApiProperty({
    example: 'Create User',
    description: 'Name of the permission',
  })
  @IsNotEmpty()
  @IsString()
  name: string

  @ApiProperty({
    example: 'User Management',
    description: 'Module to which the permission belongs',
  })
  @IsNotEmpty()
  @IsString()
  module: string

  @ApiProperty({
    example: 'Allows creating a new user',
    description: 'Description of the permission',
  })
  @IsNotEmpty()
  @IsString()
  description: string
}
