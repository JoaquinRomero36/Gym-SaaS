import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Coach } from './coach.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class CoachesService {
  constructor(
    @InjectRepository(Coach) private readonly repo: Repository<Coach>,
  ) {}

  async create(data: { name: string; email: string; gym_id: string; password?: string }): Promise<Coach> {
    const passwordHash = data.password ? await bcrypt.hash(data.password, 10) : undefined;
    return this.repo.save(this.repo.create({ ...data, passwordHash }));
  }

  async findAll(): Promise<Coach[]> {
    return this.repo.find();
  }

  async findAllByGym(gymId: string): Promise<Coach[]> {
    return this.repo.find({ where: { gym_id: gymId } });
  }

  async findOne(id: string): Promise<Coach> {
    const c = await this.repo.findOne({ where: { id } });
    if (!c) throw new NotFoundException(`Coach ${id} not found`);
    return c;
  }

  async update(id: string, data: Partial<Coach>): Promise<Coach> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
