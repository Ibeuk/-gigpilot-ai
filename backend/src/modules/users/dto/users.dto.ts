import { IsString, IsOptional, MaxLength, IsObject } from 'class-validator';

export class UpdateProfileDto {
  @IsString()
  @IsOptional()
  @MaxLength(100)
  name?: string;

  @IsString()
  @IsOptional()
  avatar?: string;
}

export class UpdatePreferencesDto {
  @IsObject()
  preferences: Record<string, any>;
}
