import { Module } from '@nestjs/common'
import { PrismaModule } from '@prisma'
import { ProjectMemberService } from './project-member.service'
import { ProjectMemberController } from './project-member.controller'
import { AuditLogModule } from '../audit-log/audit-log.module'

@Module({
  imports: [PrismaModule, AuditLogModule],
  providers: [ProjectMemberService],
  controllers: [ProjectMemberController],
  exports: [ProjectMemberService],
})
export class ProjectMemberModule {}
