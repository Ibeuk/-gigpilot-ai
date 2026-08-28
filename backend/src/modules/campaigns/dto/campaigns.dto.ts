import {
  IsString,
  IsOptional,
  MaxLength,
  MinLength,
  IsObject,
  IsEnum,
  IsDateString,
  IsUUID,
} from 'class-validator';
import { CampaignType, CampaignStatus } from '@prisma/client';

export class CreateCampaignDto {
  @IsUUID()
  projectId: string;

  @IsUUID()
  @IsOptional()
  gigId?: string;

  @IsString()
  @MinLength(3)
  @MaxLength(200)
  name: string;

  @IsEnum(CampaignType)
  type: CampaignType;

  @IsObject()
  @IsOptional()
  strategy?: Record<string, any>;

  @IsObject()
  @IsOptional()
  budget?: Record<string, any>;

  @IsObject()
  @IsOptional()
  targeting?: Record<string, any>;

  @IsObject()
  @IsOptional()
  schedule?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}

export class UpdateCampaignDto {
  @IsString()
  @IsOptional()
  @MinLength(3)
  @MaxLength(200)
  name?: string;

  @IsObject()
  @IsOptional()
  strategy?: Record<string, any>;

  @IsObject()
  @IsOptional()
  budget?: Record<string, any>;

  @IsObject()
  @IsOptional()
  targeting?: Record<string, any>;

  @IsObject()
  @IsOptional()
  schedule?: Record<string, any>;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;
}
