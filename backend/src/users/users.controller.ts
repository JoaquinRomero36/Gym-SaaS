import {
  Controller, Get, Post, Body, Patch, Param, Delete, Query,
  ParseUUIDPipe, HttpCode, HttpStatus,
} from '@nestjs/common';
import { Public } from '../common/decorators/public.decorator';
import { Roles } from '../common/decorators/roles.decorator';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { User } from './user.entity';

@Controller('users')
export class UsersController {
  constructor(private readonly service: UsersService) {}

  @Post()
  @Roles('admin', 'coach')
  async create(@Body() dto: CreateUserDto): Promise<User> {
    return this.service.create(dto);
  }

  @Get()
  @Roles('admin', 'coach')
  async findAll(
    @Query('gym_id') gymId?: string,
    @Query('coach_id') coachId?: string,
  ): Promise<User[]> {
    if (coachId) return this.service.findAllByCoach(coachId);
    if (gymId) return this.service.findAllByGym(gymId);
    return [];
  }

  @Get(':id')
  @Roles('admin', 'coach', 'member')
  async findOne(@Param('id', ParseUUIDPipe) id: string): Promise<User> {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @Roles('admin', 'coach')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateUserDto,
  ): Promise<User> {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @Roles('admin')
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.service.remove(id);
  }
}
