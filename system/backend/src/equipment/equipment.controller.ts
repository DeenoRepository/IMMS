import { Controller, Get, Post, Put, Delete, Body, Param, Query, UseGuards, Request, ForbiddenException, UseInterceptors, UploadedFile, Res, BadRequestException, NotFoundException } from '@nestjs/common';
import { EquipmentService } from './equipment.service';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
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

  @Get('categories/all')
  async findAllCategories() {
    return this.equipmentService.findAllCategories();
  }

  @Get('categories/:id')
  async findOneCategory(@Param('id') id: string) {
    return this.equipmentService.findOneCategory(id);
  }

  @Post('categories')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async createCategory(@Body() dto: CreateCategoryDto) {
    return this.equipmentService.createCategory(dto);
  }

  @Put('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async updateCategory(@Param('id') id: string, @Body() dto: CreateCategoryDto) {
    return this.equipmentService.updateCategory(id, dto);
  }

  @Delete('categories/:id')
  @UseGuards(RolesGuard)
  @Roles('admin')
  async deleteCategory(@Param('id') id: string) {
    await this.equipmentService.deleteCategory(id);
    return { message: `Category with ID ${id} was successfully deleted.` };
  }

  @Get('standard-template')
  async getStandardTemplate() {
    return this.equipmentService.getStandardTemplate();
  }

  @Put('standard-template')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async updateStandardTemplate(@Body() configs: Array<{ fieldName: string; isVisible: boolean; isRequired: boolean }>) {
    return this.equipmentService.updateStandardTemplate(configs);
  }

  @Post('standard-template')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async addStandardField(
    @Body() dto: { fieldName: string; displayName: string; type: string; isVisible?: boolean; isRequired?: boolean },
  ) {
    return this.equipmentService.addStandardField(dto);
  }

  @Delete('standard-template/:fieldName')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async deleteStandardField(@Param('fieldName') fieldName: string) {
    await this.equipmentService.deleteStandardField(fieldName);
    return { message: `Standard field with code "${fieldName}" was successfully deleted.` };
  }

  @Get('required-documents')
  async getRequiredDocuments(@Query('categoryId') categoryId?: string) {
    return this.equipmentService.getRequiredDocuments(categoryId);
  }

  @Post('required-documents')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async addRequiredDocument(@Body() dto: { documentType: string; categoryId: string | null }) {
    return this.equipmentService.addRequiredDocument(dto);
  }

  @Delete('required-documents/:id')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async deleteRequiredDocument(@Param('id') id: string) {
    await this.equipmentService.deleteRequiredDocument(id);
    return { message: `Required document rule with ID "${id}" was successfully deleted.` };
  }

  @Get('upload-settings')
  async getUploadSettings() {
    return this.equipmentService.getUploadSettings();
  }

  @Put('upload-settings')
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async updateUploadSettings(@Body() dto: { allowedExtensions: string; maxFileSizeMb: number }) {
    return this.equipmentService.updateUploadSettings(dto);
  }

  @Get(':id/missing-documents')
  async getMissingRequiredDocuments(@Param('id') id: string) {
    return this.equipmentService.getMissingRequiredDocuments(id);
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    return this.equipmentService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles('chief_mechanic', 'admin')
  async create(@Body() createDto: CreateEquipmentDto, @Request() req: any) {
    const changedBy = req.user?.username || 'System';
    return this.equipmentService.create(createDto, changedBy);
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
    const changedBy = user?.username || 'System';
    if (user.role === 'mechanic') {
      // Mechanics are restricted to only updating the status field
      if (Object.keys(updateDto).some((key) => key !== 'status')) {
        throw new ForbiddenException('Mechanics are only permitted to update equipment status.');
      }
      if (!updateDto.status) {
        throw new ForbiddenException('Status field is required for update.');
      }
      return this.equipmentService.update(id, { status: updateDto.status }, changedBy);
    }
    // Chief mechanics and admins can update all fields
    return this.equipmentService.update(id, updateDto, changedBy);
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

  @Get(':id/change-log')
  @UseGuards(RolesGuard)
  @Roles('mechanic', 'chief_mechanic', 'admin')
  async getChangeLog(@Param('id') id: string) {
    return this.equipmentService.getChangeLogs(id);
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
    @Body() body: { title: string; description?: string; documentType?: string },
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
      body.documentType,
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
  async deleteDocument(@Param('documentId') documentId: string, @Request() req: any) {
    const deletedBy = req.user?.username || 'System';
    await this.equipmentService.deleteDocument(documentId, deletedBy);
    return { message: `Document with ID ${documentId} was successfully deleted.` };
  }
}
