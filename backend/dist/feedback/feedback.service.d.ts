import { Repository } from 'typeorm';
import { FeedbackEntry } from './feedback-entry.entity';
import { CreateFeedbackDto } from './dto';
export declare class FeedbackService {
    private readonly repo;
    private readonly logger;
    constructor(repo: Repository<FeedbackEntry>);
    create(dto: CreateFeedbackDto): Promise<FeedbackEntry>;
    findByUser(userId: string): Promise<FeedbackEntry[]>;
    getLastN(userId: string, n: number): Promise<FeedbackEntry[]>;
    countInRange(userId: string, days: number): Promise<number>;
    averageEffort(userId: string, lastN: number): Promise<number>;
    averageEnergy(userId: string, lastN: number): Promise<number>;
}
