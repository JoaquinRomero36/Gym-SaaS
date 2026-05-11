import { RiskService } from './risk.service';
import { RiskScore } from './risk-score.entity';
import { ChurnFeatures, ChurnResult } from './risk.types';
import { UsersService } from '../users/users.service';
export declare class RiskController {
    private readonly riskService;
    private readonly usersService;
    constructor(riskService: RiskService, usersService: UsersService);
    calculate(userId: string): Promise<ChurnResult>;
    getLatest(userId: string): Promise<RiskScore | null>;
    getFeatures(userId: string): Promise<ChurnFeatures | null>;
}
