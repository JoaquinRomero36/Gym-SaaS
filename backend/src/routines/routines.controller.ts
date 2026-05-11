import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { RoutinesService } from './routines.service';
import { CreateRoutineDto, UpdateRoutineDto } from './dto';
import { Routine } from './routine.entity';

@Controller('routines')
export class RoutinesController {
  constructor(private readonly service: RoutinesService) {}

  @Post()
  @Roles('admin', 'coach')
  async create(@Body() dto: CreateRoutineDto): Promise<Routine> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(
    @Query('gym_id') gymId?: string,
    @Query('user_id') userId?: string,
    @Query('coach_id') coachId?: string,
  ): Promise<Routine[]> {
    if (userId) return this.service.findAllByUser(userId);
    if (coachId) return this.service.findAllByCoach(coachId);
    if (gymId) return this.service.findAllByGym(gymId);
    return [];
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Routine> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'coach')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateRoutineDto,
  ): Promise<Routine> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
