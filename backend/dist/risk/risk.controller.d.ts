import { RiskService } from './risk.service';
import { RiskScore, RiskCategory } from './risk-score.entity';
import { ChurnFeatures, ChurnResult } from './risk.types';
import { UsersService } from '../users/users.service';
import { TenantService } from '../common/services/tenant.service';
export declare class RiskController {
    private readonly riskService;
    private readonly usersService;
    private readonly tenantService;
    constructor(riskService: RiskService, usersService: UsersService, tenantService: TenantService);
    calculate(userId: string): Promise<ChurnResult>;
    getLatest(userId: string): Promise<RiskScore | null>;
    getFeatures(userId: string): Promise<ChurnFeatures | null>;
    getAllScores(category?: RiskCategory): Promise<RiskScore[]>;
}
