import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Equipment } from './equipment.entity';

@Entity('equipment_change_logs')
export class EquipmentChangeLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'equipment_id' })
  equipmentId: string;

  @ManyToOne(() => Equipment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column()
  action: string; // e.g., 'create', 'update_specs', 'update_status', 'add_document', 'add_version', 'delete_document'

  @Column({ name: 'changed_by' })
  changedBy: string;

  @Column({ name: 'change_details', type: 'text' })
  changeDetails: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
