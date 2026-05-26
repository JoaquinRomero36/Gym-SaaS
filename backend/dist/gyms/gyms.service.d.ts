import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { Gym } from './gym.entity';
export declare class GymsService {
    private readonly repo;
    private readonly tenantService;
    constructor(repo: Repository<Gym>, tenantService: TenantService);
    findAll(): Promise<Gym[]>;
    findAllPublic(): Promise<{
        id: string;
        name: string;
    }[]>;
    findOne(id: string): Promise<Gym>;
    create(data: Partial<Gym>): Promise<Gym>;
    update(id: string, data: Partial<Gym>): Promise<Gym>;
    remove(id: string): Promise<void>;
}
