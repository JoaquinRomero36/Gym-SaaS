import { IsString, IsNotEmpty, IsOptional, IsUUID } from 'class-validator';

export class CreateRoutineDto {
  @IsOptional()
  @IsUUID()
  coach_id?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;

  @IsString()
  @IsNotEmpty()
  name!: string;
}

export class UpdateRoutineDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsUUID()
  coach_id?: string;

  @IsOptional()
  @IsUUID()
  user_id?: string;
}
