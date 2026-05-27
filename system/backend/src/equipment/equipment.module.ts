import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Equipment } from './entities/equipment.entity';
import { EquipmentDocument } from './entities/equipment-document.entity';
import { EquipmentDocumentVersion } from './entities/equipment-document-version.entity';
import { EquipmentChangeLog } from './entities/equipment-change-log.entity';
import { EquipmentCategory } from './entities/equipment-category.entity';
import { EquipmentCategoryAttribute } from './entities/equipment-category-attribute.entity';
import { EquipmentAttributeValue } from './entities/equipment-attribute-value.entity';
import { EquipmentStandardTemplate } from './entities/equipment-standard-template.entity';
import { EquipmentRequiredDocument } from './entities/equipment-required-document.entity';
import { EquipmentUploadSetting } from './entities/equipment-upload-setting.entity';
import { EquipmentChangeRequest } from './entities/equipment-change-request.entity';
import { EquipmentService } from './equipment.service';
import { EquipmentController } from './equipment.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Equipment,
      EquipmentDocument,
      EquipmentDocumentVersion,
      EquipmentChangeLog,
      EquipmentCategory,
      EquipmentCategoryAttribute,
      EquipmentAttributeValue,
      EquipmentStandardTemplate,
      EquipmentRequiredDocument,
      EquipmentUploadSetting,
      EquipmentChangeRequest,
    ]),
  ],
  controllers: [EquipmentController],
  providers: [EquipmentService],
  exports: [EquipmentService],
})
export class EquipmentModule {}
