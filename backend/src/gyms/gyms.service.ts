import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Gym } from './gym.entity';

@Injectable()
export class GymsService {
  constructor(@InjectRepository(Gym) private readonly repo: Repository<Gym>) {}

  async findAll(): Promise<Gym[]> {
    return this.repo.find();
  }

  async findOne(id: string): Promise<Gym> {
    const g = await this.repo.findOne({ where: { id } });
    if (!g) throw new NotFoundException(`Gym ${id} not found`);
    return g;
  }

  async create(data: Partial<Gym>): Promise<Gym> {
    return this.repo.save(this.repo.create(data));
  }

  async update(id: string, data: Partial<Gym>): Promise<Gym> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
