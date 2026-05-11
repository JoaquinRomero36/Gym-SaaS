import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { CoachesService } from './coaches.service';
import { CreateCoachDto, UpdateCoachDto } from './dto';
import { Coach } from './coach.entity';

@Controller('coaches')
export class CoachesController {
  constructor(private readonly service: CoachesService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateCoachDto): Promise<Coach> {
    return this.service.create(dto);
  }

  @Get()
  async findAll(@Query('gym_id') gymId?: string): Promise<Coach[]> {
    return gymId ? this.service.findAllByGym(gymId) : this.service.findAll();
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Coach> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateCoachDto,
  ): Promise<Coach> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
