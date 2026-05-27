import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('equipment_standard_templates')
export class EquipmentStandardTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'field_name', unique: true })
  fieldName: string;

  @Column({ name: 'display_name', default: '' })
  displayName: string;

  @Column({ name: 'type', default: 'string' })
  type: string; // 'string' | 'number' | 'date'

  @Column({ name: 'is_visible', default: true })
  isVisible: boolean;

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;

  @Column({ name: 'is_custom', default: true })
  isCustom: boolean;
}
