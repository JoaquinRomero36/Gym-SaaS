import { Gym } from '../gyms/gym.entity';
import { User } from '../users/user.entity';
export declare class Coach {
    id: string;
    gym: Gym;
    gym_id: string;
    name: string;
    email: string;
    passwordHash?: string;
    users: User[];
    createdAt: Date;
}
