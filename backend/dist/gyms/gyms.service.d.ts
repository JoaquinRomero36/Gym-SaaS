import { Repository } from 'typeorm';
import { Gym } from './gym.entity';
export declare class GymsService {
    private readonly repo;
    constructor(repo: Repository<Gym>);
    findAll(): Promise<Gym[]>;
    findOne(id: string): Promise<Gym>;
    create(data: Partial<Gym>): Promise<Gym>;
    update(id: string, data: Partial<Gym>): Promise<Gym>;
    remove(id: string): Promise<void>;
}
