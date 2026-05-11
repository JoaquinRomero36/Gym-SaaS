import { UserLevel, UserStatus } from '../user.entity';
export declare class CreateUserDto {
    gym_id: string;
    coach_id?: string;
    name: string;
    email: string;
    password: string;
    level?: UserLevel;
}
export declare class UpdateUserDto {
    name?: string;
    email?: string;
    level?: UserLevel;
    status?: UserStatus;
    coach_id?: string | null;
}
