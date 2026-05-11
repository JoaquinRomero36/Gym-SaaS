import { Gym } from '../gyms/gym.entity';
import { Coach } from '../coaches/coach.entity';
export declare enum UserLevel {
    BEGINNER = "beginner",
    INTERMEDIATE = "intermediate",
    ADVANCED = "advanced"
}
export declare enum UserStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    CHURNED = "churned"
}
export declare class User {
    id: string;
    gym: Gym;
    gym_id: string;
    coach?: Coach;
    coach_id?: string | null;
    name: string;
    email: string;
    passwordHash: string;
    level: UserLevel;
    joinedAt: Date;
    status: UserStatus;
}
