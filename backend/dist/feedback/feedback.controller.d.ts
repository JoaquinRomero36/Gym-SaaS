import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto';
import { FeedbackEntry } from './feedback-entry.entity';
export declare class FeedbackController {
    private readonly service;
    constructor(service: FeedbackService);
    create(dto: CreateFeedbackDto): Promise<FeedbackEntry>;
    findByUser(userId: string): Promise<FeedbackEntry[]>;
    getLastN(userId: string, n: string): Promise<FeedbackEntry[]>;
    getAverages(userId: string, last: string): Promise<{
        avgEffort: number;
        avgEnergy: number;
    }>;
    countInRange(userId: string, days: string): Promise<{
        count: number;
    }>;
}
