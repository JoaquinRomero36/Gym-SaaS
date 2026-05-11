import { Controller, Post, Param, ParseUUIDPipe } from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { JobsService } from './jobs.service';

@Controller('jobs')
export class JobsController {
  constructor(private readonly jobsService: JobsService) {}

  @Post('churn-prediction/:userId')
  @Roles('admin', 'coach')
  async triggerSinglePrediction(@Param('userId', ParseUUIDPipe) userId: string) {
    await this.jobsService.triggerSinglePrediction(userId);
    return { message: `Prediction queued for user ${userId}` };
  }

  @Post('messaging/:userId')
  @Roles('admin', 'coach')
  async triggerMessaging(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Param('trigger') trigger: string,
  ) {
    await this.jobsService.triggerMessaging(userId, trigger);
    return { message: `Messaging queued for user ${userId}` };
  }
}
