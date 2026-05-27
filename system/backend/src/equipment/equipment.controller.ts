import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('equipment')
@UseGuards(JwtAuthGuard)
export class EquipmentController {
  constructor(private readonly equipmentService: EquipmentService) {}

  @Get()
  async findAll() {
    return this.equipmentService.findAll();
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async create(@Body() createDto: CreateEquipmentDto) {
    return this.equipmentService.create(createDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateEquipmentDto,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'mechanic') {
      // Mechanics are restricted to only updating the status field
      if (Object.keys(updateDto).some((key) => key !== 'status')) {
        throw new ForbiddenException('Mechanics are only permitted to update equipment status.');
      }
      if (!updateDto.status) {
        throw new ForbiddenException('Status field is required for update.');
      }
      return this.equipmentService.update(id, { status: updateDto.status });
    }
    // Chief mechanics and admins can update all fields
    return this.equipmentService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async remove(@Param('id') id: string) {
    await this.equipmentService.remove(id);
    return { message: `Equipment with ID ${id} was successfully deleted.` };
  }
}
