import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { Logger } from '@nestjs/common';
import { JobNames } from '../job-names';
import { JobsService } from '../jobs.service';

@Processor(JobNames.COACH_ALERT)
export class CoachAlertProcessor extends WorkerHost {
  private readonly logger = new Logger(CoachAlertProcessor.name);

  constructor(private readonly jobsService: JobsService) {
    super();
  }

  async process(job: Job) {
    const { userId, score, gymId } = job.data;
    this.logger.log(`Processing coach alert for user ${userId}`);
    await this.jobsService.processCoachAlert(userId, score, gymId);
    this.logger.log(`Coach alert done for user ${userId}`);
  }
}
