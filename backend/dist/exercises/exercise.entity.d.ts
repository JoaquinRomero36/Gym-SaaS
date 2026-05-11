import { Routine } from '../routines/routine.entity';
export declare class Exercise {
    id: string;
    routine: Routine;
    routine_id: string;
    name: string;
    sets: number;
    reps: number;
    order: number;
}
