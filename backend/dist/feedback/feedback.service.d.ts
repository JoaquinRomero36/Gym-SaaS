import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { FeedbackEntry } from './feedback-entry.entity';
import { CreateFeedbackDto } from './dto';
export declare class FeedbackService {
    private readonly repo;
    private readonly tenantService;
    private readonly logger;
    constructor(repo: Repository<FeedbackEntry>, tenantService: TenantService);
    private getGymId;
    create(dto: CreateFeedbackDto, gymId?: string): Promise<FeedbackEntry>;
    findByUser(userId: string, gymId?: string): Promise<FeedbackEntry[]>;
    getLastN(userId: string, n: number, gymId?: string): Promise<FeedbackEntry[]>;
    countInRange(userId: string, days: number, gymId?: string): Promise<number>;
    averageEffort(userId: string, lastN: number, gymId?: string): Promise<number>;
    averageEnergy(userId: string, lastN: number, gymId?: string): Promise<number>;
}
