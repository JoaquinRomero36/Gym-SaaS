import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { AttendanceLog } from './attendance-log.entity';
import { CreateAttendanceDto } from './dto';
export declare class AttendanceService {
    private readonly repo;
    private readonly tenantService;
    private readonly logger;
    constructor(repo: Repository<AttendanceLog>, tenantService: TenantService);
    private getGymId;
    create(dto: CreateAttendanceDto, gymId?: string): Promise<AttendanceLog>;
    findByUser(userId: string, gymId?: string): Promise<AttendanceLog[]>;
    findInRange(userId: string, startDate: Date, endDate: Date, gymId?: string): Promise<AttendanceLog[]>;
    getLastAttendance(userId: string, gymId?: string): Promise<AttendanceLog | null>;
    countInRange(userId: string, days: number, gymId?: string): Promise<number>;
}
