import { Controller, Get, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { RiskService } from './risk.service';
import { RiskScore } from './risk-score.entity';
import { ChurnFeatures, ChurnResult } from './risk.types';
import { UsersService } from '../users/users.service';

@Controller('risk')
export class RiskController {
  constructor(
    private readonly riskService: RiskService,
    private readonly usersService: UsersService,
  ) {}

  @Post('calculate/:userId')
  async calculate(@Param('userId', ParseUUIDPipe) userId: string): Promise<ChurnResult> {
    const user = await this.usersService.findOne(userId);
    return this.riskService.calculateForUser(user);
  }

  @Get(':userId')
  async getLatest(@Param('userId', ParseUUIDPipe) userId: string): Promise<RiskScore | null> {
    return this.riskService.getLatest(userId);
  }

  @Get(':userId/features')
  async getFeatures(@Param('userId', ParseUUIDPipe) userId: string): Promise<ChurnFeatures | null> {
    return this.riskService.getFeatures(userId);
  }
}
