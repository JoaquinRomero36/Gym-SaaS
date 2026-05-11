import { Gym } from '../gyms/gym.entity';
import { Coach } from '../coaches/coach.entity';
import { User } from '../users/user.entity';
import { Exercise } from '../exercises/exercise.entity';
export declare class Routine {
    id: string;
    gym: Gym;
    gym_id: string;
    coach?: Coach;
    coach_id?: string | null;
    user?: User;
    user_id?: string | null;
    name: string;
    createdAt: Date;
    exercises: Exercise[];
}
