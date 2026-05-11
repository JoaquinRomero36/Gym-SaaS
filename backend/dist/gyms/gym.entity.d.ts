import { User } from '../users/user.entity';
import { Coach } from '../coaches/coach.entity';
export declare enum GymPlan {
    BASIC = "basic",
    PRO = "pro",
    ENTERPRISE = "enterprise"
}
export declare class Gym {
    id: string;
    name: string;
    plan: GymPlan;
    createdAt: Date;
    users: User[];
    coaches: Coach[];
}
