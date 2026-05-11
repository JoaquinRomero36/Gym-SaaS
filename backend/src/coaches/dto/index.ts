import { IsString, IsNotEmpty, IsEmail, IsUUID, IsOptional } from 'class-validator';

export class CreateCoachDto {
  @IsUUID()
  @IsNotEmpty()
  gym_id!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsEmail()
  @IsNotEmpty()
  email!: string;

  @IsOptional()
  @IsString()
  password?: string;
}

export class UpdateCoachDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  password?: string;
}
