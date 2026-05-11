import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';
import { Exercise } from './exercise.entity';
export declare class ExercisesController {
    private readonly service;
    constructor(service: ExercisesService);
    create(dto: CreateExerciseDto): Promise<Exercise>;
    createMany(dtos: CreateExerciseDto[]): Promise<Exercise[]>;
    findByRoutine(routineId: string): Promise<Exercise[]>;
    findOne(id: string): Promise<Exercise>;
    update(id: string, dto: UpdateExerciseDto): Promise<Exercise>;
    remove(id: string): Promise<void>;
}
