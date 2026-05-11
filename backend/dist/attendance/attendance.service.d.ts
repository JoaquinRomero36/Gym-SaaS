import { Repository } from 'typeorm';
import { AttendanceLog } from './attendance-log.entity';
import { CreateAttendanceDto } from './dto';
export declare class AttendanceService {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<AttendanceLog>);
    create(dto: CreateAttendanceDto): Promise<AttendanceLog>;
    findByUser(userId: string): Promise<AttendanceLog[]>;
    findInRange(userId: string, startDate: Date, endDate: Date): Promise<AttendanceLog[]>;
    getLastAttendance(userId: string): Promise<AttendanceLog | null>;
    countInRange(userId: string, days: number): Promise<number>;
}
