import { User } from '../users/user.entity';
import { Gym } from '../gyms/gym.entity';
export declare class AttendanceLog {
    id: string;
    user: User;
    user_id: string;
    gym: Gym;
    gym_id: string;
    date: Date;
    completed: boolean;
    createdAt: Date;
}
