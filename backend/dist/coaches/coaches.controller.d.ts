import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { Coach } from './coach.entity';
export declare class CoachesController {
    private readonly service;
    constructor(service: CoachesService);
    create(dto: CreateCoachDto): Promise<Coach>;
    findAll(gymId?: string): Promise<Coach[]>;
    findOne(id: string): Promise<Coach>;
    update(id: string, dto: UpdateCoachDto): Promise<Coach>;
    remove(id: string): Promise<void>;
}
