import {
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { UserMonthlyKpiService } from './user-monthly-kpi.service'
import { KpiCalculationService } from './kpi-calculation.service'
import {
  UserMonthlyKpiRetrieveQueryDto,
  LeaderboardQueryDto,
  UserKpiHistoryQueryDto,
} from './dtos'
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger'
import { AuthGuard, PermissionGuard } from '@guards'
import { Permissions } from '@decorators'
import { PERMISSIONS } from '@constants'

@ApiBearerAuth()
@ApiTags('User Monthly KPI')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'user-monthly-kpi',
  version: '1',
})
export class UserMonthlyKpiController {
  constructor(
    private readonly userMonthlyKpiService: UserMonthlyKpiService,
    private readonly kpiCalculationService: KpiCalculationService,
  ) {}

  @Get()
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.LIST)
  @ApiOperation({ summary: 'Get all user monthly KPIs' })
  @ApiResponse({ status: 200, description: 'List of user monthly KPIs' })
  async userMonthlyKpiRetrieveAll(
    @Query() payload: UserMonthlyKpiRetrieveQueryDto,
  ) {
    return await this.userMonthlyKpiService.userMonthlyKpiRetrieveAll(payload)
  }

  @Get('me')
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.READ)
  @ApiOperation({ summary: 'Get current user monthly KPI' })
  @ApiResponse({ status: 200, description: 'Current user monthly KPI' })
  async userMonthlyKpiRetrieveMine(
    @Req() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return await this.userMonthlyKpiService.userMonthlyKpiRetrieveMine(
      req.user.userId,
      year ? parseInt(year, 10) : undefined,
      month ? parseInt(month, 10) : undefined,
    )
  }

  @Get('history')
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.READ)
  @ApiOperation({ summary: 'Get user KPI history' })
  @ApiResponse({ status: 200, description: 'User KPI history' })
  async userMonthlyKpiHistory(
    @Req() req: any,
    @Query() payload: UserKpiHistoryQueryDto,
  ) {
    const userId = payload.userId || req.user.userId
    return await this.userMonthlyKpiService.userMonthlyKpiHistory(
      userId,
      payload.limit,
    )
  }

  @Get('leaderboard')
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.LIST)
  @ApiOperation({ summary: 'Get KPI leaderboard' })
  @ApiResponse({ status: 200, description: 'KPI leaderboard' })
  async getLeaderboard(@Query() payload: LeaderboardQueryDto) {
    const now = new Date()
    return await this.userMonthlyKpiService.getLeaderboard({
      year: payload.year ?? now.getFullYear(),
      month: payload.month ?? now.getMonth() + 1,
      departmentId: payload.departmentId,
      limit: payload.limit,
    })
  }

  @Get('task-scores')
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.READ)
  @ApiOperation({ summary: 'Get task KPI scores for a period' })
  @ApiResponse({ status: 200, description: 'Task KPI scores' })
  async getTaskKpiScores(
    @Req() req: any,
    @Query('userId') userId?: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    const now = new Date()
    return await this.userMonthlyKpiService.getTaskKpiScores(
      userId || req.user.userId,
      year ? parseInt(year, 10) : now.getFullYear(),
      month ? parseInt(month, 10) : now.getMonth() + 1,
    )
  }

  @Get('statistics/full')
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.READ)
  @ApiOperation({
    summary: "To'liq KPI statistikasi — frontend dashboard uchun",
    description: 'Barcha KPI statistikasi: shaxsiy, departament, leaderboard, trend, top tasklar, achievements',
  })
  async getFullStatistics(
    @Req() req: any,
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('userId') userId?: string,
  ) {
    return await this.userMonthlyKpiService.getFullStatistics({
      userId: userId || req.user.userId,
      year: year ? parseInt(year, 10) : new Date().getFullYear(),
      month: month ? parseInt(month, 10) : new Date().getMonth() + 1,
      currentUserRole: req.user.roleName,
      currentUserDepartmentId: req.user.departmentId,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.READ)
  @ApiOperation({ summary: 'Get user monthly KPI by ID' })
  @ApiResponse({ status: 200, description: 'User monthly KPI' })
  async userMonthlyKpiRetrieveOne(@Param('id') id: string) {
    return await this.userMonthlyKpiService.userMonthlyKpiRetrieveOne(id)
  }

  @Post('finalize')
  @Permissions(PERMISSIONS.USER_MONTHLY_KPI.FINALIZE)
  @ApiOperation({ summary: 'Finalize a month KPI (admin)' })
  @ApiResponse({ status: 200, description: 'Month finalized' })
  async finalizeMonth(
    @Query('year') year: string,
    @Query('month') month: string,
    @Req() req: any,
  ) {
    await this.kpiCalculationService.finalizeMonth(
      parseInt(year, 10),
      parseInt(month, 10),
      req.user.userId,
    )
    return { message: 'Month finalized successfully' }
  }
}
