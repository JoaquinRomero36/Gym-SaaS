import { Module } from '@nestjs/common';
import { StatsService } from './stats.service';
import { StatsController } from './stats.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from '../users/user.entity';
import { RiskScore } from '../risk/risk-score.entity';
import { Notification } from '../notifications/notification.entity';
import { AttendanceLog } from '../attendance/attendance-log.entity';
import { TenantService } from '../common/services/tenant.service';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, RiskScore, Notification, AttendanceLog]),
  ],
  providers: [StatsService, TenantService],
  controllers: [StatsController],
  exports: [StatsService],
})
export class StatsModule {}