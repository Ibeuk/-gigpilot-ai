import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsObject,
  IsBoolean,
} from 'class-validator';

export class CreateProjectDto {
  @IsString()
  @MinLength(2)
  @MaxLength(200)
  name: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  niche?: string;

  @IsObject()
  @IsOptional()
  targetAudience?: Record<string, any>;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}

export class UpdateProjectDto {
  @IsString()
  @IsOptional()
  @MinLength(2)
  @MaxLength(200)
  name?: string;

  @IsString()
  @IsOptional()
  @MaxLength(1000)
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  niche?: string;

  @IsObject()
  @IsOptional()
  targetAudience?: Record<string, any>;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
