import { IsString, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { EquipmentStatus } from '../entities/equipment.entity';

export class UpdateEquipmentDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  type?: string;

  @IsString()
  @IsOptional()
  location?: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsDateString()
  @IsOptional()
  commissioningDate?: string;
}
