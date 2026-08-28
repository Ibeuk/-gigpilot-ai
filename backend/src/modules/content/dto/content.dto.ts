import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsObject,
  IsEnum,
  IsUUID,
} from 'class-validator';
import { ContentType } from '@prisma/client';

export class CreateContentDto {
  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @IsEnum(ContentType)
  type: ContentType;

  @IsString()
  @MinLength(3)
  @MaxLength(300)
  title: string;

  @IsString()
  @MinLength(1)
  body: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  platform?: string;
}

export class UpdateContentDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(300)
  title?: string;

  @IsString()
  @IsOptional()
  @MinLength(1)
  body?: string;

  @IsObject()
  @IsOptional()
  metadata?: Record<string, any>;

  @IsString()
  @IsOptional()
  platform?: string;
}
