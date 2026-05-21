import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThan } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { User, UserStatus } from '../users/user.entity';
import { RiskScore, RiskCategory } from '../risk/risk-score.entity';
import { Notification } from '../notifications/notification.entity';
import { AttendanceLog } from '../attendance/attendance-log.entity';

export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  inactiveUsers: number;
  churnedUsers: number;
  usersAtHighRisk: number;
  usersAtMediumRisk: number;
  usersAtLowRisk: number;
  notificationsSentToday: number;
  todayAttendance: number;
  totalCoaches: number;
  totalMembers: number;
  statusBreakdown: { status: string; count: number }[];
  recentRisks: { userId: string; userName: string; score: number; category: string; lastAttendance: string | null }[];
}

@Injectable()
export class StatsService {
  constructor(
    @InjectRepository(User) private readonly userRepo: Repository<User>,
    @InjectRepository(RiskScore) private readonly riskRepo: Repository<RiskScore>,
    @InjectRepository(Notification) private readonly notificationRepo: Repository<Notification>,
    @InjectRepository(AttendanceLog) private readonly attendanceRepo: Repository<AttendanceLog>,
    private readonly tenantService: TenantService,
  ) {}

  async getDashboardStats(): Promise<DashboardStats> {
    const gymId = this.tenantService.gymId;
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const [users, riskScores, notificationsToday, todayAttendance] = await Promise.all([
      this.userRepo.find({ where: { gym_id: gymId } }),
      this.riskRepo.find({
        where: { gym_id: gymId, calculatedAt: MoreThan(this.getStartOfPeriod()) },
        order: { score: 'DESC' },
      }),
      this.notificationRepo.count({
        where: { gym_id: gymId, status: 'sent' as any, sentAt: MoreThan(today) },
      }),
      this.attendanceRepo.count({
        where: { gym_id: gymId, date: MoreThan(today), completed: true },
      }),
    ]);

    const activeUsers = users.filter((u) => u.status === UserStatus.ACTIVE).length;
    const inactiveUsers = users.filter((u) => u.status === UserStatus.INACTIVE).length;
    const churnedUsers = users.filter((u) => u.status === UserStatus.CHURNED).length;

    const highRisk = riskScores.filter(
      (r) => r.category === RiskCategory.HIGH && this.isRecentScore(r.calculatedAt),
    ).length;
    const mediumRisk = riskScores.filter(
      (r) => r.category === RiskCategory.MEDIUM && this.isRecentScore(r.calculatedAt),
    ).length;
    const lowRisk = riskScores.filter(
      (r) => r.category === RiskCategory.LOW && this.isRecentScore(r.calculatedAt),
    ).length;

    const statusBreakdown = [
      { status: 'active', count: activeUsers },
      { status: 'inactive', count: inactiveUsers },
      { status: 'churned', count: churnedUsers },
    ];

    const userMap = new Map(users.map((u) => [u.id, u]));

    const recentRisks = riskScores
      .filter((r) => userMap.has(r.user_id))
      .slice(0, 10)
      .map((r) => {
        const u = userMap.get(r.user_id)!;
        return {
          userId: u.id,
          userName: u.name,
          score: r.score,
          category: r.category,
          lastAttendance: null as string | null,
        };
      });

    return {
      totalUsers: users.length,
      activeUsers,
      inactiveUsers,
      churnedUsers,
      usersAtHighRisk: highRisk,
      usersAtMediumRisk: mediumRisk,
      usersAtLowRisk: lowRisk,
      notificationsSentToday: notificationsToday,
      todayAttendance: todayAttendance,
      totalCoaches: users.filter((u) => u.role === 'coach').length,
      totalMembers: users.filter((u) => u.role === 'member').length,
      statusBreakdown,
      recentRisks,
    };
  }

  private getStartOfPeriod(): Date {
    const d = new Date();
    d.setDate(d.getDate() - 7);
    return d;
  }

  private isRecentScore(date: Date): boolean {
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);
    return date >= weekAgo;
  }
}