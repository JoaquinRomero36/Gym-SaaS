import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { AiClientService } from '../common/services/ai-client.service';
import { RiskScore, RiskCategory } from './risk-score.entity';
import { ChurnFeatures, ChurnResult } from './risk.types';
import { AttendanceService } from '../attendance/attendance.service';
import { FeedbackService } from '../feedback/feedback.service';
import { User } from '../users/user.entity';

@Injectable()
export class RiskService {
  private readonly logger = new Logger(RiskService.name);
  private readonly highThreshold: number;
  private readonly mediumThreshold: number;

  constructor(
    @InjectRepository(RiskScore) private readonly repo: Repository<RiskScore>,
    private readonly attendanceService: AttendanceService,
    private readonly feedbackService: FeedbackService,
    private readonly tenantService: TenantService,
    private readonly aiClient: AiClientService,
    config: ConfigService,
  ) {
    this.highThreshold = config.get<number>('CHURN_THRESHOLD_HIGH', 0.7);
    this.mediumThreshold = config.get<number>('CHURN_THRESHOLD_MEDIUM', 0.4);
  }

  async calculateFeatures(user: User, gymId?: string): Promise<ChurnFeatures> {
    const lastAttendance = await this.attendanceService.getLastAttendance(user.id, gymId);
    const daysSinceLast = lastAttendance
      ? Math.floor((Date.now() - new Date(lastAttendance.date).getTime()) / 86400000)
      : 999;

    const weeklyFrequency = (await this.attendanceService.countInRange(user.id, 28, gymId)) / 4;

    const tenureDays = Math.floor(
      (Date.now() - new Date(user.joinedAt).getTime()) / 86400000,
    );

    const consistencyScore = Math.min(weeklyFrequency / 4, 1);

    const avgEffort = await this.feedbackService.averageEffort(user.id, 5, gymId);
    const avgEnergy = await this.feedbackService.averageEnergy(user.id, 5, gymId);
    const feedbackCount = await this.feedbackService.countInRange(user.id, 14, gymId);

    return {
      days_since_last_attendance: daysSinceLast,
      weekly_frequency: Math.round(weeklyFrequency * 100) / 100,
      tenure_days: tenureDays,
      consistency_score: Math.round(consistencyScore * 100) / 100,
      avg_effort_level: Math.round(avgEffort * 100) / 100,
      avg_energy_level: Math.round(avgEnergy * 100) / 100,
      feedback_count_last_2w: feedbackCount,
    };
  }

  computeScore(features: ChurnFeatures): { score: number; category: RiskCategory } {
    let score = 0;

    if (features.days_since_last_attendance > 14) score += 0.4;
    else if (features.days_since_last_attendance > 7) score += 0.2;

    if (features.weekly_frequency < 1) score += 0.25;
    else if (features.weekly_frequency < 2) score += 0.1;

    if (features.consistency_score < 0.3) score += 0.15;

    if (features.avg_effort_level < 2.5) score += 0.1;

    if (features.feedback_count_last_2w === 0) score += 0.1;

    score = Math.min(score, 1);

    let category: RiskCategory;
    if (score >= this.highThreshold) category = RiskCategory.HIGH;
    else if (score >= this.mediumThreshold) category = RiskCategory.MEDIUM;
    else category = RiskCategory.LOW;

    return { score, category };
  }

  private parseCategory(category: string): RiskCategory {
    switch (category.toLowerCase()) {
      case 'high': return RiskCategory.HIGH;
      case 'medium': return RiskCategory.MEDIUM;
      default: return RiskCategory.LOW;
    }
  }

  async calculateForUser(user: User, gymId?: string): Promise<ChurnResult> {
    const targetGymId = gymId || this.tenantService.gymId;
    const gId = targetGymId; // use consistently

    const features = await this.calculateFeatures(user, gId);

    // Try AI Service first, fall back to local computation
    const aiResult = await this.aiClient.predictChurn(features);
    let score: number;
    let category: RiskCategory;

    if (aiResult) {
      score = aiResult.score;
      category = this.parseCategory(aiResult.category);
      this.logger.log(`AI Service scored user ${user.id}: ${score.toFixed(4)} (${category})`);
    } else {
      const local = this.computeScore(features);
      score = local.score;
      category = local.category;
      this.logger.log(`Local fallback scored user ${user.id}: ${score.toFixed(4)} (${category})`);
    }

    const existing = await this.repo.findOne({
      where: { user_id: user.id, gym_id: gId },
    });
    if (existing) {
      existing.score = score;
      existing.category = category;
      existing.features = features as any;
      await this.repo.save(existing);
    } else {
      await this.repo.save(
        this.repo.create({
          user_id: user.id,
          gym_id: gId,
          score,
          category,
          features: features as any,
        }),
      );
    }

    this.logger.log(`Risk for ${user.id}: score=${score.toFixed(4)} category=${category}`);
    return { score, category, features };
  }

  async calculateForUserBatch(user: User, gymId: string): Promise<ChurnResult> {
    return this.tenantService.runInTenantContext(gymId, async () => {
      return this.calculateForUser(user, gymId);
    });
  }

  async getLatest(userId: string): Promise<RiskScore | null> {
    const gymId = this.tenantService.safeGymId;
    if (!gymId) {
      const scores = await this.repo.find({
        where: { user_id: userId },
        order: { calculatedAt: 'DESC' },
        take: 1,
      });
      return scores[0] ?? null;
    }
    const scores = await this.repo.find({
      where: { user_id: userId, gym_id: gymId },
      order: { calculatedAt: 'DESC' },
      take: 1,
    });
    return scores[0] ?? null;
  }

  async getFeature(userId: string): Promise<ChurnFeatures | null> {
    const latest = await this.getLatest(userId);
    return (latest?.features ?? null) as unknown as ChurnFeatures | null;
  }
}