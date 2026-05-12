import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { Gym } from './gym.entity';

@Injectable()
export class GymsService {
  constructor(
    @InjectRepository(Gym) private readonly repo: Repository<Gym>,
    private readonly tenantService: TenantService,
  ) {}

  async findAll(): Promise<Gym[]> {
    return this.repo.find({ where: { id: this.tenantService.gymId } });
  }

  async findOne(id: string): Promise<Gym> {
    const g = await this.repo.findOne({ where: { id } });
    if (!g) throw new NotFoundException(`Gym ${id} not found`);
    if (g.id !== this.tenantService.gymId) {
      throw new NotFoundException(`Gym ${id} not found in this tenant`);
    }
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
