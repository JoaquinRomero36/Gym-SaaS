import { Repository } from 'typeorm';
import { User } from './user.entity';
export declare class UsersService {
    private readonly repo;
    constructor(repo: Repository<User>);
    findByEmail(email: string): Promise<User | null>;
    findOne(id: string): Promise<User>;
    findAllByGym(gymId: string): Promise<User[]>;
    findAllByCoach(coachId: string): Promise<User[]>;
    create(data: {
        gym_id: string;
        name: string;
        email: string;
        password: string;
        coach_id?: string | null;
        level?: string;
        role?: string;
    }): Promise<User>;
    update(id: string, data: Partial<User>): Promise<User>;
    remove(id: string): Promise<void>;
    validatePassword(user: User, password: string): Promise<boolean>;
}
