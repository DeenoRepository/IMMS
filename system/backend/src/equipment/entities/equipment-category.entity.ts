import { Entity, PrimaryGeneratedColumn, Column, OneToMany, CreateDateColumn } from 'typeorm';
import { EquipmentCategoryAttribute } from './equipment-category-attribute.entity';

@Entity('equipment_categories')
export class EquipmentCategory {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @Column({ nullable: true })
  description?: string;

  @OneToMany(() => EquipmentCategoryAttribute, (attr) => attr.category, { cascade: true })
  attributes: EquipmentCategoryAttribute[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
