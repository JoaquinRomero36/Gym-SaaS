import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { ExercisesService } from './exercises.service';
import { CreateExerciseDto, UpdateExerciseDto } from './dto';
import { Exercise } from './exercise.entity';

@Controller('exercises')
export class ExercisesController {
  constructor(private readonly service: ExercisesService) {}

  @Post()
  @Roles('admin', 'coach')
  async create(@Body() dto: CreateExerciseDto): Promise<Exercise> {
    return this.service.create(dto);
  }

  @Post('bulk')
  @Roles('admin', 'coach')
  async createMany(@Body() dtos: CreateExerciseDto[]): Promise<Exercise[]> {
    return this.service.createMany(dtos);
  }

  @Get()
  async findByRoutine(@Query('routine_id', ParseUUIDPipe) routineId: string): Promise<Exercise[]> {
    return this.service.findByRoutine(routineId);
  }

  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Exercise> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'coach')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateExerciseDto,
  ): Promise<Exercise> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
