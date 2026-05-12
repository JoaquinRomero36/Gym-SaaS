import { Injectable, ConflictException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { User, UserLevel, UserStatus } from './user.entity';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly repo: Repository<User>,
    private readonly tenantService: TenantService,
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.repo.findOne({ where: { email, gym_id: this.tenantService.gymId } });
  }

  async findOne(id: string): Promise<User> {
    const u = await this.repo.findOne({ where: { id, gym_id: this.tenantService.gymId } });
    if (!u) throw new NotFoundException(`User ${id} not found`);
    return u;
  }

  async findAllByGym(gymId: string): Promise<User[]> {
    return this.repo.find({ where: { gym_id: this.tenantService.gymId } });
  }

  async findAllByCoach(coachId: string): Promise<User[]> {
    return this.repo.find({ where: { coach_id: coachId, gym_id: this.tenantService.gymId } });
  }

  async findAllByRole(role: string, gymId: string): Promise<User[]> {
    return this.repo.find({ where: { role: role as any, gym_id: gymId } });
  }

  async create(data: {
    gym_id: string; name: string; email: string; password: string;
    coach_id?: string | null; level?: string; role?: string;
  }): Promise<User> {
    const existing = await this.findByEmail(data.email);
    if (existing) throw new ConflictException('Email already in use');

    const user = this.repo.create({
      gym_id: data.gym_id,
      coach_id: data.coach_id ?? null,
      name: data.name,
      email: data.email,
      passwordHash: await bcrypt.hash(data.password, 10),
      level: (data.level as UserLevel) ?? UserLevel.BEGINNER,
      role: (data.role as any) ?? 'member',
    });
    return this.repo.save(user);
  }

  async update(id: string, data: Partial<User>): Promise<User> {
    await this.repo.update(id, data);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }

  async validatePassword(user: User, password: string): Promise<boolean> {
    return bcrypt.compare(password, user.passwordHash);
  }
}
