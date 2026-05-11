import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { RiskScore, RiskCategory } from './risk-score.entity';
import { ChurnFeatures, ChurnResult } from './risk.types';
import { AttendanceService } from '../attendance/attendance.service';
import { FeedbackService } from '../feedback/feedback.service';
import { User } from '../users/user.entity';
export declare class RiskService {
    private readonly repo;
    private readonly attendanceService;
    private readonly feedbackService;
    private readonly logger;
    private readonly highThreshold;
    private readonly mediumThreshold;
    constructor(repo: Repository<RiskScore>, attendanceService: AttendanceService, feedbackService: FeedbackService, config: ConfigService);
    calculateFeatures(user: User): Promise<ChurnFeatures>;
    computeScore(features: ChurnFeatures): {
        score: number;
        category: RiskCategory;
    };
    calculateForUser(user: User): Promise<ChurnResult>;
    getLatest(userId: string): Promise<RiskScore | null>;
    getFeatures(userId: string): Promise<ChurnFeatures | null>;
}
