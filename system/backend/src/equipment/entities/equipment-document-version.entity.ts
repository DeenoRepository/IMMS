import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, ManyToOne, JoinColumn } from 'typeorm';
import { EquipmentDocument } from './equipment-document.entity';

@Entity('equipment_document_versions')
export class EquipmentDocumentVersion {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ name: 'document_id' })
  documentId: string;

  @ManyToOne(() => EquipmentDocument, (doc) => doc.versions, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'document_id' })
  document: EquipmentDocument;

  @Column({ name: 'version_number', type: 'int' })
  versionNumber: number;

  @Column({ name: 'file_name' })
  fileName: string;

  @Column({ name: 'file_url' })
  fileUrl: string;

  @Column({ name: 'uploaded_by' })
  uploadedBy: string;

  @Column({ name: 'change_summary', nullable: true })
  changeSummary: string;

  @CreateDateColumn({ name: 'uploaded_at' })
  uploadedAt: Date;
}
