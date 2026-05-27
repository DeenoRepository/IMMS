import { IsString, IsOptional } from 'class-validator';

export class ReviewChangeDto {
  @IsString()
  @IsOptional()
  rejectionReason?: string;
}
