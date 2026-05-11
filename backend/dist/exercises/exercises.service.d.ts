import { Repository } from 'typeorm';
import { Exercise } from './exercise.entity';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';
export declare class ExercisesService {
    private readonly repo;
    constructor(repo: Repository<Exercise>);
    create(dto: CreateExerciseDto): Promise<Exercise>;
    createMany(dtos: CreateExerciseDto[]): Promise<Exercise[]>;
    findByRoutine(routineId: string): Promise<Exercise[]>;
    findOne(id: string): Promise<Exercise>;
    update(id: string, dto: UpdateExerciseDto): Promise<Exercise>;
    remove(id: string): Promise<void>;
}
