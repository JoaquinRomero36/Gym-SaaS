import { WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { JobsService } from '../jobs.service';
export declare class MessagingProcessor extends WorkerHost {
    private readonly jobsService;
    private readonly logger;
    constructor(jobsService: JobsService);
    process(job: Job): Promise<void>;
}
