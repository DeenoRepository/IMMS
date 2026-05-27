import { Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn } from 'typeorm';
import { EquipmentCategory } from './equipment-category.entity';

@Entity('equipment_category_attributes')
export class EquipmentCategoryAttribute {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id' })
  categoryId: string;

  @ManyToOne(() => EquipmentCategory, (cat) => cat.attributes, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'category_id' })
  category: EquipmentCategory;

  @Column()
  name: string;

  @Column({ default: 'string' })
  type: string; // 'string' | 'number'

  @Column({ name: 'is_required', default: false })
  isRequired: boolean;
}
