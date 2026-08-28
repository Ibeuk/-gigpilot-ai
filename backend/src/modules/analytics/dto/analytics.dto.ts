import {
  IsString,
  IsOptional,
  IsObject,
  IsUUID,
  IsDateString,
} from 'class-validator';

export class CreateSnapshotDto {
  @IsUUID()
  campaignId: string;

  @IsObject()
  metrics: Record<string, any>;

  @IsObject()
  @IsOptional()
  insights?: Record<string, any>;

  @IsString()
  @IsOptional()
  period?: string;
}

export class QueryAnalyticsDto {
  @IsUUID()
  @IsOptional()
  campaignId?: string;

  @IsDateString()
  @IsOptional()
  startDate?: string;

  @IsDateString()
  @IsOptional()
  endDate?: string;

  @IsString()
  @IsOptional()
  period?: string;
}
