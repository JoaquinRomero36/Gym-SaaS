import { JobsService } from './jobs.service';
export declare class JobsController {
    private readonly jobsService;
    constructor(jobsService: JobsService);
    triggerSinglePrediction(userId: string): Promise<{
        message: string;
    }>;
    triggerMessaging(userId: string, trigger: string): Promise<{
        message: string;
    }>;
}
