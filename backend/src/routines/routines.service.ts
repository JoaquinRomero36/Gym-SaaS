import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Routine } from './routine.entity';
import { CreateRoutineDto, UpdateRoutineDto } from './dto';

@Injectable()
export class RoutinesService {
  constructor(
    @InjectRepository(Routine) private readonly repo: Repository<Routine>,
  ) {}

  async create(dto: CreateRoutineDto): Promise<Routine> {
    return this.repo.save(this.repo.create(dto));
  }

  async findAllByGym(gymId: string): Promise<Routine[]> {
    return this.repo.find({ where: { gym_id: gymId }, relations: ['exercises'] });
  }

  async findAllByUser(userId: string): Promise<Routine[]> {
    return this.repo.find({ where: { user_id: userId }, relations: ['exercises'] });
  }

  async findAllByCoach(coachId: string): Promise<Routine[]> {
    return this.repo.find({ where: { coach_id: coachId }, relations: ['exercises'] });
  }

  async findOne(id: string): Promise<Routine> {
    const r = await this.repo.findOne({ where: { id }, relations: ['exercises'] });
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
