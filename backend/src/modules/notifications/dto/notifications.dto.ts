import { IsOptional, IsEnum, IsString } from 'class-validator';
import { NotificationType } from '@prisma/client';

export class QueryNotificationsDto {
  @IsEnum(NotificationType)
  @IsOptional()
  type?: NotificationType;

  @IsString()
  @IsOptional()
  unreadOnly?: string; // 'true' or 'false'
}
