import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { AttendanceLog } from './attendance-log.entity';
import { CreateAttendanceDto } from './dto';

@Injectable()
export class AttendanceService {
  private readonly logger = new Logger(AttendanceService.name);

  constructor(
    @InjectRepository(AttendanceLog) private readonly repo: Repository<AttendanceLog>,
  ) {}

  async create(dto: CreateAttendanceDto): Promise<AttendanceLog> {
    const log = this.repo.create({
      user_id: dto.user_id,
      gym_id: dto.gym_id,
      date: new Date(dto.date),
      completed: dto.completed ?? false,
    });
    return this.repo.save(log);
  }

  async findByUser(userId: string): Promise<AttendanceLog[]> {
    return this.repo.find({ where: { user_id: userId }, order: { date: 'DESC' } });
  }

  async findInRange(userId: string, startDate: Date, endDate: Date): Promise<AttendanceLog[]> {
    return this.repo.find({
      where: { user_id: userId, date: Between(startDate, endDate) },
      order: { date: 'DESC' },
    });
  }

  async getLastAttendance(userId: string): Promise<AttendanceLog | null> {
    const logs = await this.repo.find({
      where: { user_id: userId },
      order: { date: 'DESC' },
      take: 1,
    });
    return logs[0] ?? null;
  }

  async countInRange(userId: string, days: number): Promise<number> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return this.repo.count({
      where: { user_id: userId, date: Between(start, end), completed: true },
    });
  }
}
