import { Repository } from 'typeorm';
import { Coach } from './coach.entity';
export declare class CoachesService {
    private readonly repo;
    constructor(repo: Repository<Coach>);
    create(data: {
        name: string;
        email: string;
        gym_id: string;
        password?: string;
    }): Promise<Coach>;
    findAll(): Promise<Coach[]>;
    findAllByGym(gymId: string): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, data: Partial<Coach>): Promise<Coach>;
    remove(id: string): Promise<void>;
}
