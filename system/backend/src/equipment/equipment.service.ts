import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, IsNull } from 'typeorm';
import { Equipment, EquipmentStatus, EquipmentCriticality } from './entities/equipment.entity';
import { EquipmentDocument } from './entities/equipment-document.entity';
import { EquipmentDocumentVersion } from './entities/equipment-document-version.entity';
import { EquipmentChangeLog } from './entities/equipment-change-log.entity';
import { EquipmentCategory } from './entities/equipment-category.entity';
import { EquipmentCategoryAttribute } from './entities/equipment-category-attribute.entity';
import { EquipmentAttributeValue } from './entities/equipment-attribute-value.entity';
import { EquipmentStandardTemplate } from './entities/equipment-standard-template.entity';
import { EquipmentRequiredDocument } from './entities/equipment-required-document.entity';
import { EquipmentUploadSetting } from './entities/equipment-upload-setting.entity';
import { CreateEquipmentDto } from './dto/create-equipment.dto';
import { UpdateEquipmentDto } from './dto/update-equipment.dto';
import { CreateCategoryDto } from './dto/create-category.dto';
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
    @InjectRepository(EquipmentChangeLog)
    private changeLogRepository: Repository<EquipmentChangeLog>,
    @InjectRepository(EquipmentCategory)
    private categoryRepository: Repository<EquipmentCategory>,
    @InjectRepository(EquipmentCategoryAttribute)
    private categoryAttributeRepository: Repository<EquipmentCategoryAttribute>,
    @InjectRepository(EquipmentAttributeValue)
    private attributeValueRepository: Repository<EquipmentAttributeValue>,
    @InjectRepository(EquipmentStandardTemplate)
    private standardTemplateRepository: Repository<EquipmentStandardTemplate>,
    @InjectRepository(EquipmentRequiredDocument)
    private requiredDocumentRepository: Repository<EquipmentRequiredDocument>,
    @InjectRepository(EquipmentUploadSetting)
    private uploadSettingRepository: Repository<EquipmentUploadSetting>,
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
      // Seed standard field templates if empty
      const templateCount = await this.standardTemplateRepository.count();
      if (templateCount === 0) {
        const defaults = [
          { fieldName: 'serialNumber', displayName: 'Serial Number', type: 'string', isVisible: true, isRequired: false, isCustom: false },
          { fieldName: 'manufacturer', displayName: 'Manufacturer', type: 'string', isVisible: true, isRequired: false, isCustom: false },
          { fieldName: 'model', displayName: 'Model', type: 'string', isVisible: true, isRequired: false, isCustom: false },
          { fieldName: 'manufactureYear', displayName: 'Manufacture Year', type: 'number', isVisible: true, isRequired: false, isCustom: false },
          { fieldName: 'inventoryNumber', displayName: 'Inventory Number', type: 'string', isVisible: true, isRequired: false, isCustom: false },
          { fieldName: 'powerKw', displayName: 'Power Rating (kW)', type: 'number', isVisible: true, isRequired: false, isCustom: false },
          { fieldName: 'commissioningDate', displayName: 'Commissioning Date', type: 'date', isVisible: true, isRequired: false, isCustom: false },
          { fieldName: 'criticality', displayName: 'Criticality Level', type: 'string', isVisible: true, isRequired: false, isCustom: false },
        ];
        await this.standardTemplateRepository.save(
          defaults.map(d => this.standardTemplateRepository.create(d))
        );
        console.log('Seeded database with default equipment standard field templates.');
      } else {
        // Sync metadata (displayName and type) for existing templates
        const existingTemplates = await this.standardTemplateRepository.find();
        const defaultFieldMaps: Record<string, { displayName: string; type: string }> = {
          serialNumber: { displayName: 'Serial Number', type: 'string' },
          manufacturer: { displayName: 'Manufacturer', type: 'string' },
          model: { displayName: 'Model', type: 'string' },
          manufactureYear: { displayName: 'Manufacture Year', type: 'number' },
          inventoryNumber: { displayName: 'Inventory Number', type: 'string' },
          powerKw: { displayName: 'Power Rating (kW)', type: 'number' },
          commissioningDate: { displayName: 'Commissioning Date', type: 'date' },
          criticality: { displayName: 'Criticality Level', type: 'string' },
        };
        
        for (const t of existingTemplates) {
          const fallback = defaultFieldMaps[t.fieldName];
          if (fallback && (!t.displayName || t.isCustom)) {
            t.displayName = fallback.displayName;
            t.type = fallback.type;
            t.isCustom = false;
            await this.standardTemplateRepository.save(t);
          }
        }
      }

      const categoryCount = await this.categoryRepository.count();
      let seededCategories: EquipmentCategory[] = [];
      if (categoryCount === 0) {
        // Create baseline categories with required and optional attributes
        const cnc = this.categoryRepository.create({
          name: 'CNC Machine',
          description: 'Computer Numerical Control machinery',
          attributes: [
            { name: 'Max Spindle RPM', type: 'number', isRequired: true },
            { name: 'Axis Count', type: 'number', isRequired: true },
            { name: 'Controller Brand', type: 'string', isRequired: false },
          ]
        });
        const pump = this.categoryRepository.create({
          name: 'Pump',
          description: 'Centrifugal and positive displacement pumps',
          attributes: [
            { name: 'Max Flow Rate (m3/h)', type: 'number', isRequired: true },
            { name: 'Inlet Diameter (mm)', type: 'number', isRequired: false },
          ]
        });
        const press = this.categoryRepository.create({
          name: 'Press',
          description: 'Hydraulic and mechanical forming presses',
          attributes: [
            { name: 'Max Pressing Force (Tons)', type: 'number', isRequired: true },
            { name: 'Stroke Length (mm)', type: 'number', isRequired: false },
          ]
        });
        const compressor = this.categoryRepository.create({
          name: 'Compressor',
          description: 'Industrial air and gas compressors',
          attributes: [
            { name: 'Max Pressure (Bar)', type: 'number', isRequired: true },
            { name: 'Air Output (L/min)', type: 'number', isRequired: false },
          ]
        });
        
        seededCategories = await this.categoryRepository.save([cnc, pump, press, compressor]);
        console.log('Seeded database with baseline equipment categories.');
      } else {
        seededCategories = await this.categoryRepository.find({ relations: ['attributes'] });
      }

      // Seed required documents if empty
      const requiredDocsCount = await this.requiredDocumentRepository.count();
      if (requiredDocsCount === 0) {
        const cncCat = seededCategories.find(c => c.name === 'CNC Machine');
        const pumpCat = seededCategories.find(c => c.name === 'Pump');
        const compressorCat = seededCategories.find(c => c.name === 'Compressor');

        const docsToSeed: Array<{ documentType: string; categoryId: string | null }> = [
          // Global
          { documentType: 'Technical Passport', categoryId: null },
          { documentType: 'Instruction Manual', categoryId: null },
        ];

        if (cncCat) {
          docsToSeed.push({ documentType: 'Safety Calibration Protocol', categoryId: cncCat.id });
        }
        if (pumpCat) {
          docsToSeed.push({ documentType: 'Pressure Test Certificate', categoryId: pumpCat.id });
        }
        if (compressorCat) {
          docsToSeed.push({ documentType: 'Vessel Certificate', categoryId: compressorCat.id });
        }

        await this.requiredDocumentRepository.save(
          docsToSeed.map(d => this.requiredDocumentRepository.create(d))
        );
        console.log('Seeded database with default required document templates.');
      }

      // Seed upload settings if empty
      const uploadSettingsCount = await this.uploadSettingRepository.count();
      if (uploadSettingsCount === 0) {
        const defaultSetting = this.uploadSettingRepository.create({
          allowedExtensions: 'pdf,docx,xlsx,png,jpg,jpeg,zip,txt',
          maxFileSizeMb: 10,
        });
        await this.uploadSettingRepository.save(defaultSetting);
        console.log('Seeded database with default equipment document upload settings.');
      }

      const count = await this.equipmentRepository.count();
      if (count === 0) {
        const cncCat = seededCategories.find(c => c.name === 'CNC Machine');
        const pumpCat = seededCategories.find(c => c.name === 'Pump');
        const pressCat = seededCategories.find(c => c.name === 'Press');
        const compressorCat = seededCategories.find(c => c.name === 'Compressor');

        const mockData = [
          {
            name: 'CNC Milling Machine Alpha',
            type: 'CNC',
            location: 'Workshop 1',
            status: EquipmentStatus.ONLINE,
            commissioningDate: new Date('2021-03-15'),
            serialNumber: 'SN-CNC-8821A',
            manufacturer: 'AlphaMach Inc.',
            model: 'X-2000',
            manufactureYear: 2020,
            inventoryNumber: 'INV-2020-0041',
            criticality: EquipmentCriticality.HIGH,
            powerKw: 15.5,
            categoryId: cncCat?.id,
          },
          {
            name: 'Hydraulic Press H-400',
            type: 'Press',
            location: 'Assembly Line B',
            status: EquipmentStatus.WARNING,
            commissioningDate: new Date('2019-06-20'),
            serialNumber: 'SN-PRS-3310B',
            manufacturer: 'PressForge Group',
            model: 'H-400',
            manufactureYear: 2018,
            inventoryNumber: 'INV-2018-0912',
            criticality: EquipmentCriticality.CRITICAL,
            powerKw: 45.0,
            categoryId: pressCat?.id,
          },
          {
            name: 'Main Coolant Pump #2',
            type: 'Pump',
            location: 'Pump Station 1',
            status: EquipmentStatus.OFFLINE,
            commissioningDate: new Date('2023-01-10'),
            serialNumber: 'SN-PMP-1102C',
            manufacturer: 'HydroFlow Systems',
            model: 'P-12',
            manufactureYear: 2022,
            inventoryNumber: 'INV-2022-1083',
            criticality: EquipmentCriticality.MEDIUM,
            powerKw: 7.5,
            categoryId: pumpCat?.id,
          },
          {
            name: 'Screw Compressor C-15',
            type: 'Compressor',
            location: 'Power Room',
            status: EquipmentStatus.ONLINE,
            commissioningDate: new Date('2022-08-05'),
            serialNumber: 'SN-CMP-5590D',
            manufacturer: 'AeroCompress GmbH',
            model: 'C-15',
            manufactureYear: 2021,
            inventoryNumber: 'INV-2021-0254',
            criticality: EquipmentCriticality.LOW,
            powerKw: 11.0,
            categoryId: compressorCat?.id,
          },
        ];
        const savedEquipment = await this.equipmentRepository.save(mockData);

        // Seed some attribute values
        for (const eq of savedEquipment) {
          if (eq.name.includes('CNC')) {
            const rpmAttr = cncCat?.attributes.find(a => a.name === 'Max Spindle RPM');
            const axisAttr = cncCat?.attributes.find(a => a.name === 'Axis Count');
            const brandAttr = cncCat?.attributes.find(a => a.name === 'Controller Brand');
            if (rpmAttr) await this.attributeValueRepository.save({ equipmentId: eq.id, attributeId: rpmAttr.id, value: '8000' });
            if (axisAttr) await this.attributeValueRepository.save({ equipmentId: eq.id, attributeId: axisAttr.id, value: '3' });
            if (brandAttr) await this.attributeValueRepository.save({ equipmentId: eq.id, attributeId: brandAttr.id, value: 'Fanuc' });
          } else if (eq.name.includes('Press')) {
            const forceAttr = pressCat?.attributes.find(a => a.name === 'Max Pressing Force (Tons)');
            const strokeAttr = pressCat?.attributes.find(a => a.name === 'Stroke Length (mm)');
            if (forceAttr) await this.attributeValueRepository.save({ equipmentId: eq.id, attributeId: forceAttr.id, value: '400' });
            if (strokeAttr) await this.attributeValueRepository.save({ equipmentId: eq.id, attributeId: strokeAttr.id, value: '250' });
          } else if (eq.name.includes('Pump')) {
            const flowAttr = pumpCat?.attributes.find(a => a.name === 'Max Flow Rate (m3/h)');
            if (flowAttr) await this.attributeValueRepository.save({ equipmentId: eq.id, attributeId: flowAttr.id, value: '120' });
          } else if (eq.name.includes('Compressor')) {
            const pressAttr = compressorCat?.attributes.find(a => a.name === 'Max Pressure (Bar)');
            if (pressAttr) await this.attributeValueRepository.save({ equipmentId: eq.id, attributeId: pressAttr.id, value: '10' });
          }
        }
        console.log('Seeded database with equipment attribute values.');
      }
    } catch (e) {
      console.error('Failed to seed equipment: ', e);
    }
  }

  async findAll(): Promise<Equipment[]> {
    return this.equipmentRepository.find({
      relations: ['category', 'attributeValues', 'attributeValues.attribute'],
      order: { createdAt: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Equipment> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id },
      relations: ['category', 'attributeValues', 'attributeValues.attribute'],
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${id} not found`);
    }
    return equipment;
  }

  async create(createDto: CreateEquipmentDto, changedBy: string = 'System'): Promise<Equipment> {
    await this.validateStandardTemplateRules(createDto);

    if (createDto.categoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: createDto.categoryId },
        relations: ['attributes'],
      });
      if (!category) {
        throw new NotFoundException(`Equipment category with ID ${createDto.categoryId} not found`);
      }
      this.validateAttributes(category.attributes, createDto.attributeValues);
    }

    const { attributeValues, ...rest } = createDto;

    const newEquipment = this.equipmentRepository.create({
      ...rest,
      commissioningDate: createDto.commissioningDate ? new Date(createDto.commissioningDate) : undefined,
    });
    const saved = await this.equipmentRepository.save(newEquipment);

    if (createDto.categoryId && attributeValues) {
      for (const val of attributeValues) {
        await this.attributeValueRepository.save({
          equipmentId: saved.id,
          attributeId: val.attributeId,
          value: String(val.value),
        });
      }
    }

    await this.logChange(saved.id, 'create', changedBy, 'Equipment card created');
    return this.findOne(saved.id);
  }

  async update(id: string, updateDto: UpdateEquipmentDto, changedBy: string = 'System'): Promise<Equipment> {
    const equipment = await this.findOne(id);
    await this.validateStandardTemplateRules(updateDto, true, equipment);
    
    const activeCategoryId = updateDto.categoryId !== undefined ? updateDto.categoryId : equipment.categoryId;
    
    if (activeCategoryId) {
      const category = await this.categoryRepository.findOne({
        where: { id: activeCategoryId },
        relations: ['attributes'],
      });
      if (!category) {
        throw new NotFoundException(`Equipment category not found`);
      }
      
      if (updateDto.categoryId !== undefined || updateDto.attributeValues !== undefined) {
        const mergedValues: Array<{ attributeId: string; value: string }> = [];
        const newValuesMap = new Map((updateDto.attributeValues || []).map(v => [v.attributeId, v.value]));
        
        if (equipment.categoryId === activeCategoryId && equipment.attributeValues) {
          for (const ev of equipment.attributeValues) {
            if (!newValuesMap.has(ev.attributeId)) {
              mergedValues.push({ attributeId: ev.attributeId, value: ev.value });
            }
          }
        }
        
        for (const [attrId, val] of newValuesMap.entries()) {
          mergedValues.push({ attributeId: attrId, value: val });
        }
        
        this.validateAttributes(category.attributes, mergedValues);
      }
    }

    // Detect changes and construct a change detail string.
    const changes: string[] = [];
    let isStatusChange = false;
    let isSpecsChange = false;

    if (updateDto.name && updateDto.name !== equipment.name) {
      changes.push(`Name changed: "${equipment.name}" -> "${updateDto.name}"`);
      isSpecsChange = true;
    }
    if (updateDto.type && updateDto.type !== equipment.type) {
      changes.push(`Type changed: "${equipment.type}" -> "${updateDto.type}"`);
      isSpecsChange = true;
    }
    if (updateDto.location && updateDto.location !== equipment.location) {
      changes.push(`Location changed: "${equipment.location}" -> "${updateDto.location}"`);
      isSpecsChange = true;
    }
    if (updateDto.status && updateDto.status !== equipment.status) {
      changes.push(`Status changed: "${equipment.status}" -> "${updateDto.status}"`);
      isStatusChange = true;
    }
    if (updateDto.commissioningDate) {
      const oldDate = equipment.commissioningDate ? new Date(equipment.commissioningDate).toISOString().split('T')[0] : 'N/A';
      const newDate = new Date(updateDto.commissioningDate).toISOString().split('T')[0];
      if (oldDate !== newDate) {
        changes.push(`Commissioning date changed: "${oldDate}" -> "${newDate}"`);
        isSpecsChange = true;
      }
    }
    if (updateDto.serialNumber !== undefined && updateDto.serialNumber !== equipment.serialNumber) {
      changes.push(`Serial Number changed: "${equipment.serialNumber || 'N/A'}" -> "${updateDto.serialNumber || 'N/A'}"`);
      isSpecsChange = true;
    }
    if (updateDto.manufacturer !== undefined && updateDto.manufacturer !== equipment.manufacturer) {
      changes.push(`Manufacturer changed: "${equipment.manufacturer || 'N/A'}" -> "${updateDto.manufacturer || 'N/A'}"`);
      isSpecsChange = true;
    }
    if (updateDto.model !== undefined && updateDto.model !== equipment.model) {
      changes.push(`Model changed: "${equipment.model || 'N/A'}" -> "${updateDto.model || 'N/A'}"`);
      isSpecsChange = true;
    }
    if (updateDto.manufactureYear !== undefined && Number(updateDto.manufactureYear) !== Number(equipment.manufactureYear)) {
      changes.push(`Manufacture Year changed: "${equipment.manufactureYear || 'N/A'}" -> "${updateDto.manufactureYear || 'N/A'}"`);
      isSpecsChange = true;
    }
    if (updateDto.inventoryNumber !== undefined && updateDto.inventoryNumber !== equipment.inventoryNumber) {
      changes.push(`Inventory Number changed: "${equipment.inventoryNumber || 'N/A'}" -> "${updateDto.inventoryNumber || 'N/A'}"`);
      isSpecsChange = true;
    }
    if (updateDto.criticality !== undefined && updateDto.criticality !== equipment.criticality) {
      changes.push(`Criticality changed: "${equipment.criticality || 'N/A'}" -> "${updateDto.criticality || 'N/A'}"`);
      isSpecsChange = true;
    }
    if (updateDto.powerKw !== undefined && (updateDto.powerKw === null ? null : Number(updateDto.powerKw)) !== (equipment.powerKw === null ? null : Number(equipment.powerKw))) {
      changes.push(`Power Rating changed: "${equipment.powerKw || 'N/A'} kW" -> "${updateDto.powerKw || 'N/A'} kW"`);
      isSpecsChange = true;
    }
    if (updateDto.categoryId !== undefined && updateDto.categoryId !== equipment.categoryId) {
      const oldCatName = equipment.category?.name || 'None';
      let newCatName = 'None';
      if (updateDto.categoryId) {
        const cat = await this.categoryRepository.findOneBy({ id: updateDto.categoryId });
        newCatName = cat?.name || 'None';
      }
      changes.push(`Category changed: "${oldCatName}" -> "${newCatName}"`);
      isSpecsChange = true;
    }
    if (activeCategoryId && updateDto.attributeValues) {
      const category = await this.categoryRepository.findOne({
        where: { id: activeCategoryId },
        relations: ['attributes'],
      });
      if (category) {
        const attrMap = new Map(category.attributes.map(a => [a.id, a]));
        const oldValsMap = new Map((equipment.attributeValues || []).map(v => [v.attributeId, v]));
        
        for (const newVal of updateDto.attributeValues) {
          const attr = attrMap.get(newVal.attributeId);
          if (attr) {
            const oldValObj = oldValsMap.get(newVal.attributeId);
            const oldValText = oldValObj ? oldValObj.value : '';
            const newValText = String(newVal.value);
            
            if (oldValText !== newValText) {
              changes.push(`Attribute "${attr.name}" changed: "${oldValText || 'N/A'}" -> "${newValText || 'N/A'}"`);
              isSpecsChange = true;
            }
          }
        }
      }
    }

    if (updateDto.customFields) {
      const templates = await this.standardTemplateRepository.find();
      for (const temp of templates) {
        if (temp.isCustom) {
          const oldVal = equipment.customFields?.[temp.fieldName];
          const newVal = updateDto.customFields[temp.fieldName];
          if (newVal !== undefined && newVal !== oldVal) {
            changes.push(`Field "${temp.displayName || temp.fieldName}" changed: "${oldVal ?? 'N/A'}" -> "${newVal ?? 'N/A'}"`);
            isSpecsChange = true;
          }
        }
      }
    }

    const { attributeValues, ...rest } = updateDto;

    const updated = {
      ...equipment,
      ...rest,
      customFields: updateDto.customFields !== undefined
        ? { ...equipment.customFields, ...updateDto.customFields }
        : equipment.customFields,
      commissioningDate: updateDto.commissioningDate 
        ? new Date(updateDto.commissioningDate) 
        : equipment.commissioningDate,
    };
    const saved = await this.equipmentRepository.save(updated);

    if (updateDto.attributeValues) {
      if (updateDto.categoryId !== undefined && updateDto.categoryId !== equipment.categoryId) {
        await this.attributeValueRepository.delete({ equipmentId: id });
      }

      for (const val of updateDto.attributeValues) {
        const existing = await this.attributeValueRepository.findOne({
          where: { equipmentId: id, attributeId: val.attributeId },
        });
        if (existing) {
          existing.value = String(val.value);
          await this.attributeValueRepository.save(existing);
        } else {
          await this.attributeValueRepository.save({
            equipmentId: id,
            attributeId: val.attributeId,
            value: String(val.value),
          });
        }
      }
    }

    if (changes.length > 0) {
      const action = isSpecsChange && isStatusChange 
        ? 'update_specs' 
        : isStatusChange 
          ? 'update_status' 
          : 'update_specs';
      await this.logChange(id, action, changedBy, changes.join('\n'));
    }

    return this.findOne(id);
  }

  private validateAttributes(attributes: EquipmentCategoryAttribute[], values: Array<{ attributeId: string; value: string }> | undefined) {
    const valuesMap = new Map((values || []).map(v => [v.attributeId, v.value]));
    
    for (const attr of attributes) {
      const val = valuesMap.get(attr.id);
      if (attr.isRequired && (val === undefined || val === null || String(val).trim() === '')) {
        throw new BadRequestException(`Attribute "${attr.name}" is mandatory for this category.`);
      }
    }
  }

  // Category methods
  async findAllCategories(): Promise<EquipmentCategory[]> {
    return this.categoryRepository.find({
      relations: ['attributes'],
      order: { name: 'ASC' },
    });
  }

  async findOneCategory(id: string): Promise<EquipmentCategory> {
    const cat = await this.categoryRepository.findOne({
      where: { id },
      relations: ['attributes'],
    });
    if (!cat) {
      throw new NotFoundException(`Category with ID ${id} not found`);
    }
    return cat;
  }

  async createCategory(dto: CreateCategoryDto): Promise<EquipmentCategory> {
    const cat = this.categoryRepository.create({
      name: dto.name,
      description: dto.description,
      attributes: dto.attributes || [],
    });
    return this.categoryRepository.save(cat);
  }

  async updateCategory(id: string, dto: CreateCategoryDto): Promise<EquipmentCategory> {
    const cat = await this.findOneCategory(id);
    
    cat.name = dto.name;
    cat.description = dto.description || undefined;
    
    await this.categoryAttributeRepository.delete({ categoryId: id });
    
    if (dto.attributes) {
      cat.attributes = dto.attributes.map(a => this.categoryAttributeRepository.create(a));
    } else {
      cat.attributes = [];
    }
    
    return this.categoryRepository.save(cat);
  }

  async deleteCategory(id: string): Promise<void> {
    const cat = await this.findOneCategory(id);
    await this.categoryRepository.remove(cat);
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
    file: { filename: string; originalname: string; size?: number },
    uploadedBy: string,
    documentType?: string,
  ): Promise<EquipmentDocument> {
    await this.validateUploadedFile(file);
    const equipment = await this.findOne(equipmentId);

    const doc = this.documentRepository.create({
      equipmentId: equipment.id,
      title,
      description,
      documentType: documentType || 'Other',
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

    await this.logChange(
      equipment.id,
      'add_document',
      uploadedBy,
      `Document "${title}" added (initial version uploaded: "${file.originalname}")`
    );

    return this.documentRepository.findOne({
      where: { id: savedDoc.id },
      relations: ['versions'],
    }) as Promise<EquipmentDocument>;
  }

  async addDocumentVersion(
    documentId: string,
    changeSummary: string | undefined,
    file: { filename: string; originalname: string; size?: number },
    uploadedBy: string,
  ): Promise<EquipmentDocumentVersion> {
    await this.validateUploadedFile(file);
    const doc = await this.documentRepository.findOne({
      where: { id: documentId },
      relations: ['versions'],
    });
    if (!doc) {
      throw new NotFoundException(`Document with ID ${documentId} not found`);
    }

    const latestVersionNum = doc.versions.reduce((max, v) => (v.versionNumber > max ? v.versionNumber : max), 0);
    const newVersionNum = latestVersionNum + 1;

    const newVersion = this.versionRepository.create({
      documentId: doc.id,
      versionNumber: newVersionNum,
      fileName: file.originalname,
      fileUrl: file.filename,
      uploadedBy,
      changeSummary: changeSummary || `Uploaded version ${newVersionNum}`,
    });

    const savedVersion = await this.versionRepository.save(newVersion);

    await this.logChange(
      doc.equipmentId,
      'add_version',
      uploadedBy,
      `New version ${newVersionNum} uploaded for document "${doc.title}": "${file.originalname}"${changeSummary ? ` - Reason: ${changeSummary}` : ''}`
    );

    return savedVersion;
  }

  async deleteDocument(documentId: string, deletedBy: string = 'System'): Promise<void> {
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

    const equipmentId = doc.equipmentId;
    const docTitle = doc.title;

    await this.documentRepository.remove(doc);

    await this.logChange(
      equipmentId,
      'delete_document',
      deletedBy,
      `Document "${docTitle}" was deleted`
    );
  }

  async getChangeLogs(equipmentId: string): Promise<EquipmentChangeLog[]> {
    return this.changeLogRepository.find({
      where: { equipmentId },
      order: { createdAt: 'DESC' },
    });
  }

  async logChange(
    equipmentId: string,
    action: string,
    changedBy: string,
    changeDetails: string,
  ): Promise<EquipmentChangeLog> {
    const log = this.changeLogRepository.create({
      equipmentId,
      action,
      changedBy,
      changeDetails,
    });
    return this.changeLogRepository.save(log);
  }

  async getStandardTemplate(): Promise<EquipmentStandardTemplate[]> {
    return this.standardTemplateRepository.find({ order: { fieldName: 'ASC' } });
  }

  async updateStandardTemplate(
    configs: Array<{ fieldName: string; isVisible: boolean; isRequired: boolean }>,
  ): Promise<EquipmentStandardTemplate[]> {
    for (const config of configs) {
      let temp = await this.standardTemplateRepository.findOneBy({ fieldName: config.fieldName });
      if (!temp) {
        temp = this.standardTemplateRepository.create({ fieldName: config.fieldName });
      }
      temp.isVisible = config.isVisible;
      temp.isRequired = config.isVisible ? config.isRequired : false;
      await this.standardTemplateRepository.save(temp);
    }
    return this.getStandardTemplate();
  }

  async addStandardField(dto: {
    fieldName: string;
    displayName: string;
    type: string;
    isVisible?: boolean;
    isRequired?: boolean;
  }): Promise<EquipmentStandardTemplate> {
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(dto.fieldName)) {
      throw new BadRequestException('Field Code must start with a letter and contain only alphanumeric characters or underscores.');
    }
    
    const baselineKeys = ['serialNumber', 'manufacturer', 'model', 'manufactureYear', 'inventoryNumber', 'powerKw', 'commissioningDate', 'criticality', 'name', 'type', 'location', 'status'];
    if (baselineKeys.includes(dto.fieldName)) {
      throw new BadRequestException('Field Code conflicts with a pre-existing system field.');
    }

    let field = await this.standardTemplateRepository.findOneBy({ fieldName: dto.fieldName });
    if (field) {
      throw new BadRequestException(`Field with code "${dto.fieldName}" already exists.`);
    }

    field = this.standardTemplateRepository.create({
      fieldName: dto.fieldName,
      displayName: dto.displayName,
      type: dto.type,
      isVisible: dto.isVisible ?? true,
      isRequired: dto.isRequired ?? false,
      isCustom: true,
    });
    return this.standardTemplateRepository.save(field);
  }

  async deleteStandardField(fieldName: string): Promise<void> {
    const field = await this.standardTemplateRepository.findOneBy({ fieldName });
    if (!field) {
      throw new NotFoundException(`Field with code "${fieldName}" not found.`);
    }
    if (!field.isCustom) {
      throw new BadRequestException('Pre-existing system fields cannot be deleted.');
    }
    await this.standardTemplateRepository.remove(field);
  }

  private async validateStandardTemplateRules(
    payload: Partial<CreateEquipmentDto | UpdateEquipmentDto>,
    isUpdate = false,
    existingEquipment?: Equipment,
  ) {
    const templates = await this.standardTemplateRepository.find();
    
    for (const temp of templates) {
      const field = temp.fieldName as keyof (CreateEquipmentDto | UpdateEquipmentDto);
      
      let val: any;
      if (temp.isCustom) {
        if (payload.customFields !== undefined && payload.customFields[temp.fieldName] !== undefined) {
          val = payload.customFields[temp.fieldName];
        } else if (isUpdate && existingEquipment) {
          val = existingEquipment.customFields?.[temp.fieldName];
        }
      } else {
        val = payload[field];
        if (isUpdate && existingEquipment && payload[field] === undefined) {
          val = existingEquipment[temp.fieldName as keyof Equipment] as any;
        }
      }

      // If required, verify it is not null, undefined, or empty string
      if (temp.isRequired) {
        if (val === undefined || val === null || String(val).trim() === '') {
          throw new BadRequestException(`Field "${temp.displayName || temp.fieldName}" is required by the standard template configuration.`);
        }
      }
    }
  }

  async getRequiredDocuments(categoryId?: string): Promise<EquipmentRequiredDocument[]> {
    const query = this.requiredDocumentRepository.createQueryBuilder('req')
      .where('req.category_id IS NULL');
      
    if (categoryId) {
      query.orWhere('req.category_id = :categoryId', { categoryId });
    }
    
    return query.orderBy('req.document_type', 'ASC').getMany();
  }

  async addRequiredDocument(dto: { documentType: string; categoryId: string | null }): Promise<EquipmentRequiredDocument> {
    if (!dto.documentType || dto.documentType.trim() === '') {
      throw new BadRequestException('Document Type is required.');
    }
    
    const existing = await this.requiredDocumentRepository.findOne({
      where: {
        documentType: dto.documentType.trim(),
        categoryId: dto.categoryId ? dto.categoryId : IsNull()
      }
    });
    
    if (existing) {
      throw new BadRequestException(`Required document type "${dto.documentType}" already exists for this scope.`);
    }

    const reqDoc = this.requiredDocumentRepository.create({
      documentType: dto.documentType.trim(),
      categoryId: dto.categoryId || null
    });
    
    return this.requiredDocumentRepository.save(reqDoc);
  }

  async deleteRequiredDocument(id: string): Promise<void> {
    const reqDoc = await this.requiredDocumentRepository.findOneBy({ id });
    if (!reqDoc) {
      throw new NotFoundException(`Required document template with ID "${id}" not found.`);
    }
    await this.requiredDocumentRepository.remove(reqDoc);
  }

  async getMissingRequiredDocuments(equipmentId: string): Promise<string[]> {
    const equipment = await this.equipmentRepository.findOne({
      where: { id: equipmentId }
    });
    if (!equipment) {
      throw new NotFoundException(`Equipment with ID ${equipmentId} not found`);
    }

    const required = await this.getRequiredDocuments(equipment.categoryId || undefined);
    const requiredTypes = required.map(r => r.documentType);

    if (requiredTypes.length === 0) {
      return [];
    }

    const docs = await this.documentRepository.find({
      where: { equipmentId }
    });
    const attachedTypes = new Set(docs.map(d => d.documentType));

    return requiredTypes.filter(type => !attachedTypes.has(type));
  }

  private async validateUploadedFile(file: { filename: string; originalname: string; size?: number }) {
    const settings = await this.getUploadSettings();
    const path = require('path');
    
    // Validate extension
    const ext = path.extname(file.originalname).substring(1).toLowerCase();
    const allowed = settings.allowedExtensions.split(',').map(e => e.trim().toLowerCase());
    if (settings.allowedExtensions && !allowed.includes(ext)) {
      // Delete file from disk
      const filePath = path.join('./uploads/documents', file.filename);
      if (fs.existsSync(filePath)) {
        try {
          fs.unlinkSync(filePath);
        } catch (e) {
          console.error(`Failed to delete invalid file ${filePath}:`, e);
        }
      }
      throw new BadRequestException(`File extension .${ext} is not allowed. Allowed types: ${settings.allowedExtensions}`);
    }

    // Validate size (if file.size is provided by Multer)
    if (file.size !== undefined) {
      const maxBytes = settings.maxFileSizeMb * 1024 * 1024;
      if (file.size > maxBytes) {
        // Delete file from disk
        const filePath = path.join('./uploads/documents', file.filename);
        if (fs.existsSync(filePath)) {
          try {
            fs.unlinkSync(filePath);
          } catch (e) {
            console.error(`Failed to delete invalid file ${filePath}:`, e);
          }
        }
        throw new BadRequestException(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the limit of ${settings.maxFileSizeMb} MB.`);
      }
    }
  }

  async getUploadSettings(): Promise<EquipmentUploadSetting> {
    let settings = await this.uploadSettingRepository.findOne({ where: {} });
    if (!settings) {
      settings = this.uploadSettingRepository.create({
        allowedExtensions: 'pdf,docx,xlsx,png,jpg,jpeg,zip,txt',
        maxFileSizeMb: 10,
      });
      await this.uploadSettingRepository.save(settings);
    }
    return settings;
  }

  async updateUploadSettings(dto: { allowedExtensions: string; maxFileSizeMb: number }): Promise<EquipmentUploadSetting> {
    const settings = await this.getUploadSettings();
    settings.allowedExtensions = dto.allowedExtensions.replace(/\s+/g, '').toLowerCase(); // remove spaces, lowercase
    settings.maxFileSizeMb = Number(dto.maxFileSizeMb) || 10;
    return this.uploadSettingRepository.save(settings);
  }
}
