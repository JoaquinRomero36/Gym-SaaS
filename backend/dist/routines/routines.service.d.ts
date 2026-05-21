import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { Routine } from './routine.entity';
import { CreateRoutineDto, UpdateRoutineDto } from './dto';
export declare class RoutinesService {
    private readonly repo;
    private readonly tenantService;
    constructor(repo: Repository<Routine>, tenantService: TenantService);
    create(dto: CreateRoutineDto): Promise<Routine>;
    findAllByGym(): Promise<Routine[]>;
    findAllByUser(userId: string): Promise<Routine[]>;
    findAllByCoach(coachId: string): Promise<Routine[]>;
    findOne(id: string): Promise<Routine>;
    update(id: string, dto: UpdateRoutineDto): Promise<Routine>;
    remove(id: string): Promise<void>;
}
