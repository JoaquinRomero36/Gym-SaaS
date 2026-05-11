import { IsUUID, IsNotEmpty, IsInt, IsDateString, IsOptional, IsString, Min, Max } from 'class-validator';

export class CreateFeedbackDto {
  @IsUUID() @IsNotEmpty() user_id!: string;
  @IsUUID() @IsNotEmpty() gym_id!: string;
  @IsDateString() @IsNotEmpty() date!: string;
  @IsInt() @Min(1) @Max(5) effort_level!: number;
  @IsInt() @Min(1) @Max(5) energy_level!: number;
  @IsOptional() @IsString() note?: string;
}
