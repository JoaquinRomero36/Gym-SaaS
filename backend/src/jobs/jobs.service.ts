import { Injectable, Logger } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { Cron, CronExpression } from '@nestjs/schedule';
import { JobNames } from './job-names';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
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

  // ─── Process batch (paginated) ──────────────────────────────────
  private readonly BATCH_SIZE = 100;

  async processBatch() {
    let processed = 0;
    let cursor: string | undefined;
    let page = 0;

    this.logger.log('🏋️ Starting paginated batch churn prediction');

    while (true) {
      const where: any = { status: UserStatus.ACTIVE };
      if (cursor) where.id = MoreThan(cursor);

      const users = await this.userRepo.find({
        where,
        order: { id: 'ASC' },
        take: this.BATCH_SIZE,
      });

      if (users.length === 0) break;

      page++;
      this.logger.log(`Page ${page}: ${users.length} users (cursor: ${cursor?.slice(0, 8) ?? 'start'})`);

      for (const user of users) {
        try {
          const result = await this.riskService.calculateForUserBatch(user, user.gym_id);

          if (result.category === 'high') {
            await this.coachAlertQueue.add(
              'alert',
              { userId: user.id, score: result.score, gymId: user.gym_id },
              { removeOnComplete: { age: 3600 * 24 } },
            );
          }

          if (result.category === 'high' || result.category === 'medium') {
            await this.triggerMessaging(user.id, result.category);
          }
        } catch (err) {
          this.logger.error(`Batch error for user ${user.id}:`, err);
        }
      }

      processed += users.length;
      cursor = users[users.length - 1].id;
    }

    this.logger.log(`✅ Batch complete: ${processed} total users processed in ${page} pages`);
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
      user_id: user.coach_id,
      channel: 'in-app',
      message: `⚠️ Alerta: ${user.name} tiene alto riesgo de abandono (score: ${score.toFixed(2)})`,
      trigger: 'high_risk',
    });
  }
}