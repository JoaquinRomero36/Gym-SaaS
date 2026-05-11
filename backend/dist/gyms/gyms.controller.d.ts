import { GymsService } from './gyms.service';
import { CreateGymDto, UpdateGymDto } from './dto';
import { Gym } from './gym.entity';
export declare class GymsController {
    private readonly service;
    constructor(service: GymsService);
    create(dto: CreateGymDto): Promise<Gym>;
    findAll(): Promise<Gym[]>;
    findOne(id: string): Promise<Gym>;
    update(id: string, dto: UpdateGymDto): Promise<Gym>;
    remove(id: string): Promise<void>;
}
