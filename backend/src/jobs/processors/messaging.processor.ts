import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { JobNames } from '../job-names';
import { JobsService } from '../jobs.service';

@Processor(JobNames.MESSAGING)
export class MessagingProcessor extends WorkerHost {
  private readonly logger = new Logger(MessagingProcessor.name);

  constructor(private readonly jobsService: JobsService) {
    super();
  }

  async process(job: Job) {
    const { userId, trigger } = job.data;
    this.logger.log(`Processing messaging for user ${userId} (${trigger})`);
    await this.jobsService.processMessage(userId, trigger);
    this.logger.log(`Messaging done for user ${userId}`);
  }
}
