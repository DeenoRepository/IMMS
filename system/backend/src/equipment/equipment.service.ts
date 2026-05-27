import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Equipment, EquipmentStatus } from './entities/equipment.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';

@Injectable()
export class EquipmentService {
  constructor(
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {
    // Seed database if empty
    this.seed();
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
}
