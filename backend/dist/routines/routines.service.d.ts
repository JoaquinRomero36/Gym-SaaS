import { Repository } from 'typeorm';
import { Routine } from './routine.entity';
import { CreateRoutineDto, UpdateRoutineDto } from './dto';
export declare class RoutinesService {
    private readonly repo;
    constructor(repo: Repository<Routine>);
    create(dto: CreateRoutineDto): Promise<Routine>;
    findAllByGym(gymId: string): Promise<Routine[]>;
    findAllByUser(userId: string): Promise<Routine[]>;
    findAllByCoach(coachId: string): Promise<Routine[]>;
    findOne(id: string): Promise<Routine>;
    update(id: string, dto: UpdateRoutineDto): Promise<Routine>;
    remove(id: string): Promise<void>;
}
