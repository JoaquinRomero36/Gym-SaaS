import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobNames } from './job-names';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User, UserStatus } from '../users/user.entity';
import { RiskService } from '../risk/risk.service';
import { NotificationsService } from '../notifications/notifications.service';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class JobsService {
  private readonly logger = new Logger(JobsService.name);
  private readonly aiServiceUrl: string;

  constructor(
    @InjectQueue(JobNames.CHURN_PREDICTION) private churnQueue: Queue,
    @InjectQueue(JobNames.MESSAGING) private messagingQueue: Queue,
    @InjectQueue(JobNames.COACH_ALERT) private coachAlertQueue: Queue,
    @InjectRepository(User) private userRepo: Repository<User>,
    private riskService: RiskService,
    private notificationsService: NotificationsService,
    private httpService: HttpService,
    config: ConfigService,
  ) {
    this.aiServiceUrl = config.get('AI_SERVICE_URL', 'http://localhost:8000');
  }

  // ─── Cron: daily mass prediction at 2AM ─────────────────────────
  @Cron(CronExpression.EVERY_DAY_AT_2AM)
  async dailyChurnPrediction() {
    this.logger.log('🏋️ Starting daily churn prediction job');
    await this.churnQueue.add(
      'batch',
      {},
      { removeOnComplete: { age: 3600 * 24 }, removeOnFail: { age: 3600 * 24 * 7 } },
    );
  }

  // ─── Trigger single user prediction ─────────────────────────────
  async triggerSinglePrediction(userId: string) {
    await this.churnQueue.add(
      'single',
      { userId },
      { removeOnComplete: { age: 3600 }, removeOnFail: { age: 3600 * 24 } },
    );
  }

  // ─── Trigger messaging for a user ───────────────────────────────
  async triggerMessaging(userId: string, trigger: string) {
    await this.messagingQueue.add(
      'send',
      { userId, trigger },
      { removeOnComplete: { age: 3600 }, removeOnFail: { age: 3600 * 24 } },
    );
  }

  // ─── Process batch ──────────────────────────────────────────────
  async processBatch() {
    const activeUsers = await this.userRepo.find({
      where: { status: UserStatus.ACTIVE },
    });
    this.logger.log(`Processing batch for ${activeUsers.length} users`);

    for (const user of activeUsers) {
      try {
        const result = await this.riskService.calculateForUser(user);

        // If high risk, trigger coach alert
        if (result.category === 'high') {
          await this.coachAlertQueue.add(
            'alert',
            { userId: user.id, score: result.score, gymId: user.gym_id },
            { removeOnComplete: { age: 3600 * 24 } },
          );
        }

        // Send message via AI service
        if (result.category === 'high' || result.category === 'medium') {
          await this.triggerMessaging(user.id, result.category);
        }
      } catch (err) {
        this.logger.error(`Batch error for user ${user.id}:`, err);
      }
    }
  }

  // ─── Process single user ────────────────────────────────────────
  async processSingle(userId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user) {
      this.logger.warn(`User ${userId} not found for single prediction`);
      return;
    }
    await this.riskService.calculateForUser(user);
  }

  // ─── Send message via AI Service ────────────────────────────────
  async processMessage(userId: string, trigger: string) {
    try {
      const features = await this.riskService.getFeature(userId);
      if (!features) {
        this.logger.warn(`No features for user ${userId}`);
        return;
      }

      const user = await this.userRepo.findOne({ where: { id: userId } });
      if (!user) return;

      const { data } = await firstValueFrom(
        this.httpService.post(`${this.aiServiceUrl}/messaging/generate`, {
          days_inactive: features.days_since_last_attendance,
          level: user.level,
          last_effort: features.avg_effort_level,
          last_energy: features.avg_energy_level,
        }),
      );

      await this.notificationsService.create({
        user_id: userId,
        channel: 'in-app',
        message: data.message,
        trigger: trigger as any,
      });

      this.logger.log(`Message sent to user ${userId}`);
    } catch (err) {
      this.logger.error(`Messaging failed for user ${userId}:`, err);
    }
  }

  // ─── Process coach alert ────────────────────────────────────────
  async processCoachAlert(userId: string, score: number, gymId: string) {
    const user = await this.userRepo.findOne({ where: { id: userId } });
    if (!user?.coach_id) return;

    await this.notificationsService.create({
      user_id: user.coach_id as string,
      channel: 'in-app',
      message: `⚠️ Alerta: ${user.name} tiene alto riesgo de abandono (score: ${score.toFixed(2)})`,
      trigger: 'high_risk',
    });
  }
}
