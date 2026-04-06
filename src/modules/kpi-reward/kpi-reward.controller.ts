import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { KpiRewardService } from './kpi-reward.service'
import {
  KpiRewardRetrieveQueryDto,
  KpiRewardActionDto,
  KpiRewardRejectDto,
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
@ApiTags('KPI Reward')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'kpi-reward',
  version: '1',
})
export class KpiRewardController {
  constructor(private readonly kpiRewardService: KpiRewardService) {}

  @Get()
  @Permissions(PERMISSIONS.KPI_REWARD.LIST)
  @ApiOperation({ summary: 'Get all KPI rewards' })
  @ApiResponse({ status: 200, description: 'List of KPI rewards' })
  async kpiRewardRetrieveAll(@Query() payload: KpiRewardRetrieveQueryDto) {
    return await this.kpiRewardService.kpiRewardRetrieveAll(payload)
  }

  @Get('pending')
  @Permissions(PERMISSIONS.KPI_REWARD.LIST)
  @ApiOperation({ summary: 'Get pending KPI rewards' })
  @ApiResponse({ status: 200, description: 'List of pending KPI rewards' })
  async kpiRewardRetrievePending(@Query() payload: KpiRewardRetrieveQueryDto) {
    return await this.kpiRewardService.kpiRewardRetrieveAll({
      ...payload,
      status: 'PENDING',
    })
  }

  @Get('my')
  @Permissions(PERMISSIONS.KPI_REWARD.READ)
  @ApiOperation({ summary: 'Get my KPI rewards' })
  @ApiResponse({ status: 200, description: 'List of my KPI rewards' })
  async kpiRewardRetrieveMine(
    @Req() req: any,
    @Query() payload: KpiRewardRetrieveQueryDto,
  ) {
    return await this.kpiRewardService.kpiRewardRetrieveAll({
      ...payload,
      userId: req.user.userId,
    })
  }

  @Get(':id')
  @Permissions(PERMISSIONS.KPI_REWARD.READ)
  @ApiOperation({ summary: 'Get KPI reward by ID' })
  @ApiResponse({ status: 200, description: 'KPI reward' })
  async kpiRewardRetrieveOne(@Param('id') id: string) {
    return await this.kpiRewardService.kpiRewardRetrieveOne(id)
  }

  @Post(':id/approve')
  @Permissions(PERMISSIONS.KPI_REWARD.APPROVE)
  @ApiOperation({ summary: 'Approve a KPI reward' })
  @ApiResponse({ status: 200, description: 'KPI reward approved' })
  async kpiRewardApprove(
    @Param('id') id: string,
    @Body() payload: KpiRewardActionDto,
    @Req() req: any,
  ) {
    await this.kpiRewardService.kpiRewardApprove({
      id,
      approvedById: req.user.userId,
      notes: payload.notes,
    })
    return { message: 'KPI reward approved successfully' }
  }

  @Post(':id/pay')
  @Permissions(PERMISSIONS.KPI_REWARD.PAY)
  @ApiOperation({ summary: 'Mark KPI reward as paid' })
  @ApiResponse({ status: 200, description: 'KPI reward marked as paid' })
  async kpiRewardPay(
    @Param('id') id: string,
    @Body() payload: KpiRewardActionDto,
    @Req() req: any,
  ) {
    await this.kpiRewardService.kpiRewardPay({
      id,
      paidBy: req.user.userId,
      notes: payload.notes,
    })
    return { message: 'KPI reward marked as paid' }
  }

  @Post(':id/reject')
  @Permissions(PERMISSIONS.KPI_REWARD.REJECT)
  @ApiOperation({ summary: 'Reject a KPI reward' })
  @ApiResponse({ status: 200, description: 'KPI reward rejected' })
  async kpiRewardReject(
    @Param('id') id: string,
    @Body() payload: KpiRewardRejectDto,
    @Req() req: any,
  ) {
    await this.kpiRewardService.kpiRewardReject({
      id,
      rejectedBy: req.user.userId,
      notes: payload.notes,
    })
    return { message: 'KPI reward rejected' }
  }

  @Post('bulk-approve')
  @Permissions(PERMISSIONS.KPI_REWARD.APPROVE)
  @ApiOperation({ summary: 'Bulk approve KPI rewards' })
  @ApiResponse({ status: 200, description: 'KPI rewards approved' })
  async kpiRewardBulkApprove(
    @Body() payload: { ids: string[] },
    @Req() req: any,
  ) {
    return await this.kpiRewardService.kpiRewardBulkApprove(
      payload.ids,
      req.user.userId,
    )
  }
}
