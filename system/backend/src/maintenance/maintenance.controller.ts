import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException } from '@nestjs/common';
import { MaintenanceService } from './maintenance.service';
import { CreateMaintenanceDto } from './dto/create-maintenance.dto';
import { UpdateMaintenanceDto } from './dto/update-maintenance.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';

@Controller('maintenance')
@UseGuards(JwtAuthGuard)
export class MaintenanceController {
  constructor(private readonly maintenanceService: MaintenanceService) {}

  @Get()
  @UseGuards(RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  async findAll() {
    return this.maintenanceService.findAll();
  }

  @Get(':id')
  @UseGuards(RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  async findOne(@Param('id') id: string) {
    return this.maintenanceService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async create(@Body() createDto: CreateMaintenanceDto) {
    return this.maintenanceService.create(createDto);
  }

  @Put(':id')
  @UseGuards(RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateMaintenanceDto,
    @Request() req: any,
  ) {
    const user = req.user;
    if (user.role === 'mechanic') {
      // Mechanics are restricted to only updating the status and completedDate fields
      const allowedKeys = ['status', 'completedDate'];
      const updatedKeys = Object.keys(updateDto);
      const isViolation = updatedKeys.some((key) => !allowedKeys.includes(key));
      
      if (isViolation) {
        throw new ForbiddenException('Mechanics are only permitted to update status and completion date.');
      }
      
      return this.maintenanceService.update(id, { 
        status: updateDto.status, 
        completedDate: updateDto.completedDate 
      });
    }
    
    // Chief mechanics and admins can update all fields
    return this.maintenanceService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async remove(@Param('id') id: string) {
    await this.maintenanceService.remove(id);
    return { message: `Maintenance record with ID ${id} was successfully deleted.` };
  }
}
