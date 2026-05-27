import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EquipmentCategory } from './equipment-category.entity';

@Entity('equipment_required_documents')
export class EquipmentRequiredDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_type' })
  documentType: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string | null;

  @ManyToOne(() => EquipmentCategory, { onDelete: 'CASCADE', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: EquipmentCategory | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
