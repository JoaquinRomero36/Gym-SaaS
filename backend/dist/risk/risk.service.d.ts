import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { TenantService } from '../common/services/tenant.service';
import { AiClientService } from '../common/services/ai-client.service';
import { RiskScore, RiskCategory } from './risk-score.entity';
import { ChurnFeatures, ChurnResult } from './risk.types';
import { AttendanceService } from '../attendance/attendance.service';
import { FeedbackService } from '../feedback/feedback.service';
import { User } from '../users/user.entity';
export declare class RiskService {
    private readonly repo;
    private readonly attendanceService;
    private readonly feedbackService;
    private readonly tenantService;
    private readonly aiClient;
    private readonly logger;
    private readonly highThreshold;
    private readonly mediumThreshold;
    constructor(repo: Repository<RiskScore>, attendanceService: AttendanceService, feedbackService: FeedbackService, tenantService: TenantService, aiClient: AiClientService, config: ConfigService);
    calculateFeatures(user: User, gymId?: string): Promise<ChurnFeatures>;
    computeScore(features: ChurnFeatures): {
        score: number;
        category: RiskCategory;
    };
    private parseCategory;
    calculateForUser(user: User, gymId?: string): Promise<ChurnResult>;
    calculateForUserBatch(user: User, gymId: string): Promise<ChurnResult>;
    getLatest(userId: string): Promise<RiskScore | null>;
    getScoresByGym(gymId: string, category?: RiskCategory): Promise<RiskScore[]>;
    getFeature(userId: string): Promise<ChurnFeatures | null>;
}
