import { GymPlan } from '../gym.entity';
export declare class CreateGymDto {
    name: string;
    plan?: GymPlan;
}
export declare class UpdateGymDto {
    name?: string;
    plan?: GymPlan;
}
