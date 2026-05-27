import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { EquipmentCategory } from './equipment-category.entity';
import { EquipmentAttributeValue } from './equipment-attribute-value.entity';

export enum EquipmentStatus {
  ONLINE = 'online',
  WARNING = 'warning',
  OFFLINE = 'offline',
}

export enum EquipmentCriticality {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

@Entity('equipment')
export class Equipment {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'category_id', nullable: true })
  categoryId: string;

  @ManyToOne(() => EquipmentCategory, { onDelete: 'SET NULL', nullable: true })
  @JoinColumn({ name: 'category_id' })
  category: EquipmentCategory;

  @OneToMany(() => EquipmentAttributeValue, (val) => val.equipment, { cascade: true })
  attributeValues: EquipmentAttributeValue[];

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

  @Column({ name: 'commissioning_date', type: 'timestamp', nullable: true })
  commissioningDate?: Date;

  @Column({ name: 'serial_number', nullable: true })
  serialNumber: string;

  @Column({ name: 'manufacturer', nullable: true })
  manufacturer: string;

  @Column({ name: 'model', nullable: true })
  model: string;

  @Column({ name: 'manufacture_year', type: 'integer', nullable: true })
  manufactureYear: number;

  @Column({ name: 'inventory_number', nullable: true })
  inventoryNumber: string;

  @Column({
    type: 'varchar',
    name: 'criticality',
    default: EquipmentCriticality.MEDIUM,
  })
  criticality: EquipmentCriticality;

  @Column({ name: 'power_kw', type: 'decimal', precision: 10, scale: 2, nullable: true })
  powerKw: number;

  @Column({ name: 'custom_fields', type: 'jsonb', nullable: true })
  customFields?: Record<string, any>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
