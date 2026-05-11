import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';

@Injectable()
export class ExercisesService {
  constructor(
    @InjectRepository(Exercise) private readonly repo: Repository<Exercise>,
  ) {}

  async create(dto: CreateExerciseDto): Promise<Exercise> {
    return this.repo.save(this.repo.create(dto));
  }

  async createMany(dtos: CreateExerciseDto[]): Promise<Exercise[]> {
    const entities = dtos.map((d) => this.repo.create(d));
    return this.repo.save(entities);
  }

  async findByRoutine(routineId: string): Promise<Exercise[]> {
    return this.repo.find({
      where: { routine_id: routineId },
      order: { order: 'ASC' },
    });
  }

  async findOne(id: string): Promise<Exercise> {
    const e = await this.repo.findOne({ where: { id } });
    if (!e) throw new NotFoundException(`Exercise ${id} not found`);
    return e;
  }

  async update(id: string, dto: UpdateExerciseDto): Promise<Exercise> {
    await this.repo.update(id, dto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    await this.repo.delete(id);
  }
}
