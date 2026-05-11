import { RoutinesService } from './routines.service';
import { CreateRoutineDto, UpdateRoutineDto } from './dto';
import { Routine } from './routine.entity';
export declare class RoutinesController {
    private readonly service;
    constructor(service: RoutinesService);
    create(dto: CreateRoutineDto): Promise<Routine>;
    findAll(gymId?: string, userId?: string, coachId?: string): Promise<Routine[]>;
    findOne(id: string): Promise<Routine>;
    update(id: string, dto: UpdateRoutineDto): Promise<Routine>;
    remove(id: string): Promise<void>;
}
