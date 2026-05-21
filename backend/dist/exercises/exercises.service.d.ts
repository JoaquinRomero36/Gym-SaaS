import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { Exercise } from './exercise.entity';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';
export declare class ExercisesService {
    private readonly repo;
    private readonly tenantService;
    constructor(repo: Repository<Exercise>, tenantService: TenantService);
    create(dto: CreateExerciseDto): Promise<Exercise>;
    createMany(dtos: CreateExerciseDto[]): Promise<Exercise[]>;
    findByRoutine(routineId: string): Promise<Exercise[]>;
    findOne(id: string): Promise<Exercise>;
    update(id: string, dto: UpdateExerciseDto): Promise<Exercise>;
    remove(id: string): Promise<void>;
}
