import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { AttendanceLog } from './attendance-log.entity';
import { CreateAttendanceDto } from './dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(AttendanceLog) private readonly repo: Repository<AttendanceLog>,
    private readonly tenantService: TenantService,
  ) {}

  private getGymId(explicitGymId?: string): string {
    return explicitGymId || this.tenantService.gymId;
  }

  async create(dto: CreateAttendanceDto, gymId?: string): Promise<AttendanceLog> {
    const log = this.repo.create({
      user_id: dto.user_id,
      gym_id: this.getGymId(gymId),
      date: new Date(dto.date),
      completed: dto.completed ?? false,
    });
    return this.repo.save(log);
  }

  async findByUser(userId: string, gymId?: string): Promise<AttendanceLog[]> {
    return this.repo.find({
      where: { user_id: userId, gym_id: this.getGymId(gymId) },
      order: { date: 'DESC' },
    });
  }

  async findInRange(userId: string, startDate: Date, endDate: Date, gymId?: string): Promise<AttendanceLog[]> {
    return this.repo.find({
      where: { user_id: userId, gym_id: this.getGymId(gymId), date: Between(startDate, endDate) },
      order: { date: 'DESC' },
    });
  }

  async getLastAttendance(userId: string, gymId?: string): Promise<AttendanceLog | null> {
    const logs = await this.repo.find({
      where: { user_id: userId, gym_id: this.getGymId(gymId) },
      order: { date: 'DESC' },
      take: 1,
    });
    return logs[0] ?? null;
  }

  async countInRange(userId: string, days: number, gymId?: string): Promise<number> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return this.repo.count({
      where: { user_id: userId, gym_id: this.getGymId(gymId), date: Between(start, end), completed: true },
    });
  }
}
