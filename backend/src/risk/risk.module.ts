import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RiskScore } from './risk-score.entity';
import { RiskService } from './risk.service';
import { RiskController } from './risk.controller';
import { AttendanceModule } from '../attendance/attendance.module';
import { FeedbackModule } from '../feedback/feedback.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([RiskScore]), AttendanceModule, FeedbackModule, UsersModule],
  controllers: [RiskController],
  providers: [RiskService],
  exports: [RiskService],
})
export class RiskModule {}
