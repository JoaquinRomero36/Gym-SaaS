import { IsString, IsNotEmpty, IsInt, IsUUID, Min, IsOptional } from 'class-validator';

export class CreateExerciseDto {
  @IsUUID()
  @IsNotEmpty()
  routine_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1)
  sets!: number;

  @IsInt()
  @Min(1)
  reps!: number;

  @IsInt()
  @Min(0)
  order!: number;
}

export class UpdateExerciseDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsInt()
  @Min(1)
  sets?: number;

  @IsOptional()
  @IsInt()
  @Min(1)
  reps?: number;

  @IsOptional()
  @IsInt()
  @Min(0)
  order?: number;
}
