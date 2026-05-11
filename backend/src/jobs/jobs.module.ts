import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { ScheduleModule } from '@nestjs/schedule';
import { TypeOrmModule } from '@nestjs/typeorm';
import { HttpModule } from '@nestjs/axios';
import { User } from '../users/user.entity';
import { RiskModule } from '../risk/risk.module';
import { NotificationsModule } from '../notifications/notifications.module';
import { JobNames } from './job-names';
import { JobsService } from './jobs.service';
import { JobsController } from './jobs.controller';
import { ChurnPredictionProcessor } from './processors/churn-prediction.processor';
import { MessagingProcessor } from './processors/messaging.processor';
import { CoachAlertProcessor } from './processors/coach-alert.processor';

@Module({
  imports: [
    ScheduleModule.forRoot(),
    BullModule.registerQueue(
      { name: JobNames.CHURN_PREDICTION },
      { name: JobNames.CHURN_SINGLE },
      { name: JobNames.MESSAGING },
      { name: JobNames.COACH_ALERT },
    ),
    TypeOrmModule.forFeature([User]),
    HttpModule,
    RiskModule,
    NotificationsModule,
  ],
  controllers: [JobsController],
  providers: [
    JobsService,
    ChurnPredictionProcessor,
    MessagingProcessor,
    CoachAlertProcessor,
  ],
  exports: [JobsService],
})
export class JobsModule {}
