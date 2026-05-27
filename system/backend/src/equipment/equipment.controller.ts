import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, Request, ForbiddenException, UseInterceptors, UploadedFile, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname, join } from 'path';
import { existsSync } from 'fs';

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

  @Get(':id/documents')
  @UseGuards(RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  async getDocuments(@Param('id') equipmentId: string) {
    return this.equipmentService.getDocuments(equipmentId);
  }

  @Post(':id/documents')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req: any, file: any, cb: any) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async addDocument(
    @Param('id') equipmentId: string,
    @Body() body: { title: string; description?: string },
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const uploadedBy = req.user?.username || 'System';
    return this.equipmentService.addDocument(
      equipmentId,
      body.title,
      body.description,
      file,
      uploadedBy,
    );
  }

  @Post('documents/:documentId/versions')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  @UseInterceptors(FileInterceptor('file', {
    storage: diskStorage({
      destination: './uploads/documents',
      filename: (req: any, file: any, cb: any) => {
        const randomName = Array(32).fill(null).map(() => (Math.round(Math.random() * 16)).toString(16)).join('');
        cb(null, `${randomName}${extname(file.originalname)}`);
      }
    })
  }))
  async addDocumentVersion(
    @Param('documentId') documentId: string,
    @Body() body: { changeSummary?: string },
    @UploadedFile() file: any,
    @Request() req: any,
  ) {
    if (!file) {
      throw new BadRequestException('File is required');
    }
    const uploadedBy = req.user?.username || 'System';
    return this.equipmentService.addDocumentVersion(
      documentId,
      body.changeSummary,
      file,
      uploadedBy,
    );
  }

  @Get('documents/download/:filename')
  @UseGuards(RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  async downloadDocument(
    @Param('filename') filename: string,
    @Res() res: any,
  ) {
    const filePath = join(process.cwd(), 'uploads', 'documents', filename);
    if (!existsSync(filePath)) {
      throw new NotFoundException('Document file not found');
    }
    return res.sendFile(filePath);
  }

  @Delete('documents/:documentId')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async deleteDocument(@Param('documentId') documentId: string) {
    await this.equipmentService.deleteDocument(documentId);
    return { message: `Document with ID ${documentId} was successfully deleted.` };
  }
}
