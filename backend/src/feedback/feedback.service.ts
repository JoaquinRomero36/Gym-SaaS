import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { FeedbackEntry } from './feedback-entry.entity';
import { CreateFeedbackDto } from './dto';

@Injectable()
export class FeedbackService {
  private readonly logger = new Logger(FeedbackService.name);

  constructor(
    @InjectRepository(FeedbackEntry) private readonly repo: Repository<FeedbackEntry>,
    private readonly tenantService: TenantService,
  ) {}

  async create(dto: CreateFeedbackDto): Promise<FeedbackEntry> {
    const entry = this.repo.create({
      user_id: dto.user_id,
      gym_id: this.tenantService.gymId,
      date: new Date(dto.date),
      effortLevel: dto.effort_level,
      energyLevel: dto.energy_level,
      note: dto.note,
    });
    return this.repo.save(entry);
  }

  async findByUser(userId: string): Promise<FeedbackEntry[]> {
    return this.repo.find({
      where: { user_id: userId, gym_id: this.tenantService.gymId },
      order: { date: 'DESC' },
    });
  }

  async getLastN(userId: string, n: number): Promise<FeedbackEntry[]> {
    return this.repo.find({
      where: { user_id: userId, gym_id: this.tenantService.gymId },
      order: { date: 'DESC' },
      take: n,
    });
  }

  async countInRange(userId: string, days: number): Promise<number> {
    const end = new Date();
    const start = new Date();
    start.setDate(start.getDate() - days);
    return this.repo.count({
      where: { user_id: userId, gym_id: this.tenantService.gymId, date: Between(start, end) },
    });
  }

  async averageEffort(userId: string, lastN: number): Promise<number> {
    const entries = await this.getLastN(userId, lastN);
    if (!entries.length) return 0;
    return entries.reduce((a, e) => a + e.effortLevel, 0) / entries.length;
  }

  async averageEnergy(userId: string, lastN: number): Promise<number> {
    const entries = await this.getLastN(userId, lastN);
    if (!entries.length) return 0;
    return entries.reduce((a, e) => a + e.energyLevel, 0) / entries.length;
  }
}
