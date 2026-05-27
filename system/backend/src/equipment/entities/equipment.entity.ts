import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn } from 'typeorm';

export enum EquipmentStatus {
  ONLINE = 'online',
  WARNING = 'warning',
  OFFLINE = 'offline',
}

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  name: string;

  @Column()
  type: string;

  @Column()
  location: string;

  @Column({
    type: 'varchar',
    default: EquipmentStatus.ONLINE,
  })
  status: EquipmentStatus;

  @Column({ name: 'commissioning_date', type: 'timestamp' })
  commissioningDate: Date;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
