import {
  Controller, Get, Post, Body, Param, ParseUUIDPipe, Query,
} from '@nestjs/common';
import { FeedbackService } from './feedback.service';
import { CreateFeedbackDto } from './dto';
import { FeedbackEntry } from './feedback-entry.entity';

@Controller('feedback')
export class FeedbackController {
  constructor(private readonly service: FeedbackService) {}

  @Post()
  async create(@Body() dto: CreateFeedbackDto): Promise<FeedbackEntry> {
    return this.service.create(dto);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<FeedbackEntry[]> {
    return this.service.findByUser(userId);
  }

  @Get('user/:userId/last')
  async getLastN(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('n') n: string,
  ): Promise<FeedbackEntry[]> {
    return this.service.getLastN(userId, parseInt(n || '5'));
  }

  @Get('user/:userId/averages')
  async getAverages(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('last') last: string,
  ): Promise<{ avgEffort: number; avgEnergy: number }> {
    const n = parseInt(last || '5');
    return {
      avgEffort: await this.service.averageEffort(userId, n),
      avgEnergy: await this.service.averageEnergy(userId, n),
    };
  }

  @Get('user/:userId/count')
  async countInRange(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('days') days: string,
  ): Promise<{ count: number }> {
    const count = await this.service.countInRange(userId, parseInt(days || '14'));
    return { count };
  }
}
