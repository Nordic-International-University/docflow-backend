import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common'
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'
import { PoliciesGuard } from '../../casl'
import { AnalyticsQueryDto } from './dtos/analytics-query.dto'
import {
  DashboardAnalyticsResponseDto,
  DocumentAnalyticsResponseDto,
  WorkflowAnalyticsResponseDto,
  UserAnalyticsResponseDto,
} from './dtos/analytics-response.dto'

@ApiTags('Analytics')
@ApiBearerAuth()
@UseGuards(AuthGuard, PermissionGuard, PoliciesGuard)
@Controller({ path: 'analytics', version: '1' })
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({ summary: 'Get overall dashboard analytics' })
  @ApiResponse({
    status: 200,
    description: 'Dashboard analytics retrieved successfully',
    type: DashboardAnalyticsResponseDto,
  })
  async getDashboardAnalytics(
    @Query() query: AnalyticsQueryDto,
    @Req() req: any,
  ): Promise<DashboardAnalyticsResponseDto> {
    return this.analyticsService.getDashboardAnalytics({
      ...query,
      userId: req.user.userId,
      roleName: req.user.roleName,
      departmentId: req.user.departmentId,
      subordinateDeptIds: req.user.subordinateDeptIds,
      isDeptHead: req.user.isDeptHead,
    } as any)
  }

  @Get('documents')
  @ApiOperation({ summary: 'Get document-specific analytics' })
  @ApiResponse({
    status: 200,
    description: 'Document analytics retrieved successfully',
    type: DocumentAnalyticsResponseDto,
  })
  async getDocumentAnalytics(
    @Query() query: AnalyticsQueryDto,
  ): Promise<DocumentAnalyticsResponseDto> {
    return this.analyticsService.getDocumentAnalytics(query)
  }

  @Get('workflows')
  @ApiOperation({ summary: 'Get workflow analytics' })
  @ApiResponse({
    status: 200,
    description: 'Workflow analytics retrieved successfully',
    type: WorkflowAnalyticsResponseDto,
  })
  async getWorkflowAnalytics(
    @Query() query: AnalyticsQueryDto,
  ): Promise<WorkflowAnalyticsResponseDto> {
    return this.analyticsService.getWorkflowAnalytics(query)
  }

  @Get('users')
  @ApiOperation({ summary: 'Get user activity analytics' })
  @ApiResponse({
    status: 200,
    description: 'User analytics retrieved successfully',
    type: UserAnalyticsResponseDto,
  })
  async getUserAnalytics(
    @Query() query: AnalyticsQueryDto,
  ): Promise<UserAnalyticsResponseDto> {
    return this.analyticsService.getUserAnalytics(query)
  }

  @Get('kpi')
  @ApiOperation({
    summary: "To'liq KPI statistikasi (dashboard uchun)",
    description:
      "Barcha KPI ma'lumotlari bitta endpoint'da: shaxsiy KPI, departament o'rtachasi, leaderboard, oylar trendi, top tasklar, achievementlar, score breakdown",
  })
  async getKpiStatistics(
    @Req() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('userId') userId?: string,
  ) {
    const now = new Date()
    return this.analyticsService.getKpiStatistics({
      userId: userId || req.user.userId,
      year: year ? parseInt(year, 10) : now.getFullYear(),
      month: month ? parseInt(month, 10) : now.getMonth() + 1,
      currentUserRole: req.user.roleName,
      currentUserDepartmentId: req.user.departmentId,
      subordinateDeptIds: req.user.subordinateDeptIds,
      isDeptHead: req.user.isDeptHead,
    })
  }
}
