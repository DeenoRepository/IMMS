import { IsNotEmpty, IsObject } from 'class-validator';

export class ProposeChangeDto {
  @IsObject()
  @IsNotEmpty()
  proposedChanges: Record<string, any>;
}
