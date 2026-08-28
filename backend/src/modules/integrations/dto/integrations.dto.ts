import { IsString, IsOptional, IsObject } from 'class-validator';

export class ConnectIntegrationDto {
  @IsString()
  @IsOptional()
  code?: string; // OAuth authorization code

  @IsString()
  @IsOptional()
  accessToken?: string;

  @IsString()
  @IsOptional()
  refreshToken?: string;

  @IsObject()
  @IsOptional()
  config?: Record<string, any>;
}
