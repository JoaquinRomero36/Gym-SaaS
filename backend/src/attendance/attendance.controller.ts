import {
  Controller, Get, Post, Body, Param, ParseUUIDPipe, Query,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { AttendanceService } from './attendance.service';
import { CreateAttendanceDto } from './dto';
import { AttendanceLog } from './attendance-log.entity';

@Controller('attendance')
export class AttendanceController {
  constructor(private readonly service: AttendanceService) {}

  @Post()
  @Roles('admin', 'coach', 'member')
  async create(@Body() dto: CreateAttendanceDto): Promise<AttendanceLog> {
    return this.service.create(dto);
  }

  @Get('user/:userId')
  @Roles('admin', 'coach', 'member')
  async findByUser(@Param('userId', ParseUUIDPipe) userId: string): Promise<AttendanceLog[]> {
    return this.service.findByUser(userId);
  }

  @Get('user/:userId/last')
  @Roles('admin', 'coach', 'member')
  async lastAttendance(@Param('userId', ParseUUIDPipe) userId: string): Promise<AttendanceLog | null> {
    return this.service.getLastAttendance(userId);
  }

  @Get('user/:userId/count')
  @Roles('admin', 'coach', 'member')
  async countInRange(
    @Param('userId', ParseUUIDPipe) userId: string,
    @Query('days') days: string,
  ): Promise<{ count: number }> {
    const count = await this.service.countInRange(userId, parseInt(days || '7'));
    return { count };
  }
}
