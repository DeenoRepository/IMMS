import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Equipment } from './equipment.entity';
import { EquipmentDocumentVersion } from './equipment-document-version.entity';

@Entity('equipment_documents')
export class EquipmentDocument {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'equipment_id' })
  equipmentId: string;

  @ManyToOne(() => Equipment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column()
  title: string;

  @Column({ nullable: true })
  description: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @OneToMany(() => EquipmentDocumentVersion, (version) => version.document, { cascade: true })
  versions: EquipmentDocumentVersion[];
}
