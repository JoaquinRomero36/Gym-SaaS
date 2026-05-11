import { User } from '../users/user.entity';
import { Gym } from '../gyms/gym.entity';
export declare enum RiskCategory {
    LOW = "low",
    MEDIUM = "medium",
    HIGH = "high"
}
export declare class RiskScore {
    id: string;
    user: User;
    user_id: string;
    gym: Gym;
    gym_id: string;
    score: number;
    category: RiskCategory;
    calculatedAt: Date;
    features?: Record<string, unknown>;
}
