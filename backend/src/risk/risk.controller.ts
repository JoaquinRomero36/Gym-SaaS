import { Controller, Get, Post, Query, Param, ParseUUIDPipe } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RiskService } from './risk.service';
import { RiskScore, RiskCategory } from './risk-score.entity';
import { ChurnFeatures, ChurnResult } from './risk.types';
import { UsersService } from '../users/users.service';
import { TenantService } from '../common/services/tenant.service';

@Controller('risk')
export class RiskController {
  constructor(
    private readonly riskService: RiskService,
    private readonly usersService: UsersService,
    private readonly tenantService: TenantService,
  ) {}

  @Post('calculate/:userId')
  @Roles('admin', 'coach')
  async calculate(@Param('userId', ParseUUIDPipe) userId: string): Promise<ChurnResult> {
    const user = await this.usersService.findOne(userId);
    return this.riskService.calculateForUser(user);
  }

  @Get('all')
  @Roles('admin', 'coach')
  async getAllScores(@Query('category') category?: RiskCategory): Promise<RiskScore[]> {
    const gymId = this.tenantService.gymId;
    return this.riskService.getScoresByGym(gymId, category);
  }

  @Get(':userId')
  @Roles('admin', 'coach', 'member')
  async getLatest(@Param('userId', ParseUUIDPipe) userId: string): Promise<RiskScore | null> {
    return this.riskService.getLatest(userId);
  }

  @Get(':userId/features')
  @Roles('admin', 'coach')
  async getFeatures(@Param('userId', ParseUUIDPipe) userId: string): Promise<ChurnFeatures | null> {
    return this.riskService.getFeature(userId);
  }
}