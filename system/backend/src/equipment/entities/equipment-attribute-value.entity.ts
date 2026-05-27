import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn, Unique } from 'typeorm';
import { Equipment } from './equipment.entity';
import { EquipmentCategoryAttribute } from './equipment-category-attribute.entity';

@Entity('equipment_attribute_values')
@Unique(['equipmentId', 'attributeId'])
export class EquipmentAttributeValue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'equipment_id' })
  equipmentId: string;

  @ManyToOne(() => Equipment, (eq) => eq.attributeValues, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column({ name: 'attribute_id' })
  attributeId: string;

  @ManyToOne(() => EquipmentCategoryAttribute, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'attribute_id' })
  attribute: EquipmentCategoryAttribute;

  @Column()
  value: string;
}
