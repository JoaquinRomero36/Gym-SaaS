import { IsUUID, IsNotEmpty, IsBoolean, IsDateString, IsOptional } from 'class-validator';

export class CreateAttendanceDto {
  @IsUUID() @IsNotEmpty() user_id!: string;
  @IsDateString() @IsNotEmpty() date!: string;
  @IsOptional() @IsBoolean() completed?: boolean;
}
