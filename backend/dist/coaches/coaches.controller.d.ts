import { TenantService } from '../common/services/tenant.service';
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { Coach } from './coach.entity';
export declare class CoachesController {
    private readonly service;
    private readonly tenantService;
    constructor(service: CoachesService, tenantService: TenantService);
    create(dto: CreateCoachDto): Promise<Coach>;
    findAll(): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, dto: UpdateCoachDto): Promise<Coach>;
    remove(id: string): Promise<void>;
}
