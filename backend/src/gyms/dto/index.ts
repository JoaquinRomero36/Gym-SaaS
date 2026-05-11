import { IsString, IsNotEmpty, IsEnum, IsOptional } from 'class-validator';
import { GymPlan } from '../gym.entity';

export class CreateGymDto {
  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsOptional()
  @IsEnum(GymPlan)
  plan?: GymPlan;
}

export class UpdateGymDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEnum(GymPlan)
  plan?: GymPlan;
}
