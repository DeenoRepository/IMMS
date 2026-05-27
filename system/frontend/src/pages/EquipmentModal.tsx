import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button, Tabs, Card, Badge } from '@core/ui';
import { useAuthStore } from '../store/authStore';
import api from '../utils/api';
import { 
  Download, 
  Upload, 
  History, 
  Plus, 
  FileText, 
  Calendar,
  User as UserIcon,
  Trash2,
  Eye
} from 'lucide-react';

export interface EquipmentFormValues {
  name: string;
  type: string;
  location: string;
  status: 'online' | 'warning' | 'offline';
  commissioningDate?: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  manufactureYear?: string | number;
  inventoryNumber?: string;
  criticality?: 'low' | 'medium' | 'high' | 'critical';
  powerKw?: string | number;
  categoryId?: string;
  attributeValues?: Array<{ attributeId: string; value: string }>;
  customFields?: Record<string, any>;
}

interface EquipmentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: EquipmentFormValues) => void;
  initialValues?: any;
  title: string;
  isOnlyStatusAllowed?: boolean; // RBAC restriction for normal mechanic
}

// Passportization interfaces
interface DocumentVersion {
  id: string;
  versionNumber: number;
  fileName: string;
  fileUrl: string;
  uploadedBy: string;
  changeSummary: string;
  uploadedAt: string;
}

interface EquipmentDocument {
  id: string;
  title: string;
  description: string;
  documentType?: string;
  createdAt: string;
  versions: DocumentVersion[];
}

interface ChangeLog {
  id: string;
  equipmentId: string;
  action: string;
  changedBy: string;
  changeDetails: string;
  createdAt: string;
}

interface CategoryAttribute {
  id: string;
  name: string;
  type: string;
  isRequired: boolean;
}

