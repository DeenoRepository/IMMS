import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment, EquipmentStatus } from './entities/equipment.entity';
import { EquipmentDocument } from './entities/equipment-document.entity';
import { EquipmentDocumentVersion } from './entities/equipment-document-version.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import * as fs from 'fs';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
    @InjectRepository(EquipmentDocument)
    private documentRepository: Repository<EquipmentDocument>,
    @InjectRepository(EquipmentDocumentVersion)
    private versionRepository: Repository<EquipmentDocumentVersion>,
  ) {
    // Ensure uploads directory exists
    this.ensureUploadsDir();
    // Seed database if empty
    this.seed();
  }

  private ensureUploadsDir() {
    if (!fs.existsSync('./uploads/documents')) {
      fs.mkdirSync('./uploads/documents', { recursive: true });
    }
  }

  async seed() {
    try {
      const count = await this.equipmentRepository.count();
      if (count === 0) {
        const mockData = [
          {
            name: 'CNC Milling Machine Alpha',
            type: 'CNC',
            location: 'Workshop 1',
            status: EquipmentStatus.ONLINE,
            commissioningDate: new Date('2021-03-15'),
          },
          {
            name: 'Hydraulic Press H-400',
            type: 'Press',
            location: 'Assembly Line B',
            status: EquipmentStatus.WARNING,
            commissioningDate: new Date('2019-06-20'),
          },
          {
            name: 'Main Coolant Pump #2',
            type: 'Pump',
            location: 'Pump Station 1',
            status: EquipmentStatus.OFFLINE,
            commissioningDate: new Date('2023-01-10'),
          },
          {
            name: 'Screw Compressor C-15',
            type: 'Compressor',
            location: 'Power Room',
            status: EquipmentStatus.ONLINE,
            commissioningDate: new Date('2022-08-05'),
          },
        ];
        await this.equipmentRepository.save(mockData);
        console.log('Seeded database with initial equipment.');
      }
    } catch (e) {
      console.error('Failed to seed equipment: ', e);
    }
  }

  async findAll(): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOneBy({ id });
    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }
    return equipment;
  }

  async create(createDto: CreateEquipmentDto): Promise<Equipment> {
    const newEquipment = this.equipmentRepository.create({
      ...createDto,
      commissioningDate: new Date(createDto.commissioningDate),
    });
    return this.equipmentRepository.save(newEquipment);
  }

  async update(id: string, updateDto: UpdateEquipmentDto): Promise<Equipment> {
    const equipment = await this.findOne(id);
    
    // Merge updateDto into entity
    const updated = {
      ...equipment,
      ...updateDto,
      commissioningDate: updateDto.commissioningDate 
        ? new Date(updateDto.commissioningDate) 
        : equipment.commissioningDate,
    };
    
    return this.equipmentRepository.save(updated);
  }

  async remove(id: string): Promise<void> {
    const equipment = await this.findOne(id);
    await this.equipmentRepository.remove(equipment);
  }

  async getDocuments(equipmentId: string): Promise<EquipmentDocument[]> {
    return this.documentRepository.find({
      where: { equipmentId },
      relations: ['versions'],
      order: {
        createdAt: 'DESC',
      },
    });
  }

  async addDocument(
    equipmentId: string,
    title: string,
    description: string | undefined,
    file: { filename: string; originalname: string },
    uploadedBy: string,
  ): Promise<EquipmentDocument> {
    const equipment = await this.findOne(equipmentId);

    const doc = this.documentRepository.create({
      equipmentId: equipment.id,
      title,
      description,
    });
    const savedDoc = await this.documentRepository.save(doc);

    const version = this.versionRepository.create({
      documentId: savedDoc.id,
      versionNumber: 1,
      fileName: file.originalname,
      fileUrl: file.filename,
      uploadedBy,
      changeSummary: 'Initial document upload',
    });
    await this.versionRepository.save(version);

    return this.documentRepository.findOne({
      where: { id: savedDoc.id },
      relations: ['versions'],
    }) as Promise<EquipmentDocument>;
  }

  async addDocumentVersion(
    documentId: string,
    changeSummary: string | undefined,
    file: { filename: string; originalname: string },
    uploadedBy: string,
  ): Promise<EquipmentDocumentVersion> {
    const doc = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['versions'],
    });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const latestVersionNum = doc.versions.reduce((max, v) => (v.versionNumber > max ? v.versionNumber : max), 0);

    const newVersion = this.versionRepository.create({
      documentId: doc.id,
      versionNumber: latestVersionNum + 1,
      fileName: file.originalname,
      fileUrl: file.filename,
      uploadedBy,
      changeSummary: changeSummary || `Uploaded version ${latestVersionNum + 1}`,
    });

    return this.versionRepository.save(newVersion);
  }

  async deleteDocument(documentId: string): Promise<void> {
    const doc = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['versions'],
    });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    // Delete files from disk
    const path = require('path');
    for (const version of doc.versions) {
      const filePath = path.join('./uploads/documents', version.fileUrl);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Failed to delete file ${filePath}:`, e);
        }
      }
    }

    await this.documentRepository.remove(doc);
  }
}
