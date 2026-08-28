import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsArray,
  IsObject,
  IsEnum,
  IsUrl,
} from 'class-validator';
import { GigStatus } from '@prisma/client';

export class CreateGigDto {
  @IsString()
  @MinLength(5)
  @MaxLength(300)
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subcategory?: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsString()
  @IsOptional()
  @IsUrl()
  fiverrUrl?: string;

  @IsObject()
  @IsOptional()
  pricing?: Record<string, any>;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}

export class UpdateGigDto {
  @IsString()
  @IsOptional()
  @MinLength(5)
  @MaxLength(300)
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  category?: string;

  @IsString()
  @IsOptional()
  @MaxLength(100)
  subcategory?: string;

  @IsArray()
  @IsOptional()
  keywords?: string[];

  @IsString()
  @IsOptional()
  fiverrUrl?: string;

  @IsObject()
  @IsOptional()
  pricing?: Record<string, any>;

  @IsEnum(GigStatus)
  @IsOptional()
  status?: GigStatus;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;
}
