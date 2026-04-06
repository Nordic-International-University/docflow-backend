import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common'
import { KpiRewardTierService } from './kpi-reward-tier.service'
import {
  KpiRewardTierCreateDto,
  KpiRewardTierUpdateDto,
  KpiRewardTierRetrieveQueryDto,
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
@ApiTags('KPI Reward Tier')
@UseGuards(AuthGuard, PermissionGuard)
@Controller({
  path: 'kpi-reward-tier',
  version: '1',
})
export class KpiRewardTierController {
  constructor(private readonly kpiRewardTierService: KpiRewardTierService) {}

  @Get()
  @Permissions(PERMISSIONS.KPI_REWARD_TIER.LIST)
  @ApiOperation({ summary: 'Get all KPI reward tiers' })
  @ApiResponse({ status: 200, description: 'List of KPI reward tiers' })
  async kpiRewardTierRetrieveAll(
    @Query() payload: KpiRewardTierRetrieveQueryDto,
  ) {
    return await this.kpiRewardTierService.kpiRewardTierRetrieveAll(payload)
  }

  @Get(':id')
  @Permissions(PERMISSIONS.KPI_REWARD_TIER.READ)
  @ApiOperation({ summary: 'Get KPI reward tier by ID' })
  @ApiResponse({ status: 200, description: 'KPI reward tier' })
  async kpiRewardTierRetrieveOne(@Param('id') id: string) {
    return await this.kpiRewardTierService.kpiRewardTierRetrieveOne(id)
  }

  @Post()
  @Permissions(PERMISSIONS.KPI_REWARD_TIER.CREATE)
  @ApiOperation({ summary: 'Create a new KPI reward tier' })
  @ApiResponse({ status: 201, description: 'KPI reward tier created' })
  async kpiRewardTierCreate(
    @Body() payload: KpiRewardTierCreateDto,
    @Req() req: any,
  ) {
    return await this.kpiRewardTierService.kpiRewardTierCreate({
      ...payload,
      createdBy: req.user.userId,
    })
  }

  @Patch(':id')
  @Permissions(PERMISSIONS.KPI_REWARD_TIER.UPDATE)
  @ApiOperation({ summary: 'Update a KPI reward tier' })
  @ApiResponse({ status: 200, description: 'KPI reward tier updated' })
  async kpiRewardTierUpdate(
    @Param('id') id: string,
    @Body() payload: KpiRewardTierUpdateDto,
    @Req() req: any,
  ) {
    return await this.kpiRewardTierService.kpiRewardTierUpdate({
      id,
      ...payload,
      updatedBy: req.user.userId,
    })
  }

  @Delete(':id')
  @Permissions(PERMISSIONS.KPI_REWARD_TIER.DELETE)
  @ApiOperation({ summary: 'Delete a KPI reward tier' })
  @ApiResponse({ status: 200, description: 'KPI reward tier deleted' })
  async kpiRewardTierDelete(@Param('id') id: string) {
    return await this.kpiRewardTierService.kpiRewardTierDelete(id)
  }
}
