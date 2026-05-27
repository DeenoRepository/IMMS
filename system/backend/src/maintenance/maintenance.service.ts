import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Maintenance, MaintenanceType, MaintenanceStatus } from './entities/maintenance.entity';
import { Equipment } from '../equipment/entities/equipment.entity';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';

@Injectable()
export class MaintenanceService {
  constructor(
    @InjectRepository(Maintenance)
    private maintenanceRepository: Repository<Maintenance>,
    @InjectRepository(Equipment)
    private equipmentRepository: Repository<Equipment>,
  ) {
    // Seed database if empty
    this.seed();
  }

  async seed() {
    try {
      // Delay seed slightly to let EquipmentService seed first
      setTimeout(async () => {
        try {
          const count = await this.maintenanceRepository.count();
          if (count === 0) {
            const equipments = await this.equipmentRepository.find();
            if (equipments.length > 0) {
              const mockData = [
                {
                  equipmentId: equipments[0].id,
                  type: MaintenanceType.PPR,
                  status: MaintenanceStatus.PENDING,
                  plannedDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // in 5 days
                  completedDate: null,
                },
                {
                  equipmentId: equipments[1].id,
                  type: MaintenanceType.REPAIR,
                  status: MaintenanceStatus.IN_PROGRESS,
                  plannedDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // planned yesterday
                  completedDate: null,
                },
                {
                  equipmentId: equipments[2].id,
                  type: MaintenanceType.REPAIR,
                  status: MaintenanceStatus.COMPLETED,
                  plannedDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // planned 10 days ago
                  completedDate: new Date(Date.now() - 9 * 24 * 60 * 60 * 1000), // completed 9 days ago
                },
                {
                  equipmentId: equipments[3].id,
                  type: MaintenanceType.PPR,
                  status: MaintenanceStatus.COMPLETED,
                  plannedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), 
                  completedDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
                }
              ];
              await this.maintenanceRepository.save(mockData);
              console.log('Seeded database with initial maintenance records.');
            }
          }
        } catch (innerErr) {
          console.error('Inner seed failed: ', innerErr);
        }
      }, 1000);
    } catch (e) {
      console.error('Failed to seed maintenance: ', e);
    }
  }

  async findAll(): Promise<Maintenance[]> {
    return this.maintenanceRepository.find({
      relations: ['equipment'],
      order: { plannedDate: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Maintenance> {
    const maintenance = await this.maintenanceRepository.findOne({
      where: { id },
      relations: ['equipment'],
    });
    if (!maintenance) {
      throw new NotFoundException(`Maintenance record with ID ${id} not found`);
    }
    return maintenance;
  }

  async create(createDto: CreateMaintenanceDto): Promise<Maintenance> {
    // Validate equipment exists
    const equipment = await this.equipmentRepository.findOneBy({ id: createDto.equipmentId });
    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${createDto.equipmentId} not found`);
    }

    const newMaintenance = this.maintenanceRepository.create({
      ...createDto,
      plannedDate: new Date(createDto.plannedDate),
      completedDate: createDto.completedDate ? new Date(createDto.completedDate) : null,
    });
    const saved = await this.maintenanceRepository.save(newMaintenance);
    return this.findOne(saved.id);
  }

  async update(id: string, updateDto: UpdateMaintenanceDto): Promise<Maintenance> {
    const maintenance = await this.findOne(id);

    if (updateDto.equipmentId) {
      const equipment = await this.equipmentRepository.findOneBy({ id: updateDto.equipmentId });
      if (!equipment) {
        throw new NotFoundException(`Equipment with ID ${updateDto.equipmentId} not found`);
      }
    }

    const updated = {
      ...maintenance,
      ...updateDto,
      plannedDate: updateDto.plannedDate ? new Date(updateDto.plannedDate) : maintenance.plannedDate,
      completedDate: updateDto.completedDate === null 
        ? null 
        : updateDto.completedDate 
          ? new Date(updateDto.completedDate) 
          : maintenance.completedDate,
    };

    const saved = await this.maintenanceRepository.save(updated);
    return this.findOne(saved.id);
  }

  async remove(id: string): Promise<void> {
    const maintenance = await this.findOne(id);
    await this.maintenanceRepository.remove(maintenance);
  }
}
