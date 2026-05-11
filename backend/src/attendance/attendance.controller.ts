import {
  Controller, Get, Post, Body, Param, ParseUUIDPipe, Query,
} from '@nestjs/common';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto';
import { AttendanceLog } from './attendance-log.entity';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post()
  async create(@Body() dto: CreateAttendanceDto): Promise<AttendanceLog> {
    return this.service.create(dto);
  }

  @Get('user/:userId')
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<AttendanceLog[]> {
    return this.service.findByUser(userId);
  }

  @Get('user/:userId/last')
  async lastAttendance(@Param('userId', ParseUUIDPipe) userId: string): Promise<AttendanceLog | null> {
    return this.service.getLastAttendance(userId);
  }

  @Get('user/:userId/count')
  async countInRange(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('days') days: string,
  ): Promise<{ count: number }> {
    const count = await this.service.countInRange(userId, parseInt(days || '7'));
    return { count };
  }
}