interface EquipmentCategory {
  id: string;
  name: string;
  description?: string;
  attributes: CategoryAttribute[];
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title,
  isOnlyStatusAllowed = false,
}) => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState('specs');

  // Standard template states
  interface StandardTemplateItem {
    fieldName: string;
    displayName: string;
    type: string;
    isVisible: boolean;
    isRequired: boolean;
    isCustom: boolean;
  }
  const [standardTemplate, setStandardTemplate] = useState<StandardTemplateItem[]>([]);

  const fetchStandardTemplate = async () => {
    try {
      const response = await api.get<StandardTemplateItem[]>('/equipment/standard-template');
      setStandardTemplate(response.data);
    } catch (err) {
      console.error('Failed to load standard template in modal', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchStandardTemplate();
    }
  }, [isOpen]);

  const isFieldVisible = (fieldName: string) => {
    const field = standardTemplate.find(t => t.fieldName === fieldName);
    return field ? field.isVisible : true;
  };

  const isFieldRequired = (fieldName: string) => {
    const field = standardTemplate.find(t => t.fieldName === fieldName);
    return field ? field.isRequired : false;
  };

  // Specs form states
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'online' | 'warning' | 'offline'>('online');
  const [commissioningDate, setCommissioningDate] = useState('');
  const [serialNumber, setSerialNumber] = useState('');
  const [manufacturer, setManufacturer] = useState('');
  const [model, setModel] = useState('');
  const [manufactureYear, setManufactureYear] = useState('');
  const [inventoryNumber, setInventoryNumber] = useState('');
  const [criticality, setCriticality] = useState<'low' | 'medium' | 'high' | 'critical'>('medium');
  const [powerKw, setPowerKw] = useState('');

  // Passport / Documents states
  const [documents, setDocuments] = useState<EquipmentDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  
  // Change logs states
  const [changeLogs, setChangeLogs] = useState<ChangeLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(false);

  // Category states
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState('');
  const [dynamicValues, setDynamicValues] = useState<Record<string, string>>({});
  const [customFields, setCustomFields] = useState<Record<string, any>>({});

  // Document creation form states
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // New version form states
  const [uploadVersionDocId, setUploadVersionDocId] = useState<string | null>(null);
  const [newVersionSummary, setNewVersionSummary] = useState('');
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);

  // Required & Missing documents states
  const [requiredDocsList, setRequiredDocsList] = useState<Array<{ id: string; documentType: string; categoryId: string | null }>>([]);
  const [missingDocs, setMissingDocs] = useState<string[]>([]);
  const [newDocType, setNewDocType] = useState('Other');

  // Allowed upload settings states
  const [allowedExtsList, setAllowedExtsList] = useState<string[]>([]);
  const [maxUploadMb, setMaxUploadMb] = useState(10);

  // Document preview states
  const [previewDoc, setPreviewDoc] = useState<{ url: string; fileName: string; title: string } | null>(null);
  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewBlobUrl, setPreviewBlobUrl] = useState<string | null>(null);
  const [previewFileType, setPreviewFileType] = useState<'pdf' | 'image' | 'text' | 'unsupported' | null>(null);
  const [previewTextContent, setPreviewTextContent] = useState<string | null>(null);

  const isWriteAllowed = user?.role === 'chief_mechanic' || user?.role === 'admin';

  const fetchCategories = async () => {
    try {
      const response = await api.get<EquipmentCategory[]>('/equipment/categories/all');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to fetch categories', err);
    }
  };

  const fetchRequiredDocsAndMissing = async (catId?: string) => {
    try {
      const reqUrl = catId 
        ? `/equipment/required-documents?categoryId=${catId}` 
        : `/equipment/required-documents`;
      const reqRes = await api.get<Array<{ id: string; documentType: string; categoryId: string | null }>>(reqUrl);
      setRequiredDocsList(reqRes.data);

      if (initialValues?.id) {
        const missingRes = await api.get<string[]>(`/equipment/${initialValues.id}/missing-documents`);
        setMissingDocs(missingRes.data);
      } else {
        const requiredTypes = reqRes.data.map(r => r.documentType);
        setMissingDocs(requiredTypes);
      }

      // Fetch upload constraints
      const settingsRes = await api.get('/equipment/upload-settings');
      const exts = settingsRes.data.allowedExtensions.split(',').map((e: string) => e.trim().toLowerCase());
      setAllowedExtsList(exts);
      setMaxUploadMb(settingsRes.data.maxFileSizeMb);
    } catch (err) {
      console.error('Failed to load required or missing documents/settings', err);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
      const categoryId = initialValues ? (initialValues.categoryId || '') : '';
      fetchRequiredDocsAndMissing(categoryId);
    } else {
      setRequiredDocsList([]);
      setMissingDocs([]);
      setNewDocType('Other');
    }
  }, [isOpen, initialValues]);

  // Load specs
  useEffect(() => {
    if (initialValues) {
      setName(initialValues.name || '');
      setType(initialValues.type || '');
      setLocation(initialValues.location || '');
      setStatus(initialValues.status || 'online');
      setCommissioningDate(
        initialValues.commissioningDate
          ? new Date(initialValues.commissioningDate).toISOString().split('T')[0]
          : ''
      );
      setSerialNumber(initialValues.serialNumber || '');
      setManufacturer(initialValues.manufacturer || '');
      setModel(initialValues.model || '');
      setManufactureYear(initialValues.manufactureYear !== undefined && initialValues.manufactureYear !== null ? String(initialValues.manufactureYear) : '');
      setInventoryNumber(initialValues.inventoryNumber || '');
      setCriticality(initialValues.criticality || 'medium');
      setPowerKw(initialValues.powerKw !== undefined && initialValues.powerKw !== null ? String(initialValues.powerKw) : '');
      setSelectedCategoryId(initialValues.categoryId || '');
      
      const vals: Record<string, string> = {};
      if (initialValues.attributeValues) {
        for (const av of initialValues.attributeValues) {
          vals[av.attributeId] = av.value;
        }
      }
      setDynamicValues(vals);
      setCustomFields(initialValues.customFields || {});
      
      setActiveTab('specs'); // Reset to specs tab when opening modal
    } else {
      setName('');
      setType('');
      setLocation('');
      setStatus('online');
      setCommissioningDate(new Date().toISOString().split('T')[0]);
      setSerialNumber('');
      setManufacturer('');
      setModel('');
      setManufactureYear('');
      setInventoryNumber('');
      setCriticality('medium');
      setPowerKw('');
      setSelectedCategoryId('');
      setDynamicValues({});
      setCustomFields({});
    }
  }, [initialValues, isOpen]);

  // Load documents
  const fetchDocuments = async () => {
    if (!initialValues) return;
    setLoadingDocs(true);
    try {
      const response = await api.get<EquipmentDocument[]>(`/equipment/${initialValues.id}/documents`);
      setDocuments(response.data);
    } catch (err) {
      console.error('Failed to fetch documents', err);
    } finally {
      setLoadingDocs(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialValues && activeTab === 'docs') {
      fetchDocuments();
    }
  }, [isOpen, activeTab]);

  const fetchChangeLogs = async () => {
    if (!initialValues) return;
    setLoadingLogs(true);
    try {
      const response = await api.get<ChangeLog[]>(`/equipment/${initialValues.id}/change-log`);
      setChangeLogs(response.data);
    } catch (err) {
      console.error('Failed to fetch change logs', err);
    } finally {
      setLoadingLogs(false);
    }
  };

  useEffect(() => {
    if (isOpen && initialValues && activeTab === 'history') {
      fetchChangeLogs();
    }
  }, [isOpen, activeTab]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validate standard fields based on template
    for (const temp of standardTemplate) {
      if (temp.isRequired) {
        let val = '';
        if (temp.isCustom) {
          val = customFields[temp.fieldName] !== undefined ? String(customFields[temp.fieldName]) : '';
        } else {
          if (temp.fieldName === 'serialNumber') val = serialNumber;
          else if (temp.fieldName === 'manufacturer') val = manufacturer;
          else if (temp.fieldName === 'model') val = model;
          else if (temp.fieldName === 'manufactureYear') val = String(manufactureYear);
          else if (temp.fieldName === 'inventoryNumber') val = inventoryNumber;
          else if (temp.fieldName === 'powerKw') val = String(powerKw);
          else if (temp.fieldName === 'commissioningDate') val = commissioningDate;
          else if (temp.fieldName === 'criticality') val = criticality;
        }

        if (!val || val.trim() === '') {
          const readableName = temp.displayName || temp.fieldName;
          alert(`Field "${readableName}" is required!`);
          return;
        }
      }
    }

    // Validate mandatory attributes
    const activeCategory = categories.find(c => c.id === selectedCategoryId);
    if (activeCategory) {
      for (const attr of activeCategory.attributes) {
        if (attr.isRequired && (!dynamicValues[attr.id] || dynamicValues[attr.id].trim() === '')) {
          alert(`Parameter "${attr.name}" is mandatory for this category!`);
          return;
        }
      }
    }

    const attributeValuesArray = Object.entries(dynamicValues).map(([attrId, val]) => ({
      attributeId: attrId,
      value: val,
    }));

    // Filter out invisible custom fields and parse numeric values
    const filteredCustomFields: Record<string, any> = {};
    standardTemplate.forEach(t => {
      if (t.isCustom && t.isVisible) {
        const rawVal = customFields[t.fieldName];
        if (rawVal !== undefined && rawVal !== null && String(rawVal).trim() !== '') {
          if (t.type === 'number') {
            filteredCustomFields[t.fieldName] = parseFloat(rawVal);
          } else {
            filteredCustomFields[t.fieldName] = rawVal;
          }
        }
      }
    });

    onSubmit({
      name,
      type: selectedCategoryId ? (categories.find(c => c.id === selectedCategoryId)?.name || type) : type,
      location,
      status,
      commissioningDate: isFieldVisible('commissioningDate') ? commissioningDate : undefined,
      serialNumber: isFieldVisible('serialNumber') ? (serialNumber || undefined) : undefined,
      manufacturer: isFieldVisible('manufacturer') ? (manufacturer || undefined) : undefined,
      model: isFieldVisible('model') ? (model || undefined) : undefined,
      manufactureYear: isFieldVisible('manufactureYear') && manufactureYear ? parseInt(manufactureYear, 10) : undefined,
      inventoryNumber: isFieldVisible('inventoryNumber') ? (inventoryNumber || undefined) : undefined,
      criticality: isFieldVisible('criticality') ? criticality : undefined,
      powerKw: isFieldVisible('powerKw') && powerKw ? parseFloat(powerKw) : undefined,
      categoryId: selectedCategoryId || undefined,
      attributeValues: attributeValuesArray,
      customFields: filteredCustomFields,
    });
  };

  // Document attachments handlers
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewDocFile(e.target.files[0]);
    }
  };

  const handleVersionFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setNewVersionFile(e.target.files[0]);
    }
  };

  const validateFileConstraints = (file: File): boolean => {
    // 1. Validate Extension
    const ext = file.name.split('.').pop()?.toLowerCase() || '';
    if (allowedExtsList.length > 0 && !allowedExtsList.includes(ext)) {
      alert(`File format .${ext} is not allowed. Allowed formats: ${allowedExtsList.join(', ')}`);
      return false;
    }

    // 2. Validate Size
    const maxBytes = maxUploadMb * 1024 * 1024;
    if (file.size > maxBytes) {
      alert(`File size (${(file.size / (1024 * 1024)).toFixed(2)} MB) exceeds the limit of ${maxUploadMb} MB.`);
      return false;
    }

    return true;
  };

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile) {
      alert('Please select a passport document file to upload.');
      return;
    }
    if (!validateFileConstraints(newDocFile)) {
      return;
    }
    const formData = new FormData();
    formData.append('title', newDocTitle);
    formData.append('description', newDocDesc);
    formData.append('file', newDocFile);
    formData.append('documentType', newDocType);

    try {
      await api.post(`/equipment/${initialValues.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewDocTitle('');
      setNewDocDesc('');
      setNewDocFile(null);
      setNewDocType('Other');
      setIsAddingDoc(false);
      fetchDocuments();
      fetchChangeLogs();
      fetchRequiredDocsAndMissing(selectedCategoryId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload document.');
    }
  };

  const handleAddVersion = async (e: React.FormEvent, docId: string) => {
    e.preventDefault();
    if (!newVersionFile) {
      alert('Please select a file.');
      return;
    }
    if (!validateFileConstraints(newVersionFile)) {
      return;
    }
    const formData = new FormData();
    formData.append('changeSummary', newVersionSummary);
    formData.append('file', newVersionFile);

    try {
      await api.post(`/equipment/documents/${docId}/versions`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewVersionSummary('');
      setNewVersionFile(null);
      setUploadVersionDocId(null);
      fetchDocuments();
      fetchChangeLogs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to upload version.');
    }
  };

  const handleDeleteDocument = async (docId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this document and all its version history?')) return;
    try {
      await api.delete(`/equipment/documents/${docId}`);
      fetchDocuments();
      fetchChangeLogs();
      fetchRequiredDocsAndMissing(selectedCategoryId);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete document.');
    }
  };

  const handleDownload = async (fileUrl: string, originalFileName: string) => {
    try {
      const response = await api.get(`/equipment/documents/download/${fileUrl}`, {
        responseType: 'blob',
      });
      const blob = new Blob([response.data]);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', originalFileName);
      document.body.appendChild(link);
      link.click();
      link.parentNode?.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      alert('Failed to download document file. File might have been removed.');
    }
  };

  const handlePreview = async (fileUrl: string, originalFileName: string, title: string) => {
    setPreviewDoc({ url: fileUrl, fileName: originalFileName, title });
    setPreviewLoading(true);
    setPreviewFileType(null);
    setPreviewTextContent(null);
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }

    try {
      const ext = originalFileName.split('.').pop()?.toLowerCase() || '';
      const isPdf = ext === 'pdf';
      const isImage = ['png', 'jpg', 'jpeg', 'gif', 'svg', 'webp'].includes(ext);
      const isText = ['txt', 'log', 'json', 'xml', 'csv', 'yaml', 'yml'].includes(ext);

      if (isPdf) {
        setPreviewFileType('pdf');
      } else if (isImage) {
        setPreviewFileType('image');
      } else if (isText) {
        setPreviewFileType('text');
      } else {
        setPreviewFileType('unsupported');
      }

      // Fetch the file content
      const response = await api.get(`/equipment/documents/download/${fileUrl}`, {
        responseType: isText ? 'text' : 'blob',
      });

      if (isText) {
        setPreviewTextContent(response.data as string);
      } else {
        let mimeType = '';
        if (isPdf) mimeType = 'application/pdf';
        else if (ext === 'png') mimeType = 'image/png';
        else if (ext === 'gif') mimeType = 'image/gif';
        else if (ext === 'svg') mimeType = 'image/svg+xml';
        else mimeType = 'image/jpeg';

        const blob = new Blob([response.data], { type: mimeType });
        const objectUrl = window.URL.createObjectURL(blob);
        setPreviewBlobUrl(objectUrl);
      }
    } catch (err) {
      console.error('Failed to load document preview', err);
      alert('Failed to load document preview. The file might have been removed or is inaccessible.');
      setPreviewDoc(null);
    } finally {
      setPreviewLoading(false);
    }
  };

  const handleClosePreview = () => {
    setPreviewDoc(null);
    if (previewBlobUrl) {
      window.URL.revokeObjectURL(previewBlobUrl);
      setPreviewBlobUrl(null);
    }
    setPreviewFileType(null);
    setPreviewTextContent(null);
  };

  useEffect(() => {
    return () => {
      if (previewBlobUrl) {
        window.URL.revokeObjectURL(previewBlobUrl);
      }
    };
  }, [previewBlobUrl]);

  const toggleExpandDoc = (docId: string) => {
    setExpandedDocId(expandedDocId === docId ? null : docId);
  };

  const statusOptions = [
    { value: 'online', label: 'Online' },
    { value: 'warning', label: 'Warning' },
    { value: 'offline', label: 'Offline' },
  ];

  // TAB 1: General Specs Component
  const specsContent = (
    <form onSubmit={handleSubmit} style={{ marginTop: 'var(--space-md)' }}>
      {!isOnlyStatusAllowed ? (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--space-md)',
          marginBottom: 'var(--space-md)'
        }}>
          <div>
            <Input
              label="Equipment Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              placeholder="e.g. Lathe 1A"
            />
            <Select
              label="Equipment Category"
              options={[
                { value: '', label: 'Select Category (None)' },
                ...categories.map(c => ({ value: c.id, label: c.name }))
              ]}
              value={selectedCategoryId}
              onChange={(e) => {
                const newCatId = e.target.value;
                setSelectedCategoryId(newCatId);
                setDynamicValues({});
                fetchRequiredDocsAndMissing(newCatId);
              }}
            />
            {!selectedCategoryId && (
              <Input
                label="Type / Class"
                value={type}
                onChange={(e) => setType(e.target.value)}
                required
                placeholder="e.g. Lathe, Pump, Boiler"
              />
            )}
            <Input
              label="Location"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              placeholder="e.g. Main Hall, Workshop 2"
            />
            {isFieldVisible('commissioningDate') && (
              <Input
                label={`Commissioning Date${isFieldRequired('commissioningDate') ? ' *' : ''}`}
                type="date"
                value={commissioningDate}
                onChange={(e) => setCommissioningDate(e.target.value)}
                required={isFieldRequired('commissioningDate')}
              />
            )}
            {isFieldVisible('criticality') && (
              <Select
                label={`Criticality Level${isFieldRequired('criticality') ? ' *' : ''}`}
                options={[
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                value={criticality}
                onChange={(e) => setCriticality(e.target.value as any)}
                required={isFieldRequired('criticality')}
              />
            )}
          </div>
          <div>
            {isFieldVisible('manufacturer') && (
              <Input
                label={`Manufacturer${isFieldRequired('manufacturer') ? ' *' : ''}`}
                value={manufacturer}
                onChange={(e) => setManufacturer(e.target.value)}
                placeholder="e.g. AlphaMach Inc."
                required={isFieldRequired('manufacturer')}
              />
            )}
            {isFieldVisible('model') && (
              <Input
                label={`Model${isFieldRequired('model') ? ' *' : ''}`}
                value={model}
                onChange={(e) => setModel(e.target.value)}
                placeholder="e.g. X-2000"
                required={isFieldRequired('model')}
              />
            )}
            {isFieldVisible('serialNumber') && (
              <Input
                label={`Serial Number${isFieldRequired('serialNumber') ? ' *' : ''}`}
                value={serialNumber}
                onChange={(e) => setSerialNumber(e.target.value)}
                placeholder="e.g. SN-CNC-8821A"
                required={isFieldRequired('serialNumber')}
              />
            )}
            {isFieldVisible('inventoryNumber') && (
              <Input
                label={`Inventory Number${isFieldRequired('inventoryNumber') ? ' *' : ''}`}
                value={inventoryNumber}
                onChange={(e) => setInventoryNumber(e.target.value)}
                placeholder="e.g. INV-2020-0041"
                required={isFieldRequired('inventoryNumber')}
              />
            )}
            {(isFieldVisible('manufactureYear') || isFieldVisible('powerKw')) && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 'var(--space-sm)' }}>
                {isFieldVisible('manufactureYear') && (
                  <Input
                    label={`Manufacture Year${isFieldRequired('manufactureYear') ? ' *' : ''}`}
                    type="number"
                    value={manufactureYear}
                    onChange={(e) => setManufactureYear(e.target.value)}
                    placeholder="e.g. 2020"
                    required={isFieldRequired('manufactureYear')}
                  />
                )}
                {isFieldVisible('powerKw') && (
                  <Input
                    label={`Power (kW)${isFieldRequired('powerKw') ? ' *' : ''}`}
                    type="number"
                    step="0.1"
                    value={powerKw}
                    onChange={(e) => setPowerKw(e.target.value)}
                    placeholder="e.g. 15.5"
                    required={isFieldRequired('powerKw')}
                  />
                )}
              </div>
            )}
          </div>

          {/* Custom Standard Fields Inputs */}
          {standardTemplate.filter(t => t.isCustom && t.isVisible).length > 0 && (
            <div style={{ gridColumn: 'span 2', marginTop: 'var(--space-sm)' }}>
              <h4 style={{ 
                margin: '0 0 var(--space-xs) 0', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: 'var(--space-xxs)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-primary)'
              }}>
                Additional Asset Parameters
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                {standardTemplate.filter(t => t.isCustom && t.isVisible).map(temp => (
                  <Input
                    key={temp.fieldName}
                    label={`${temp.displayName || temp.fieldName}${temp.isRequired ? ' *' : ''}`}
                    type={temp.type === 'number' ? 'number' : temp.type === 'date' ? 'date' : 'text'}
                    value={customFields[temp.fieldName] !== undefined && customFields[temp.fieldName] !== null ? String(customFields[temp.fieldName]) : ''}
                    onChange={(e) => setCustomFields({ ...customFields, [temp.fieldName]: e.target.value })}
                    placeholder={temp.isRequired ? 'Required parameter' : 'Optional parameter'}
                    required={temp.isRequired}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Dynamic Attributes Inputs */}
          {selectedCategoryId && (
            <div style={{ gridColumn: 'span 2', marginTop: 'var(--space-sm)' }}>
              <h4 style={{ 
                margin: '0 0 var(--space-xs) 0', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: 'var(--space-xxs)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--color-primary)'
              }}>
                Category Technical Parameters ({categories.find(c => c.id === selectedCategoryId)?.name})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 'var(--space-md)' }}>
                {categories.find(c => c.id === selectedCategoryId)?.attributes.map(attr => (
                  <Input
                    key={attr.id}
                    label={`${attr.name}${attr.isRequired ? ' *' : ''}`}
                    type={attr.type === 'number' ? 'number' : 'text'}
                    value={dynamicValues[attr.id] || ''}
                    onChange={(e) => setDynamicValues({ ...dynamicValues, [attr.id]: e.target.value })}
                    placeholder={attr.isRequired ? 'Required parameter' : 'Optional parameter'}
                    required={attr.isRequired}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', 
          gap: 'var(--space-md)', 
          marginBottom: 'var(--space-md)' 
        }}>
          <div>
            <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Equipment:</strong> {name}</p>
            <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Type:</strong> {type}</p>
            <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Location:</strong> {location}</p>
            {isFieldVisible('commissioningDate') && (
              <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Commissioning Date:</strong> {commissioningDate}</p>
            )}
            {isFieldVisible('criticality') && (
              <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Criticality:</strong> <span style={{ textTransform: 'capitalize' }}>{criticality}</span></p>
            )}
          </div>
          <div>
            {isFieldVisible('manufacturer') && (
              <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Manufacturer:</strong> {manufacturer || 'N/A'}</p>
            )}
            {isFieldVisible('model') && (
              <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Model:</strong> {model || 'N/A'}</p>
            )}
            {isFieldVisible('serialNumber') && (
              <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Serial Number:</strong> {serialNumber || 'N/A'}</p>
            )}
            {isFieldVisible('inventoryNumber') && (
              <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Inventory Number:</strong> {inventoryNumber || 'N/A'}</p>
            )}
            {(isFieldVisible('manufactureYear') || isFieldVisible('powerKw')) && (
              <p style={{ margin: 'var(--space-xxs) 0' }}>
                <strong>Mfg Year / Power:</strong> {isFieldVisible('manufactureYear') ? (manufactureYear || 'N/A') : 'N/A'} / {isFieldVisible('powerKw') ? (powerKw ? `${powerKw} kW` : 'N/A') : 'N/A'}
              </p>
            )}
          </div>

          {/* Custom Standard Fields Read-Only Display */}
          {standardTemplate.filter(t => t.isCustom && t.isVisible).length > 0 && (
            <div style={{ gridColumn: 'span 2', marginTop: 'var(--space-sm)' }}>
              <h4 style={{ 
                margin: '0 0 var(--space-xs) 0', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: 'var(--space-xxs)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--text-secondary)'
              }}>
                Additional Asset Parameters
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {standardTemplate.filter(t => t.isCustom && t.isVisible).map(temp => {
                  const val = customFields[temp.fieldName];
                  let displayVal = 'N/A';
                  if (val !== undefined && val !== null && String(val).trim() !== '') {
                    displayVal = temp.type === 'date' ? new Date(val).toLocaleDateString() : String(val);
                  }
                  return (
                    <p key={temp.fieldName} style={{ margin: 'var(--space-xxs) 0' }}>
                      <strong>{temp.displayName || temp.fieldName}:</strong> {displayVal}
                    </p>
                  );
                })}
              </div>
            </div>
          )}

          {/* Dynamic Attributes Read-Only Display */}
          {selectedCategoryId && (
            <div style={{ gridColumn: 'span 2', marginTop: 'var(--space-sm)' }}>
              <h4 style={{ 
                margin: '0 0 var(--space-xs) 0', 
                borderBottom: '1px solid var(--border-color)', 
                paddingBottom: 'var(--space-xxs)',
                fontSize: 'var(--font-size-md)',
                color: 'var(--text-secondary)'
              }}>
                Category Technical Parameters ({categories.find(c => c.id === selectedCategoryId)?.name})
              </h4>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                {categories.find(c => c.id === selectedCategoryId)?.attributes.map(attr => (
                  <p key={attr.id} style={{ margin: 'var(--space-xxs) 0' }}>
                    <strong>{attr.name}:</strong> {dynamicValues[attr.id] || 'N/A'}
                  </p>
                ))}
              </div>
            </div>
          )}
          
          <div style={{ gridColumn: 'span 2', marginTop: 'var(--space-xs)' }}>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', margin: 0 }}>
              * Under your role (Mechanic), you are only authorized to change the operational status.
            </p>
          </div>
        </div>
      )}

      <Select
        label="Operational Status"
        options={statusOptions}
        value={status}
        onChange={(e) => setStatus(e.target.value as any)}
      />
    </form>
  );

  // TAB 2: Passports & Documents Component
  const docsContent = (
    <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {/* Required Documents Checklist */}
      {requiredDocsList.length > 0 && (
        <Card style={{ padding: 'var(--space-md)', backgroundColor: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h4 style={{ margin: '0 0 var(--space-xs) 0', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
            Mandatory Documents Checklist
          </h4>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-sm)' }}>
            {requiredDocsList.map((req) => {
              const isSatisfied = !missingDocs.includes(req.documentType);
              return (
                <div 
                  key={req.id} 
                  style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '6px', 
                    fontSize: 'var(--font-size-sm)',
                    padding: '4px 10px',
                    borderRadius: 'var(--radius-pill)',
                    backgroundColor: isSatisfied ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                    border: `1px solid ${isSatisfied ? 'var(--color-success)' : 'var(--color-danger)'}`,
                    color: isSatisfied ? 'var(--color-success)' : 'var(--color-danger)',
                  }}
                >
                  <span style={{ fontSize: '12px' }}>{isSatisfied ? '✓' : '✗'}</span>
                  <span style={{ fontWeight: 500 }}>{req.documentType}</span>
                </div>
              );
            })}
          </div>
        </Card>
      )}

      {/* Upload document trigger */}
      {isWriteAllowed && !isAddingDoc && (
        <Button variant="secondary" onClick={() => setIsAddingDoc(true)}>
          <Plus size={14} style={{ marginRight: '6px' }} />
          Add Passport / Technical Document
        </Button>
      )}

      {/* Add Document Form */}
      {isAddingDoc && (
        <Card style={{ padding: 'var(--space-md)', border: '1px solid var(--border-focus)' }}>
          <h4 style={{ margin: '0 0 var(--space-xs) 0' }}>Upload New Technical Document</h4>
          <form onSubmit={handleAddDocument} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
            <Input
              label="Document Title"
              value={newDocTitle}
              onChange={(e) => setNewDocTitle(e.target.value)}
              required
              placeholder="e.g. Machinery Certificate, Safety Manual"
            />
            <Select
              label="Document Classification / Type"
              options={[
                { value: 'Other', label: 'Other / Custom Document' },
                ...requiredDocsList.map(r => ({ value: r.documentType, label: r.documentType }))
              ]}
              value={newDocType}
              onChange={(e) => setNewDocType(e.target.value)}
            />
            <Input
              label="Description"
              value={newDocDesc}
              onChange={(e) => setNewDocDesc(e.target.value)}
              placeholder="Brief summary of document content"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Select File (PDF, DOCX, ZIP, etc.)</label>
              {allowedExtsList.length > 0 && (
                <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                  Allowed formats: {allowedExtsList.join(', ')} (Max size: {maxUploadMb}MB)
                </span>
              )}
              <input 
                type="file" 
                onChange={handleFileChange} 
                required 
                style={{ 
                  padding: 'var(--space-xs)', 
                  border: '1px dashed var(--border-color)', 
                  borderRadius: 'var(--radius-sm)',
                  backgroundColor: 'var(--bg-secondary)',
                  color: 'var(--text-primary)'
                }}
              />
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', marginTop: 'var(--space-xs)' }}>
              <Button variant="secondary" size="sm" type="button" onClick={() => setIsAddingDoc(false)}>
                Cancel
              </Button>
              <Button variant="primary" size="sm" type="submit" glow>
                Upload Document
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Document List */}
      {loadingDocs ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-md)' }}>
          Loading attachments registry...
        </div>
      ) : documents.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-lg)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          No documents attached to this machinery passport yet.
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
          {documents.map((doc) => {
            // Sort versions by versionNumber DESC
            const sortedVersions = [...doc.versions].sort((a, b) => b.versionNumber - a.versionNumber);
            const activeVersion = sortedVersions[0];
            const isExpanded = expandedDocId === doc.id;

            return (
              <Card key={doc.id} style={{ padding: 'var(--space-md)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', gap: '10px' }}>
                    <FileText size={28} style={{ color: 'var(--color-primary)', marginTop: '4px' }} />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                        <h4 style={{ margin: 0, fontWeight: 600 }}>{doc.title}</h4>
                        {doc.documentType && doc.documentType !== 'Other' && (
                          <Badge variant="success" style={{ fontSize: 'var(--font-size-xxs)', padding: '2px 6px' }}>
                            {doc.documentType}
                          </Badge>
                        )}
                      </div>
                      {doc.description && <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: '4px 0 0 0' }}>{doc.description}</p>}
                      <div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '8px', flexWrap: 'wrap' }}>
                        {activeVersion && (
                          <>
                            <Badge variant="primary">v{activeVersion.versionNumber}</Badge>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                              Active: {activeVersion.fileName}
                            </span>
                            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <UserIcon size={12} /> {activeVersion.uploadedBy}
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {activeVersion && (
                      <>
                        <Button variant="secondary" size="sm" onClick={() => handlePreview(activeVersion.fileUrl, activeVersion.fileName, doc.title)} title="Preview Latest Version">
                          <Eye size={14} />
                        </Button>
                        <Button variant="secondary" size="sm" onClick={() => handleDownload(activeVersion.fileUrl, activeVersion.fileName)} title="Download Latest Version">
                          <Download size={14} />
                        </Button>
                      </>
                    )}
                    {isWriteAllowed && (
                      <Button variant="secondary" size="sm" onClick={() => setUploadVersionDocId(uploadVersionDocId === doc.id ? null : doc.id)} title="Upload New Version">
                        <Upload size={14} />
                      </Button>
                    )}
                    <Button variant="secondary" size="sm" onClick={() => toggleExpandDoc(doc.id)} title="View Version History">
                      <History size={14} />
                    </Button>
                    {user?.role === 'admin' && (
                      <Button variant="danger" size="sm" onClick={(e) => handleDeleteDocument(doc.id, e)} title="Delete Document">
                        <Trash2 size={14} />
                      </Button>
                    )}
                  </div>
                </div>

                {/* Upload Version Sub-form */}
                {uploadVersionDocId === doc.id && (
                  <div style={{ marginTop: 'var(--space-md)', padding: 'var(--space-sm)', borderTop: '1px solid var(--border-color)' }}>
                    <h5 style={{ margin: '0 0 var(--space-xs) 0' }}>Publish Document Update</h5>
                    <form onSubmit={(e) => handleAddVersion(e, doc.id)} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
                      <Input
                        label="Version Change Summary"
                        value={newVersionSummary}
                        onChange={(e) => setNewVersionSummary(e.target.value)}
                        required
                        placeholder="e.g. Updated layout specs, corrected calibration constants"
                      />
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <label style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500 }}>Select New Version File</label>
                        {allowedExtsList.length > 0 && (
                          <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                            Allowed formats: {allowedExtsList.join(', ')} (Max size: {maxUploadMb}MB)
                          </span>
                        )}
                        <input 
                          type="file" 
                          onChange={handleVersionFileChange} 
                          required
                          style={{
                            padding: '6px',
                            border: '1px dashed var(--border-color)',
                            borderRadius: 'var(--radius-sm)',
                            backgroundColor: 'var(--bg-secondary)',
                            color: 'var(--text-primary)'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '6px' }}>
                        <Button variant="secondary" size="sm" type="button" onClick={() => setUploadVersionDocId(null)}>
                          Cancel
                        </Button>
                        <Button variant="primary" size="sm" type="submit" glow>
                          Publish Version v{(activeVersion?.versionNumber || 0) + 1}
                        </Button>
                      </div>
                    </form>
                  </div>
                )}

                {/* Expandable Version History Log */}
                {isExpanded && (
                  <div style={{ marginTop: 'var(--space-md)', borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-sm)' }}>
                    <h5 style={{ margin: '0 0 var(--space-xs) 0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <History size={14} /> Document Version Log History
                    </h5>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', paddingLeft: '8px' }}>
                      {sortedVersions.map((v) => (
                        <div key={v.id} style={{ 
                          display: 'flex', 
                          justifyContent: 'space-between', 
                          alignItems: 'center', 
                          padding: 'var(--space-xs) var(--space-sm)',
                          backgroundColor: 'var(--bg-secondary)',
                          border: '1px solid var(--border-color)',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: 'var(--font-size-sm)'
                        }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <Badge variant={v.versionNumber === activeVersion.versionNumber ? 'success' : 'secondary'}>
                                v{v.versionNumber}
                              </Badge>
                              <span style={{ fontWeight: 600 }}>{v.fileName}</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
                              &ldquo;{v.changeSummary || 'No summary provided'}&rdquo;
                            </div>
                            <div style={{ display: 'flex', gap: '12px', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <UserIcon size={10} /> {v.uploadedBy}
                              </span>
                              <span style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                                <Calendar size={10} /> {new Date(v.uploadedAt).toLocaleString()}
                              </span>
                            </div>
                          </div>
                          <div style={{ display: 'flex', gap: '6px' }}>
                            <Button variant="secondary" size="sm" onClick={() => handlePreview(v.fileUrl, v.fileName, `${doc.title} (v${v.versionNumber})`)} title="Preview version file">
                              <Eye size={12} />
                            </Button>
                            <Button variant="secondary" size="sm" onClick={() => handleDownload(v.fileUrl, v.fileName)} title="Download version file">
                              <Download size={12} />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );

  const getActionMeta = (action: string) => {
    switch (action) {
      case 'create':
        return { label: 'Created', variant: 'success' };
      case 'update_specs':
        return { label: 'Specs Update', variant: 'primary' };
      case 'update_status':
        return { label: 'Status Update', variant: 'warning' };
      case 'add_document':
        return { label: 'Doc Added', variant: 'success' };
      case 'add_version':
        return { label: 'Doc Version', variant: 'primary' };
      case 'delete_document':
        return { label: 'Doc Deleted', variant: 'danger' };
      default:
        return { label: action, variant: 'secondary' };
    }
  };

  // TAB 3: Change History Timeline Component
  const historyContent = (
    <div style={{ marginTop: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      {loadingLogs ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-md)' }}>
          Loading change history logs...
        </div>
      ) : changeLogs.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-lg)', border: '1px dashed var(--border-color)', borderRadius: 'var(--radius-md)' }}>
          No change logs available for this equipment.
        </div>
      ) : (
        <div style={{ 
          position: 'relative', 
          paddingLeft: '24px', 
          borderLeft: '2px solid var(--border-color)', 
          margin: 'var(--space-xs) 0 var(--space-md) var(--space-xs)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--space-md)'
        }}>
          {changeLogs.map((log) => {
            const { label, variant } = getActionMeta(log.action);
            return (
              <div key={log.id} style={{ position: 'relative' }}>
                {/* Timeline node dot */}
                <div style={{ 
                  position: 'absolute', 
                  left: '-31px', 
                  top: '6px', 
                  width: '12px', 
                  height: '12px', 
                  borderRadius: '50%', 
                  backgroundColor: `var(--color-${variant || 'primary'})`,
                  border: '2px solid var(--bg-primary)',
                  boxShadow: '0 0 0 2px var(--border-color)'
                }} />
                
                <Card style={{ padding: 'var(--space-md)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 'var(--space-xs)', marginBottom: '8px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-xs)' }}>
                      <Badge variant={variant as any}>{label}</Badge>
                      <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserIcon size={12} style={{ color: 'var(--text-muted)' }} /> {log.changedBy}
                      </span>
                    </div>
                    <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                      <Calendar size={12} style={{ color: 'var(--text-muted)' }} /> {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <div style={{ 
                    fontSize: 'var(--font-size-sm)', 
                    color: 'var(--text-primary)', 
                    whiteSpace: 'pre-wrap', 
                    lineHeight: '1.4'
                  }}>
                    {log.changeDetails}
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );

  // Tab definitions
  const tabsList = [
    { id: 'specs', label: 'Specifications', content: specsContent },
    { id: 'docs', label: 'Technical Passport / Docs', content: docsContent },
    { id: 'history', label: 'Change History', content: historyContent }
  ];

  // Render specifications form if we are in creation mode (no tabs needed yet)
  const isEditMode = !!initialValues;

  const modalFooter = !isEditMode || activeTab === 'specs' ? (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button variant="secondary" onClick={onClose}>
        Cancel
      </Button>
      <Button variant="primary" onClick={handleSubmit} glow>
        Save Changes
      </Button>
    </div>
  ) : (
    <div style={{ display: 'flex', gap: '10px' }}>
      <Button variant="secondary" onClick={onClose}>
        Close Passport
      </Button>
    </div>
  );

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={title}
        footer={modalFooter}
        size="lg"
      >
        {isEditMode && missingDocs.length > 0 && (
          <div style={{
            backgroundColor: 'hsla(35, 92%, 35%, 0.08)',
            border: '1px solid var(--color-warning)',
            borderRadius: 'var(--radius-md)',
            padding: 'var(--space-sm) var(--space-md)',
            marginBottom: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 600, color: 'var(--color-warning)' }}>
              <span>⚠️ Documentation Incomplete</span>
            </div>
            <span style={{ fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
              The following mandatory document types are missing from this technical passport:
              <strong style={{ marginLeft: '4px', color: 'var(--text-primary)' }}>
                {missingDocs.join(', ')}
              </strong>
            </span>
          </div>
        )}

        {isEditMode ? (
          <Tabs 
            tabs={tabsList} 
            activeTabId={activeTab} 
            onTabChange={setActiveTab} 
          />
        ) : (
          specsContent
        )}
      </Modal>

      {/* Nested Document Preview Modal */}
      <Modal
        isOpen={!!previewDoc}
        onClose={handleClosePreview}
        title={`Document Preview: ${previewDoc?.title || ''}`}
        size="lg"
        footer={
          <div style={{ display: 'flex', gap: '10px', width: '100%', justifyContent: 'space-between' }}>
            <span style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)', alignSelf: 'center' }}>
              File: {previewDoc?.fileName || ''}
            </span>
            <div style={{ display: 'flex', gap: '10px' }}>
              {previewDoc && (
                <Button 
                  variant="primary" 
                  onClick={() => handleDownload(previewDoc.url, previewDoc.fileName)}
                >
                  <Download size={14} style={{ marginRight: '6px' }} /> Download File
                </Button>
              )}
              <Button variant="secondary" onClick={handleClosePreview}>
                Close
              </Button>
            </div>
          </div>
        }
      >
        {previewLoading ? (
          <div style={{ padding: 'var(--space-xl)', textAlign: 'center', color: 'var(--text-secondary)' }}>
            Loading document preview...
          </div>
        ) : (
          <div style={{ minHeight: '300px', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
            {previewFileType === 'pdf' && previewBlobUrl && (
              <iframe 
                src={`${previewBlobUrl}#toolbar=0`} 
                title="PDF Preview"
                style={{ width: '100%', height: '600px', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)' }}
              />
            )}
            {previewFileType === 'image' && previewBlobUrl && (
              <div style={{ 
                padding: 'var(--space-md)', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center'
              }}>
                <img 
                  src={previewBlobUrl} 
                  alt={previewDoc?.fileName}
                  style={{ maxWidth: '100%', maxHeight: '550px', objectFit: 'contain', borderRadius: 'var(--radius-sm)' }}
                />
              </div>
            )}
            {previewFileType === 'text' && previewTextContent !== null && (
              <pre style={{ 
                margin: 0,
                padding: 'var(--space-md)', 
                backgroundColor: 'var(--bg-tertiary)', 
                borderRadius: 'var(--radius-md)', 
                border: '1px solid var(--border-color)',
                whiteSpace: 'pre-wrap', 
                maxHeight: '600px', 
                overflowY: 'auto',
                fontFamily: 'monospace',
                fontSize: 'var(--font-size-xs)',
                color: 'var(--text-primary)'
              }}>
                {previewTextContent}
              </pre>
            )}
            {previewFileType === 'unsupported' && (
              <div style={{ padding: 'var(--space-xl)', textAlign: 'center' }}>
                <FileText size={48} style={{ color: 'var(--text-muted)', marginBottom: 'var(--space-sm)' }} />
                <h4 style={{ margin: '0 0 var(--space-xs) 0' }}>Preview Not Available</h4>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', margin: 0 }}>
                  Technical document formats (like Word, Excel, CAD, or ZIP files) cannot be previewed directly in the web browser.
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', marginTop: '4px' }}>
                  Please download the file using the button below to view its contents.
                </p>
              </div>
            )}
          </div>
        )}
      </Modal>
    </>
  );
};
