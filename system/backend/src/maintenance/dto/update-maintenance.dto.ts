import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { MaintenanceType, MaintenanceStatus } from '../entities/maintenance.entity';

export class UpdateMaintenanceDto {
  @IsString()
  @IsOptional()
  equipmentId?: string;

  @IsEnum(MaintenanceType)
  @IsOptional()
  type?: MaintenanceType;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsDateString()
  @IsOptional()
  plannedDate?: string;

  @IsDateString()
  @IsOptional()
  completedDate?: string;
}
