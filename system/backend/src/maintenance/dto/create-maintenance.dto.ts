import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { MaintenanceType, MaintenanceStatus } from '../entities/maintenance.entity';

export class CreateMaintenanceDto {
  @IsString()
  @IsNotEmpty()
  equipmentId: string;

  @IsEnum(MaintenanceType)
  @IsNotEmpty()
  type: MaintenanceType;

  @IsEnum(MaintenanceStatus)
  @IsOptional()
  status?: MaintenanceStatus;

  @IsDateString()
  @IsNotEmpty()
  plannedDate: string;

  @IsDateString()
  @IsOptional()
  completedDate?: string;
}
