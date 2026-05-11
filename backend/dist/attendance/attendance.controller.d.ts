import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto';
import { AttendanceLog } from './attendance-log.entity';
export declare class AttendanceController {
    private readonly service;
    constructor(service: AttendanceService);
    create(dto: CreateAttendanceDto): Promise<AttendanceLog>;
    findByUser(userId: string): Promise<AttendanceLog[]>;
    lastAttendance(userId: string): Promise<AttendanceLog | null>;
    countInRange(userId: string, days: string): Promise<{
        count: number;
    }>;
}
