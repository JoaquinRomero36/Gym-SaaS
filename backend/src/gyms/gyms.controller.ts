import {
  Controller, Get, Post, Body, Patch, Param, Delete,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Roles } from '../common/decorators/roles.decorator';
import { Public } from '../common/decorators/public.decorator';
import { GymsService } from './gyms.service';
import { CreateGymDto, UpdateGymDto } from './dto';
import { Gym } from './gym.entity';

@Controller('gyms')
export class GymsController {
  constructor(private readonly service: GymsService) {}

  @Post()
  @Roles('admin')
  async create(@Body() dto: CreateGymDto): Promise<Gym> {
    return this.service.create(dto);
  }

  @Get()
  @Roles('admin')
  async findAll(): Promise<Gym[]> {
    return this.service.findAll();
  }

  @Get(':id')
  @Roles('admin')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<Gym> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateGymDto,
  ): Promise<Gym> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
