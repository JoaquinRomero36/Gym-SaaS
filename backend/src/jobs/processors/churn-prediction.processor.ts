import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { JobNames } from '../job-names';
import { JobsService } from '../jobs.service';

@Processor(JobNames.CHURN_PREDICTION)
export class ChurnPredictionProcessor extends WorkerHost {
  private readonly logger = new Logger(ChurnPredictionProcessor.name);

  constructor(private readonly jobsService: JobsService) {
    super();
  }

  async process(job: Job) {
    this.logger.log(`Processing churn prediction job: ${job.name}`);

    if (job.name === 'batch') {
      await this.jobsService.processBatch();
    } else if (job.name === 'single') {
      await this.jobsService.processSingle(job.data.userId);
    }

    this.logger.log(`Churn prediction job completed: ${job.id}`);
  }
}
