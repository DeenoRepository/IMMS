import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('equipment_upload_settings')
export class EquipmentUploadSetting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'allowed_extensions', type: 'text', default: 'pdf,docx,xlsx,png,jpg,jpeg,zip,txt' })
  allowedExtensions: string;

  @Column({ name: 'max_file_size_mb', type: 'integer', default: 10 })
  maxFileSizeMb: number;
}
