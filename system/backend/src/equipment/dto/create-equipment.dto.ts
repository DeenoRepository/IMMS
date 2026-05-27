import { IsString, IsNotEmpty, IsEnum, IsDateString, IsOptional } from 'class-validator';
import { EquipmentStatus } from '../entities/equipment.entity';

export class CreateEquipmentDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  type: string;

  @IsString()
  @IsNotEmpty()
  location: string;

  @IsEnum(EquipmentStatus)
  @IsOptional()
  status?: EquipmentStatus;

  @IsDateString()
  @IsNotEmpty()
  commissioningDate: string;
}
