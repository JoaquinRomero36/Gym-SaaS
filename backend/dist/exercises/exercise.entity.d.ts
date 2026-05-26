import { Routine } from '../routines/routine.entity';
import { Gym } from '../gyms/gym.entity';
export declare class Exercise {
    id: string;
    gym: Gym;
    gym_id?: string;
    routine: Routine;
    routine_id: string;
    name: string;
    sets: number;
    reps: number;
    order: number;
    deletedAt?: Date;
}
