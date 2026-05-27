import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { Equipment } from '../../equipment/entities/equipment.entity';

export enum MaintenanceType {
  PPR = 'PPR',
  REPAIR = 'repair',
}

export enum MaintenanceStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('maintenance')
export class Maintenance {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'equipment_id' })
  equipmentId: string;

  @ManyToOne(() => Equipment, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'equipment_id' })
  equipment: Equipment;

  @Column({
    type: 'varchar',
  })
  type: MaintenanceType;

  @Column({
    type: 'varchar',
    default: MaintenanceStatus.PENDING,
  })
  status: MaintenanceStatus;

  @Column({ name: 'planned_date', type: 'timestamp' })
  plannedDate: Date;

  @Column({ name: 'completed_date', type: 'timestamp', nullable: true })
  completedDate: Date | null;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
