import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { Coach } from './coach.entity';
export declare class CoachesService {
    private readonly repo;
    private readonly tenantService;
    constructor(repo: Repository<Coach>, tenantService: TenantService);
    create(data: {
        name: string;
        email: string;
        gym_id: string;
        password?: string;
    }): Promise<Coach>;
    findAll(): Promise<Coach[]>;
    findAllByGym(gymId: string): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, data: Partial<Coach>): Promise<Coach>;
    remove(id: string): Promise<void>;
}
