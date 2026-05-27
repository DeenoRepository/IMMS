import { IsString, IsEnum, IsDateString, IsOptional, IsInt, IsNumber, IsArray } from 'class-validator';
import { EquipmentStatus, EquipmentCriticality } from '../entities/equipment.entity';

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

  @IsString()
  @IsOptional()
  serialNumber?: string;

  @IsString()
  @IsOptional()
  manufacturer?: string;

  @IsString()
  @IsOptional()
  model?: string;

  @IsInt()
  @IsOptional()
  manufactureYear?: number;

  @IsString()
  @IsOptional()
  inventoryNumber?: string;

  @IsEnum(EquipmentCriticality)
  @IsOptional()
  criticality?: EquipmentCriticality;

  @IsNumber()
  @IsOptional()
  powerKw?: number;

  @IsString()
  @IsOptional()
  categoryId?: string;

  @IsArray()
  @IsOptional()
  attributeValues?: Array<{ attributeId: string; value: string }>;

  @IsOptional()
  customFields?: Record<string, any>;
}
