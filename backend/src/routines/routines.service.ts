import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { Routine } from './routine.entity';
import { CreateRoutineDto, UpdateRoutineDto } from './dto';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine) private readonly repo: Repository<Routine>,
    private readonly tenantService: TenantService,
  ) {}

  async create(dto: CreateRoutineDto): Promise<Routine> {
    return this.repo.save(
      this.repo.create({
        ...dto,
        gym_id: this.tenantService.gymId,
      }),
    );
  }

  async findAllByGym(): Promise<Routine[]> {
    return this.repo.find({ where: { gym_id: this.tenantService.gymId }, relations: ['exercises'] });
  }

  async findAllByUser(userId: string): Promise<Routine[]> {
    return this.repo.find({
      where: { user_id: userId, gym_id: this.tenantService.gymId },
      relations: ['exercises'],
    });
  }

  async findAllByCoach(coachId: string): Promise<Routine[]> {
    return this.repo.find({
      where: { coach_id: coachId, gym_id: this.tenantService.gymId },
      relations: ['exercises'],
    });
  }

  async findOne(id: string): Promise<Routine> {
    const r = await this.repo.findOne({
      where: { id, gym_id: this.tenantService.gymId },
      relations: ['exercises'],
    });
    if (!r) throw new NotFoundException(`Routine ${id} not found`);
    return r;
  }

  async update(id: string, dto: UpdateRoutineDto): Promise<Routine> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
