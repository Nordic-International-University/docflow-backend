import { Controller, Get, Query } from '@nestjs/common'
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger'
import { AnalyticsService } from './analytics.service'
import { AnalyticsQueryDto } from './dtos/analytics-query.dto'
import {
  DashboardAnalyticsResponseDto,
  DocumentAnalyticsResponseDto,
  WorkflowAnalyticsResponseDto,
  UserAnalyticsResponseDto,
} from './dtos/analytics-response.dto'

@ApiTags('Analytics')
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
  ): Promise<DashboardAnalyticsResponseDto> {
    return this.analyticsService.getDashboardAnalytics(query)
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
}
