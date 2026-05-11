import { IsString, IsNotEmpty, IsEmail, IsUUID, IsEnum, IsOptional } from 'class-validator';
import { UserLevel, UserStatus } from '../user.entity';

export class CreateUserDto {
  @IsUUID() @IsNotEmpty() gym_id!: string;
  @IsOptional() @IsUUID() coach_id?: string;
  @IsString() @IsNotEmpty() name!: string;
  @IsEmail() @IsNotEmpty() email!: string;
  @IsString() @IsNotEmpty() password!: string;
  @IsOptional() @IsEnum(UserLevel) level?: UserLevel;
}

export class UpdateUserDto {
  @IsOptional() @IsString() name?: string;
  @IsOptional() @IsEmail() email?: string;
  @IsOptional() @IsEnum(UserLevel) level?: UserLevel;
  @IsOptional() @IsEnum(UserStatus) status?: UserStatus;
  @IsOptional() @IsUUID() coach_id?: string | null;
}
