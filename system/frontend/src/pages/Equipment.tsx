import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, Button, Input, Select, Table, EquipmentStatusIndicator, MaintenancePriorityTag, Modal, Tabs } from '@core/ui';
import api from '../utils/api';
import { EquipmentModal, type EquipmentFormValues } from './EquipmentModal';
import { Plus, Trash2, Edit, RefreshCw, Settings, Search, SlidersHorizontal, ChevronDown, ChevronUp, RotateCcw, X } from 'lucide-react';

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

interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'warning' | 'offline';
  commissioningDate: string;
  serialNumber?: string;
  manufacturer?: string;
  model?: string;
  manufactureYear?: number;
  inventoryNumber?: string;
  criticality?: 'low' | 'medium' | 'high' | 'critical';
  powerKw?: number;
  categoryId?: string;
  category?: {
    id: string;
    name: string;
    description?: string;
  };
  attributeValues?: Array<{
    id: string;
    attributeId: string;
    value: string;
    attribute?: {
      id: string;
      name: string;
      isRequired: boolean;
      type: string;
    };
  }>;
  customFields?: Record<string, any>;
}

export const Equipment: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<EquipmentItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Advanced Filters
  const [isFiltersExpanded, setIsFiltersExpanded] = useState(false);
  const [criticalityFilter, setCriticalityFilter] = useState('all');
  const [categoryIdFilter, setCategoryIdFilter] = useState('all');
  const [manufacturerFilter, setManufacturerFilter] = useState('');
  const [locationFilter, setLocationFilter] = useState('');


  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | undefined>(undefined);

  // Category states
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [categories, setCategories] = useState<EquipmentCategory[]>([]);
  const [selectedCatForEdit, setSelectedCatForEdit] = useState<EquipmentCategory | null>(null);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');
  const [catAttrs, setCatAttrs] = useState<Array<{ name: string; type: string; isRequired: boolean }>>([]);
  const [newAttrName, setNewAttrName] = useState('');
  const [newAttrType, setNewAttrType] = useState('string');
  const [newAttrRequired, setNewAttrRequired] = useState(false);

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
  const [templateConfigs, setTemplateConfigs] = useState<StandardTemplateItem[]>([]);
  const [managerTab, setManagerTab] = useState('categories');

  const [newFieldCode, setNewFieldCode] = useState('');
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [newFieldType, setNewFieldType] = useState('string');

  const [requiredDocs, setRequiredDocs] = useState<Array<{ id: string; documentType: string; categoryId: string | null }>>([]);
  const [newReqDocType, setNewReqDocType] = useState('');
  const [newReqDocCategoryId, setNewReqDocCategoryId] = useState('');

  const [allowedExtensions, setAllowedExtensions] = useState('');
  const [maxFileSizeMb, setMaxFileSizeMb] = useState(10);

  // Specifications Change Requests Workflow states
  const [pendingRequests, setPendingRequests] = useState<any[]>([]);
  const [loadingRequests, setLoadingRequests] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<any | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');

  const fieldLabelMap: Record<string, string> = {
    serialNumber: 'Serial Number',
    manufacturer: 'Manufacturer',
    model: 'Model',
    manufactureYear: 'Manufacture Year',
    inventoryNumber: 'Inventory Number',
    powerKw: 'Power Rating (kW)',
    commissioningDate: 'Commissioning Date',
    criticality: 'Criticality Level',
  };

  const fetchStandardTemplate = async () => {
    try {
      const response = await api.get<StandardTemplateItem[]>('/equipment/standard-template');
      setStandardTemplate(response.data);
      setTemplateConfigs(response.data);
    } catch (err) {
      console.error('Failed to load standard template', err);
    }
  };

  const fetchCategories = async () => {
    try {
      const response = await api.get<EquipmentCategory[]>('/equipment/categories/all');
      setCategories(response.data);
    } catch (err) {
      console.error('Failed to load categories', err);
    }
  };

  const fetchRequiredDocs = async () => {
    try {
      const response = await api.get('/equipment/required-documents');
      setRequiredDocs(response.data);
    } catch (err) {
      console.error('Failed to load required document templates', err);
    }
  };

  const handleAddRequiredDoc = async () => {
    if (!newReqDocType.trim()) {
      alert('Document Type is required!');
      return;
    }
    try {
      await api.post('/equipment/required-documents', {
        documentType: newReqDocType.trim(),
        categoryId: newReqDocCategoryId || null
      });
      setNewReqDocType('');
      setNewReqDocCategoryId('');
      fetchRequiredDocs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add mandatory document template.');
    }
  };

  const handleDeleteRequiredDoc = async (id: string, name: string) => {
    if (!window.confirm(`Are you sure you want to delete mandatory document rule for "${name}"?`)) return;
    try {
      await api.delete(`/equipment/required-documents/${id}`);
      fetchRequiredDocs();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete mandatory document template.');
    }
  };

  const fetchUploadSettings = async () => {
    try {
      const response = await api.get('/equipment/upload-settings');
      setAllowedExtensions(response.data.allowedExtensions);
      setMaxFileSizeMb(response.data.maxFileSizeMb);
    } catch (err) {
      console.error('Failed to fetch upload settings', err);
    }
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (statusFilter !== 'all') count++;
    if (typeFilter !== 'all') count++;
    if (categoryIdFilter !== 'all') count++;
    if (criticalityFilter !== 'all') count++;
    if (manufacturerFilter.trim() !== '') count++;
    if (locationFilter.trim() !== '') count++;
    return count;
  }, [statusFilter, typeFilter, categoryIdFilter, criticalityFilter, manufacturerFilter, locationFilter]);

  const handleResetFilters = () => {
    setSearch('');
    setStatusFilter('all');
    setTypeFilter('all');
    setCriticalityFilter('all');
    setCategoryIdFilter('all');
    setManufacturerFilter('');
    setLocationFilter('');
  };

  const handleSaveUploadSettings = async () => {
    if (!allowedExtensions.trim()) {
      alert('Allowed extensions cannot be empty!');
      return;
    }
    if (maxFileSizeMb <= 0) {
      alert('Max file size must be a positive number!');
      return;
    }

    try {
      await api.put('/equipment/upload-settings', {
        allowedExtensions: allowedExtensions.trim(),
        maxFileSizeMb: Number(maxFileSizeMb)
      });
      alert('Document upload settings saved successfully!');
      fetchUploadSettings();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save document upload settings.');
    }
  };

  const fetchPendingRequests = async () => {
    setLoadingRequests(true);
    try {
      const res = await api.get('/equipment/change-requests/pending');
      setPendingRequests(res.data);
    } catch (err) {
      console.error('Failed to load pending change requests', err);
    } finally {
      setLoadingRequests(false);
    }
  };

  const handleApproveRequest = async (requestId: string) => {
    if (!window.confirm('Are you sure you want to approve this specification change request? These parameters will be immediately applied to the machinery asset.')) return;
    try {
      await api.post(`/equipment/change-requests/${requestId}/approve`);
      alert('Specification change request approved and successfully applied.');
      setSelectedRequest(null);
      fetchPendingRequests();
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to approve request.');
    }
  };

  const handleRejectRequest = async (requestId: string) => {
    if (!rejectionReason.trim()) {
      alert('Please provide a rejection feedback reason for the mechanic.');
      return;
    }
    if (!window.confirm('Are you sure you want to reject this change proposal?')) return;
    try {
      await api.post(`/equipment/change-requests/${requestId}/reject`, {
        rejectionReason: rejectionReason.trim()
      });
      alert('Specification change request rejected.');
      setSelectedRequest(null);
      setRejectionReason('');
      fetchPendingRequests();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to reject request.');
    }
  };

  useEffect(() => {
    if (isCategoryModalOpen) {
      fetchPendingRequests();
    } else {
      setSelectedRequest(null);
      setRejectionReason('');
    }
  }, [isCategoryModalOpen]);

  const renderSpecsDiff = (req: any) => {
    const equipment = req.equipment || {};
    const proposed = req.proposedChanges || {};
    
    const standardFields = [
      { key: 'name', label: 'Equipment Name' },
      { key: 'type', label: 'Type / Class' },
      { key: 'location', label: 'Location' },
      { key: 'serialNumber', label: 'Serial Number' },
      { key: 'manufacturer', label: 'Manufacturer' },
      { key: 'model', label: 'Model' },
      { key: 'manufactureYear', label: 'Manufacture Year' },
      { key: 'inventoryNumber', label: 'Inventory Number' },
      { key: 'criticality', label: 'Criticality Level' },
      { key: 'powerKw', label: 'Power (kW)' },
    ];

    const diffs: Array<{ label: string; oldVal: string; newVal: string; isChanged: boolean }> = [];

    for (const f of standardFields) {
      const oldVal = String(equipment[f.key] !== undefined && equipment[f.key] !== null ? equipment[f.key] : '');
      const newVal = String(proposed[f.key] !== undefined && proposed[f.key] !== null ? proposed[f.key] : '');
      const isChanged = oldVal !== newVal;
      
      if (proposed[f.key] !== undefined) {
        diffs.push({
          label: f.label,
          oldVal: oldVal || 'N/A',
          newVal: newVal || 'N/A',
          isChanged
        });
      }
    }

    if (proposed.commissioningDate !== undefined) {
      const oldD = equipment.commissioningDate ? new Date(equipment.commissioningDate).toLocaleDateString() : '';
      const newD = proposed.commissioningDate ? new Date(proposed.commissioningDate).toLocaleDateString() : '';
      diffs.push({
        label: 'Commissioning Date',
        oldVal: oldD || 'N/A',
        newVal: newD || 'N/A',
        isChanged: oldD !== newD
      });
    }

    const oldCustom = equipment.customFields || {};
    const newCustom = proposed.customFields || {};
    const customKeys = Array.from(new Set([...Object.keys(oldCustom), ...Object.keys(newCustom)]));
    
    for (const key of customKeys) {
      const label = standardTemplate.find(t => t.fieldName === key)?.displayName || key;
      const oldVal = String(oldCustom[key] !== undefined && oldCustom[key] !== null ? oldCustom[key] : '');
      const newVal = String(newCustom[key] !== undefined && newCustom[key] !== null ? newCustom[key] : '');
      
      if (newCustom[key] !== undefined || oldCustom[key] !== undefined) {
        diffs.push({
          label: `Parameter: ${label}`,
          oldVal: oldVal || 'N/A',
          newVal: newVal || 'N/A',
          isChanged: oldVal !== newVal
        });
      }
    }

    const oldAttrs = equipment.attributeValues || [];
    const newAttrs = proposed.attributeValues || [];
    const allAttrIds = Array.from(new Set([...oldAttrs.map((o: any) => o.attributeId), ...newAttrs.map((n: any) => n.attributeId)]));
    const category = categories.find(c => c.id === (proposed.categoryId || equipment.categoryId));
    
    for (const attrId of allAttrIds) {
      const attrName = category?.attributes.find(a => a.id === attrId)?.name || attrId;
      const oldVal = oldAttrs.find((o: any) => o.attributeId === attrId)?.value || '';
      const newVal = newAttrs.find((n: any) => n.attributeId === attrId)?.value || '';
      
      if (newVal || oldVal) {
        diffs.push({
          label: `Category Parameter: ${attrName}`,
          oldVal: oldVal || 'N/A',
          newVal: newVal || 'N/A',
          isChanged: oldVal !== newVal
        });
      }
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 'var(--font-size-sm)' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid var(--border-color)', textAlign: 'left' }}>
              <th style={{ padding: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>Specification Parameter</th>
              <th style={{ padding: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>Current Value</th>
              <th style={{ padding: '8px', fontWeight: 600, color: 'var(--text-secondary)' }}>Proposed Value</th>
            </tr>
          </thead>
          <tbody>
            {diffs.map((d, i) => (
              <tr 
                key={i} 
                style={{ 
                  borderBottom: '1px solid var(--border-color)',
                  backgroundColor: d.isChanged ? 'rgba(59, 130, 246, 0.04)' : 'transparent',
                  fontWeight: d.isChanged ? 600 : 'normal'
                }}
              >
                <td style={{ padding: '8px', color: 'var(--text-primary)' }}>{d.label}</td>
                <td style={{ padding: '8px', color: d.isChanged ? 'var(--text-muted)' : 'var(--text-primary)', textDecoration: d.isChanged ? 'line-through' : 'none' }}>
                  {d.oldVal}
                </td>
                <td style={{ padding: '8px', color: d.isChanged ? 'var(--color-primary)' : 'var(--text-primary)' }}>
                  {d.isChanged ? `→ ${d.newVal}` : d.newVal}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  };

  const changeRequestsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
      {selectedRequest ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px' }}>
            <div>
              <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
                Review Change Request for &ldquo;{selectedRequest.equipment?.name}&rdquo;
              </h3>
              <p style={{ margin: '4px 0 0 0', fontSize: 'var(--font-size-xs)', color: 'var(--text-muted)' }}>
                Proposed by <strong>{selectedRequest.proposedBy}</strong> on {new Date(selectedRequest.createdAt).toLocaleString()}
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => { setSelectedRequest(null); setRejectionReason(''); }}>
              Back to List
            </Button>
          </div>

          {renderSpecsDiff(selectedRequest)}

          <div style={{ 
            marginTop: 'var(--space-md)', 
            borderTop: '1px solid var(--border-color)', 
            paddingTop: 'var(--space-md)',
            display: 'flex',
            flexDirection: 'column',
            gap: 'var(--space-sm)'
          }}>
            <Input
              label="Rejection Comments (required only for rejection)"
              placeholder="e.g. Please clarify calibrating coefficients or re-check the serial number."
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="danger" onClick={() => handleRejectRequest(selectedRequest.id)}>
                Reject Proposal
              </Button>
              <Button variant="primary" onClick={() => handleApproveRequest(selectedRequest.id)} glow>
                Approve & Apply
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
          <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
            Review pending specifications changes proposed by mechanics. Compare values and choose to approve or reject them.
          </p>

          {loadingRequests ? (
            <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-lg)' }}>
              Loading change requests...
            </div>
          ) : pendingRequests.length === 0 ? (
            <div style={{ 
              textAlign: 'center', 
              color: 'var(--text-muted)', 
              padding: 'var(--space-xl)', 
              border: '1px dashed var(--border-color)', 
              borderRadius: 'var(--radius-md)' 
            }}>
              No pending specifications change requests at the moment.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', maxHeight: '300px', overflowY: 'auto' }}>
              {pendingRequests.map(req => (
                <Card 
                  key={req.id} 
                  style={{ 
                    padding: 'var(--space-sm) var(--space-md)', 
                    cursor: 'pointer',
                    transition: 'border-color var(--transition-fast)',
                  }}
                  onClick={() => setSelectedRequest(req)}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <h4 style={{ margin: 0 }}>{req.equipment?.name}</h4>
                      <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', margin: '4px 0 0 0' }}>
                        Proposed by <strong>{req.proposedBy}</strong> &bull; {new Date(req.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                    <Button variant="secondary" size="sm">
                      Review Diff
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  useEffect(() => {
    fetchCategories();
    fetchStandardTemplate();
    fetchRequiredDocs();
    fetchUploadSettings();
  }, []);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('name');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isWriteAllowed = user?.role === 'chief_mechanic' || user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<EquipmentItem[]>('/equipment');
      setData(response.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch equipment list.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAddModal = () => {
    setSelectedItem(undefined);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (item: EquipmentItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this equipment?')) return;
    try {
      await api.delete(`/equipment/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete equipment.');
    }
  };

  const handleFormSubmit = async (values: EquipmentFormValues) => {
    try {
      if (selectedItem) {
        // Edit existing
        if (user?.role === 'mechanic') {
          const keys: Array<keyof EquipmentFormValues> = [
            'name', 'type', 'location', 'serialNumber', 'manufacturer', 'model', 
            'manufactureYear', 'inventoryNumber', 'criticality', 'powerKw', 'categoryId'
          ];
          
          let hasSpecsChanges = false;
          for (const key of keys) {
            const oldVal = (selectedItem as any)[key];
            const newVal = values[key];
            if ((newVal || '') !== (oldVal || '')) {
              hasSpecsChanges = true;
              break;
            }
          }

          const oldComm = selectedItem.commissioningDate ? new Date(selectedItem.commissioningDate).getTime() : 0;
          const newComm = values.commissioningDate ? new Date(values.commissioningDate).getTime() : 0;
          if (oldComm !== newComm) {
            hasSpecsChanges = true;
          }

          const oldCustom = selectedItem.customFields || {};
          const newCustom = values.customFields || {};
          const customKeys = Array.from(new Set([...Object.keys(oldCustom), ...Object.keys(newCustom)]));
          for (const key of customKeys) {
            if ((newCustom[key] || '') !== (oldCustom[key] || '')) {
              hasSpecsChanges = true;
              break;
            }
          }

          const oldAttrs = selectedItem.attributeValues || [];
          const newAttrs = values.attributeValues || [];
          if (oldAttrs.length !== newAttrs.length) {
            hasSpecsChanges = true;
          } else {
            for (const av of newAttrs) {
              const oldAv = oldAttrs.find(o => o.attributeId === av.attributeId);
              if (!oldAv || oldAv.value !== av.value) {
                hasSpecsChanges = true;
                break;
              }
            }
          }

          // Direct immediate status update if changed
          if (values.status !== selectedItem.status) {
            await api.put(`/equipment/${selectedItem.id}`, { status: values.status });
          }

          // Propose change request if specs changed
          if (hasSpecsChanges) {
            await api.post(`/equipment/${selectedItem.id}/change-requests`, {
              proposedChanges: values
            });
            alert('Machinery specifications modification request submitted for approval.');
          } else if (values.status !== selectedItem.status) {
            alert('Asset status updated successfully.');
          }
        } else {
          await api.put(`/equipment/${selectedItem.id}`, values);
        }
      } else {
        // Create new
        await api.post('/equipment', values);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  // Sort callback
  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  // Get unique list of types for filtering
  const uniqueTypes = useMemo(() => {
    const types = data.map((item) => item.type);
    return ['all', ...Array.from(new Set(types))];
  }, [data]);

  // Compute counters
  const counters = useMemo(() => {
    const total = data.length;
    const online = data.filter((i) => i.status === 'online').length;
    const warning = data.filter((i) => i.status === 'warning').length;
    const offline = data.filter((i) => i.status === 'offline').length;
    return { total, online, warning, offline };
  }, [data]);

  const handleEditCategory = (cat: EquipmentCategory) => {
    setSelectedCatForEdit(cat);
    setCatName(cat.name);
    setCatDesc(cat.description || '');
    setCatAttrs(cat.attributes.map(a => ({ name: a.name, type: a.type, isRequired: a.isRequired })));
  };

  const handleAddNewCategoryClick = () => {
    setSelectedCatForEdit({ id: '', name: '', description: '', attributes: [] });
    setCatName('');
    setCatDesc('');
    setCatAttrs([]);
  };

  const handleAddAttribute = () => {
    if (!newAttrName.trim()) return;
    setCatAttrs([...catAttrs, { name: newAttrName, type: newAttrType, isRequired: newAttrRequired }]);
    setNewAttrName('');
    setNewAttrType('string');
    setNewAttrRequired(false);
  };

  const handleRemoveAttribute = (idx: number) => {
    setCatAttrs(catAttrs.filter((_, i) => i !== idx));
  };

  const handleSaveCategory = async () => {
    if (!catName.trim()) {
      alert('Category Name is required');
      return;
    }
    const payload = {
      name: catName,
      description: catDesc || undefined,
      attributes: catAttrs,
    };

    try {
      if (selectedCatForEdit && selectedCatForEdit.id) {
        await api.put(`/equipment/categories/${selectedCatForEdit.id}`, payload);
      } else {
        await api.post('/equipment/categories', payload);
      }
      fetchCategories();
      setSelectedCatForEdit(null);
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save category');
    }
  };

  const handleDeleteCategory = async (catId: string) => {
    if (!window.confirm('Are you sure you want to delete this category? All attributes will be deleted, and equipment assigned to it will be set to no category.')) return;
    try {
      await api.delete(`/equipment/categories/${catId}`);
      fetchCategories();
      fetchData(); // Reload main equipment list
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete category');
    }
  };

  const handleTemplateCheckboxChange = (fieldName: string, prop: 'isVisible' | 'isRequired', checked: boolean) => {
    setTemplateConfigs((prev) =>
      prev.map((item) => {
        if (item.fieldName === fieldName) {
          const updated = { ...item, [prop]: checked };
          if (prop === 'isVisible' && !checked) {
            updated.isRequired = false;
          }
          return updated;
        }
        return item;
      })
    );
  };

  const handleSaveTemplates = async () => {
    try {
      const response = await api.put<StandardTemplateItem[]>('/equipment/standard-template', templateConfigs);
      setStandardTemplate(response.data);
      setTemplateConfigs(response.data);
      alert('Standard field template configuration saved successfully!');
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to save template configuration.');
    }
  };

  const handleAddCustomField = async () => {
    if (!newFieldCode.trim() || !newFieldLabel.trim()) {
      alert('Field Code and Display Name are required!');
      return;
    }
    if (!/^[a-zA-Z][a-zA-Z0-9_]*$/.test(newFieldCode)) {
      alert('Field Code must start with a letter and contain only alphanumeric characters or underscores.');
      return;
    }

    try {
      await api.post('/equipment/standard-template', {
        fieldName: newFieldCode,
        displayName: newFieldLabel,
        type: newFieldType,
        isVisible: true,
        isRequired: false,
      });
      setNewFieldCode('');
      setNewFieldLabel('');
      setNewFieldType('string');
      fetchStandardTemplate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to add custom field.');
    }
  };

  const handleDeleteCustomField = async (fieldName: string) => {
    if (!window.confirm(`Are you sure you want to delete standard field "${fieldName}"?`)) return;
    try {
      await api.delete(`/equipment/standard-template/${fieldName}`);
      fetchStandardTemplate();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete custom field.');
    }
  };

  const templatesContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
        Configure standard fields visibility and mandatory status across the equipment registry. System-critical fields (Name, Type, Location) are permanently visible and required.
      </p>

      {isWriteAllowed && (
        <Card style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', marginBottom: 'var(--space-xs)' }}>
          <h5 style={{ margin: '0 0 var(--space-xs) 0', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Create New Standard Field</h5>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1, minWidth: '120px' }}>
              <Input
                label="Field Code (e.g. weight)"
                value={newFieldCode}
                onChange={(e) => setNewFieldCode(e.target.value)}
                placeholder="weight"
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ flex: 1.5, minWidth: '150px' }}>
              <Input
                label="Display Label"
                value={newFieldLabel}
                onChange={(e) => setNewFieldLabel(e.target.value)}
                placeholder="Weight (kg)"
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ flex: 1, minWidth: '100px' }}>
              <Select
                label="Data Type"
                options={[
                  { value: 'string', label: 'Text/String' },
                  { value: 'number', label: 'Numeric/Number' },
                  { value: 'date', label: 'Date' },
                ]}
                value={newFieldType}
                onChange={(e) => setNewFieldType(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
            <Button variant="primary" onClick={handleAddCustomField} size="sm" style={{ height: '36px' }}>
              Add Field
            </Button>
          </div>
        </Card>
      )}
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-xs)',
        maxHeight: '350px',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--space-sm)'
      }}>
        {templateConfigs.map((config) => (
          <div key={config.fieldName} style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: 'var(--space-xs) var(--space-sm)',
            backgroundColor: 'var(--bg-primary)',
            borderRadius: 'var(--radius-sm)',
            border: '1px solid var(--border-color)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                {config.displayName || fieldLabelMap[config.fieldName] || config.fieldName}
              </div>
              {config.isCustom && (
                <span style={{ 
                  fontSize: 'var(--font-size-xxs)', 
                  backgroundColor: 'var(--border-color)', 
                  padding: '2px 6px', 
                  borderRadius: '10px',
                  color: 'var(--text-secondary)'
                }}>
                  Custom ({config.type})
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: '20px', alignItems: 'center' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--font-size-xs)', cursor: 'pointer', margin: 0 }}>
                <input
                  type="checkbox"
                  checked={config.isVisible}
                  onChange={(e) => handleTemplateCheckboxChange(config.fieldName, 'isVisible', e.target.checked)}
                />
                Visible
              </label>
              <label style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '6px', 
                fontSize: 'var(--font-size-xs)', 
                cursor: 'pointer',
                opacity: config.isVisible ? 1 : 0.5,
                margin: 0
              }}>
                <input
                  type="checkbox"
                  checked={config.isRequired}
                  disabled={!config.isVisible}
                  onChange={(e) => handleTemplateCheckboxChange(config.fieldName, 'isRequired', e.target.checked)}
                />
                Required
              </label>
              {config.isCustom && (
                <Button 
                  variant="danger" 
                  size="sm" 
                  onClick={() => handleDeleteCustomField(config.fieldName)}
                  style={{ padding: '2px 8px', minHeight: 'auto', height: '24px' }}
                >
                  Delete
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
      
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xs)' }}>
        <Button variant="primary" onClick={handleSaveTemplates} glow>
          Save Template Config
        </Button>
      </div>
    </div>
  );

  const mandatoryDocsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
        Configure mandatory document attachments (e.g. User Manual) that must be uploaded for equipment passports. Default templates apply globally; category-specific templates apply only to assets of that category.
      </p>

      {isWriteAllowed && (
        <Card style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)', marginBottom: 'var(--space-xs)' }}>
          <h5 style={{ margin: '0 0 var(--space-xs) 0', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Create New Document Rule</h5>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div style={{ flex: 1.5, minWidth: '150px' }}>
              <Input
                label="Required Document Type (e.g. Safety Certificate)"
                value={newReqDocType}
                onChange={(e) => setNewReqDocType(e.target.value)}
                placeholder="User Manual"
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
            <div style={{ flex: 1.2, minWidth: '120px' }}>
              <Select
                label="Category Scope"
                options={[
                  { value: '', label: 'Apply to All (Global)' },
                  ...categories.map(c => ({ value: c.id, label: c.name }))
                ]}
                value={newReqDocCategoryId}
                onChange={(e) => setNewReqDocCategoryId(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
            <Button variant="primary" onClick={handleAddRequiredDoc} size="sm" style={{ height: '36px' }}>
              Add Rule
            </Button>
          </div>
        </Card>
      )}

      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        gap: 'var(--space-xs)',
        maxHeight: '300px',
        overflowY: 'auto',
        border: '1px solid var(--border-color)',
        borderRadius: 'var(--radius-md)',
        backgroundColor: 'var(--bg-secondary)',
        padding: 'var(--space-sm)'
      }}>
        {requiredDocs.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontStyle: 'italic', margin: 'var(--space-md) 0' }}>
            No mandatory document requirements defined.
          </p>
        ) : (
          requiredDocs.map((rule) => {
            const catName = rule.categoryId ? categories.find(c => c.id === rule.categoryId)?.name || 'Unknown Category' : 'Global (All)';
            return (
              <div key={rule.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: 'var(--space-xs) var(--space-sm)',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: 'var(--radius-sm)',
                border: '1px solid var(--border-color)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{ fontWeight: 600, fontSize: 'var(--font-size-sm)' }}>
                    {rule.documentType}
                  </div>
                  <span style={{ 
                    fontSize: 'var(--font-size-xxs)', 
                    backgroundColor: 'var(--border-color)', 
                    padding: '2px 6px', 
                    borderRadius: '10px',
                    color: 'var(--text-secondary)'
                  }}>
                    Scope: {catName}
                  </span>
                </div>
                {isWriteAllowed && (
                  <Button 
                    variant="danger" 
                    size="sm" 
                    onClick={() => handleDeleteRequiredDoc(rule.id, rule.documentType)}
                    style={{ padding: '2px 8px', minHeight: 'auto', height: '24px' }}
                  >
                    Delete
                  </Button>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );

  const uploadSettingsContent = (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
        Configure constraints for technical document passport uploads. These rules are enforced both client-side and server-side to maintain server security and disk space limits.
      </p>

      <Card style={{ padding: 'var(--space-md)', display: 'flex', flexDirection: 'column', gap: 'var(--space-sm)' }}>
        <Input
          label="Allowed File Extensions (comma-separated, e.g. pdf, docx, png)"
          value={allowedExtensions}
          onChange={(e) => setAllowedExtensions(e.target.value)}
          placeholder="pdf, docx, xlsx, png, jpg, jpeg, zip, txt"
        />

        <Input
          label="Maximum File Size Limit (MB)"
          type="number"
          min="1"
          value={String(maxFileSizeMb)}
          onChange={(e) => setMaxFileSizeMb(Number(e.target.value))}
          placeholder="10"
        />

        {isWriteAllowed && (
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--space-xs)' }}>
            <Button variant="primary" onClick={handleSaveUploadSettings} glow>
              Save Upload Settings
            </Button>
          </div>
        )}
      </Card>
    </div>
  );

  // Filter and sort data
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.location.toLowerCase().includes(search.toLowerCase()) ||
          item.type.toLowerCase().includes(search.toLowerCase()) ||
          (item.category && item.category.name.toLowerCase().includes(search.toLowerCase())) ||
          (item.serialNumber && item.serialNumber.toLowerCase().includes(search.toLowerCase())) ||
          (item.inventoryNumber && item.inventoryNumber.toLowerCase().includes(search.toLowerCase())) ||
          (item.manufacturer && item.manufacturer.toLowerCase().includes(search.toLowerCase())) ||
          (item.model && item.model.toLowerCase().includes(search.toLowerCase()));
          
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        
        // Advanced dynamic checks
        const matchesCategory = categoryIdFilter === 'all' || item.categoryId === categoryIdFilter;
        const matchesCriticality = criticalityFilter === 'all' || item.criticality === criticalityFilter;
        const matchesManufacturer = !manufacturerFilter.trim() || 
          (item.manufacturer && item.manufacturer.toLowerCase().includes(manufacturerFilter.toLowerCase().trim()));
        const matchesLocation = !locationFilter.trim() || 
          item.location.toLowerCase().includes(locationFilter.toLowerCase().trim());
          
        return matchesSearch && matchesStatus && matchesType && matchesCategory && matchesCriticality && matchesManufacturer && matchesLocation;
      })
      .sort((a, b) => {
        const fieldA = (a as any)[sortBy] || '';
        const fieldB = (b as any)[sortBy] || '';
        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, search, statusFilter, typeFilter, categoryIdFilter, criticalityFilter, manufacturerFilter, locationFilter, sortBy, sortDirection]);


  // Table columns definition
  const columns = useMemo(() => {
    const isCriticalityVisible = standardTemplate.find(t => t.fieldName === 'criticality')?.isVisible !== false;
    const isCommissioningDateVisible = standardTemplate.find(t => t.fieldName === 'commissioningDate')?.isVisible !== false;

    const cols = [
      {
        key: 'status',
        header: 'Status',
        sortable: true,
        render: (row: EquipmentItem) => <EquipmentStatusIndicator status={row.status} />,
      },
      { key: 'name', header: 'Name', sortable: true },
      { 
        key: 'type', 
        header: 'Type / Class', 
        sortable: true,
        render: (row: EquipmentItem) => row.category?.name || row.type
      },
      { key: 'location', header: 'Location', sortable: true },
    ];

    if (isCriticalityVisible) {
      cols.push({
        key: 'criticality',
        header: 'Criticality',
        sortable: true,
        render: (row: EquipmentItem) => (
          <MaintenancePriorityTag priority={row.criticality || 'medium'} />
        ),
      } as any);
    }

    if (isCommissioningDateVisible) {
      cols.push({
        key: 'commissioningDate',
        header: 'Commissioned On',
        sortable: true,
        render: (row: EquipmentItem) => row.commissioningDate ? new Date(row.commissioningDate).toLocaleDateString() : 'N/A',
      } as any);
    }

    // Add custom standard fields that are visible
    standardTemplate.forEach((temp) => {
      if (temp.isCustom && temp.isVisible) {
        cols.push({
          key: temp.fieldName,
          header: temp.displayName || temp.fieldName,
          sortable: true,
          render: (row: EquipmentItem) => {
            const val = row.customFields?.[temp.fieldName];
            if (val === undefined || val === null) return 'N/A';
            if (temp.type === 'date') return new Date(val).toLocaleDateString();
            return String(val);
          }
        } as any);
      }
    });

    cols.push({
      key: 'actions',
      header: 'Actions',
      render: (row: EquipmentItem) => (
        <div style={{ display: 'flex', gap: '8px' }} onClick={(e) => e.stopPropagation()}>
          <Button variant="secondary" size="sm" onClick={() => handleOpenEditModal(row)} title="Edit">
            <Edit size={14} />
          </Button>
          {isWriteAllowed && (
            <Button variant="danger" size="sm" onClick={(e) => handleDelete(row.id, e)} title="Delete">
              <Trash2 size={14} />
            </Button>
          )}
        </div>
      ),
    } as any);

    return cols;
  }, [standardTemplate, isWriteAllowed]);

  return (
    <div className="equipment-view" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Equipment Registry</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 'var(--space-xxs) 0 0 0' }}>
            Monitor and manage company technical assets and machinery
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={fetchData} title="Reload list">
            <RefreshCw size={16} />
          </Button>
          {isWriteAllowed && (
            <>
              <Button variant="secondary" onClick={() => {
                setTemplateConfigs([...standardTemplate]);
                setManagerTab('categories');
                setIsCategoryModalOpen(true);
              }}>
                <Settings size={16} style={{ marginRight: '6px' }} />
                Categories, Templates & Workflows
              </Button>
              <Button variant="primary" onClick={handleOpenAddModal} glow>
                <Plus size={16} style={{ marginRight: '6px' }} />
                Add Equipment
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Metrics Header Grid */}
      <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Total Assets</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700 }}>{counters.total}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>Online</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700, color: 'var(--color-success)' }}>{counters.online}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-sm)' }}>Warning</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700, color: 'var(--color-warning)' }}>{counters.warning}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--color-danger)', fontSize: 'var(--font-size-sm)' }}>Offline</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700, color: 'var(--color-danger)' }}>{counters.offline}</div>
        </Card>
      </div>

      {/* Filter Options */}
      <Card style={{ padding: 'var(--space-md)' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', gap: '12px', alignItems: 'center', width: '100%', flexWrap: 'wrap' }}>
            <div style={{ flex: 2, minWidth: '240px', position: 'relative', display: 'flex', alignItems: 'center' }}>
              <Search size={18} style={{ position: 'absolute', left: '12px', color: 'var(--text-muted)', zIndex: 1 }} />
              <Input
                placeholder="Search by name, type, location, manufacturer, model, S/N..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                wrapperStyle={{ marginBottom: 0, width: '100%' }}
                style={{ paddingLeft: '38px', paddingRight: search ? '36px' : '12px' }}
              />
              {search && (
                <button 
                  onClick={() => setSearch('')}
                  style={{
                    position: 'absolute',
                    right: '12px',
                    background: 'transparent',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    padding: 0,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    outline: 'none',
                    zIndex: 1
                  }}
                  title="Clear search"
                >
                  <X size={16} />
                </button>
              )}
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <Select
                options={[
                  { value: 'all', label: 'All Statuses' },
                  { value: 'online', label: 'Online' },
                  { value: 'warning', label: 'Warning' },
                  { value: 'offline', label: 'Offline' },
                ]}
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>

            <div style={{ flex: 1, minWidth: '150px' }}>
              <Select
                options={uniqueTypes.map((type) => ({
                  value: type,
                  label: type === 'all' ? 'All Types / Classes' : type,
                }))}
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>

            <Button 
              variant="secondary"
              onClick={() => setIsFiltersExpanded(!isFiltersExpanded)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                height: '42px',
                borderColor: isFiltersExpanded ? 'var(--color-primary)' : 'var(--border-color)',
                backgroundColor: isFiltersExpanded ? 'var(--bg-tertiary)' : 'transparent',
                color: isFiltersExpanded ? 'var(--color-primary)' : 'var(--text-primary)'
              }}
            >
              <SlidersHorizontal size={15} />
              <span>Advanced Filters</span>
              {activeFiltersCount > 0 && (
                <span style={{
                  backgroundColor: 'var(--color-primary)',
                  color: 'white',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  padding: '2px 6px',
                  borderRadius: '10px',
                  marginLeft: '4px',
                  lineHeight: 1
                }}>
                  {activeFiltersCount}
                </span>
              )}
              {isFiltersExpanded ? <ChevronUp size={14} style={{ marginLeft: '4px' }} /> : <ChevronDown size={14} style={{ marginLeft: '4px' }} />}
            </Button>
          </div>

          {/* Expanded Drawer Panel */}
          {isFiltersExpanded && (
            <div style={{
              borderTop: '1px solid var(--border-color)',
              paddingTop: '16px',
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '16px'
            }}>
              <Select
                label="Asset Category"
                options={[
                  { value: 'all', label: 'All Categories' },
                  ...categories.map((c) => ({ value: c.id, label: c.name }))
                ]}
                value={categoryIdFilter}
                onChange={(e) => setCategoryIdFilter(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />

              <Select
                label="Asset Criticality"
                options={[
                  { value: 'all', label: 'All Criticalities' },
                  { value: 'low', label: 'Low' },
                  { value: 'medium', label: 'Medium' },
                  { value: 'high', label: 'High' },
                  { value: 'critical', label: 'Critical' },
                ]}
                value={criticalityFilter}
                onChange={(e) => setCriticalityFilter(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />

              <Input
                label="Manufacturer"
                placeholder="Filter by manufacturer..."
                value={manufacturerFilter}
                onChange={(e) => setManufacturerFilter(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />

              <Input
                label="Location"
                placeholder="Filter by location..."
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                wrapperStyle={{ marginBottom: 0 }}
              />
            </div>
          )}

          {/* Filter Metadata Stats & Quick Reset Row */}
          {activeFiltersCount > 0 && (
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderTop: '1px solid var(--border-color)',
              paddingTop: '12px',
              marginTop: '4px'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: 'var(--font-size-sm)', color: 'var(--text-secondary)' }}>
                <span>Active Filters:</span>
                <span style={{
                  backgroundColor: 'var(--badge-primary-bg)',
                  color: 'var(--badge-primary-text)',
                  border: '1px solid var(--badge-primary-border)',
                  fontSize: 'var(--font-size-xs)',
                  fontWeight: 600,
                  padding: '2px 8px',
                  borderRadius: 'var(--radius-pill)'
                }}>
                  {activeFiltersCount} applied
                </span>
                <span>&bull;</span>
                <span>Matched: <strong>{filteredData.length}</strong> / {data.length} assets</span>
              </div>
              <Button 
                variant="secondary" 
                size="sm"
                onClick={handleResetFilters}
                style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', padding: '6px 12px' }}
              >
                <RotateCcw size={13} />
                <span>Reset Filters</span>
              </Button>
            </div>
          )}
        </div>
      </Card>

      {/* Main Table view */}
      {error ? (
        <div style={{ color: 'var(--color-danger)', padding: 'var(--space-md)', textAlign: 'center' }}>
          {error}
        </div>
      ) : loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: 'var(--space-xl)', textAlign: 'center' }}>
          Loading asset records...
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredData}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(row) => handleOpenEditModal(row)}
          emptyMessage="No equipment matching search criteria."
        />
      )}

      {/* Creation and Edit Modals */}
      <EquipmentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={selectedItem}
        title={selectedItem ? 'Edit Asset Parameters' : 'Add New Machinery Asset'}
        isOnlyStatusAllowed={user?.role === 'mechanic'}
      />

      {/* Category & Template Manager Modal */}
      <Modal
        isOpen={isCategoryModalOpen}
        onClose={() => {
          setIsCategoryModalOpen(false);
          setSelectedCatForEdit(null);
          setManagerTab('categories');
        }}
        title="Categories, Templates & Workflows Manager"
        size="lg"
        footer={(
          <Button variant="secondary" onClick={() => {
            setIsCategoryModalOpen(false);
            setSelectedCatForEdit(null);
            setManagerTab('categories');
          }}>
            Close
          </Button>
        )}
      >
        {selectedCatForEdit ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)' }}>
            <h3 style={{ margin: 0, fontSize: 'var(--font-size-md)' }}>
              {selectedCatForEdit.id ? 'Edit Category Specifications' : 'Create New Category'}
            </h3>
            <Input
              label="Category Name"
              value={catName}
              onChange={(e) => setCatName(e.target.value)}
              required
              placeholder="e.g. Turbine, CNC Machine"
            />
            <Input
              label="Category Description"
              value={catDesc}
              onChange={(e) => setCatDesc(e.target.value)}
              placeholder="Brief description of machinery type"
            />
            
            <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: 'var(--space-md)' }}>
              <h4 style={{ margin: '0 0 var(--space-xs) 0', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>
                Define Category Parameters (Attributes)
              </h4>
              
              {catAttrs.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)', fontStyle: 'italic', margin: '0 0 var(--space-md) 0' }}>
                  No custom parameters defined yet. Add some below.
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: 'var(--space-md)' }}>
                  {catAttrs.map((attr, idx) => (
                    <div key={idx} style={{ 
                      display: 'flex', 
                      justifyContent: 'space-between', 
                      alignItems: 'center',
                      padding: 'var(--space-xs) var(--space-sm)',
                      backgroundColor: 'var(--bg-secondary)',
                      borderRadius: 'var(--radius-sm)',
                      border: '1px solid var(--border-color)',
                      fontSize: 'var(--font-size-sm)'
                    }}>
                      <div>
                        <strong>{attr.name}</strong>{' '}
                        <span style={{ color: 'var(--text-muted)', fontSize: 'var(--font-size-xs)' }}>
                          ({attr.type === 'number' ? 'Numeric' : 'Text'} &bull; {attr.isRequired ? 'Mandatory' : 'Optional'})
                        </span>
                      </div>
                      <Button variant="danger" size="sm" onClick={() => handleRemoveAttribute(idx)}>
                        Remove
                      </Button>
                    </div>
                  ))}
                </div>
              )}

              <Card style={{ padding: 'var(--space-sm)', backgroundColor: 'var(--bg-secondary)', border: '1px dashed var(--border-color)' }}>
                <h5 style={{ margin: '0 0 var(--space-xs) 0', fontSize: 'var(--font-size-sm)', fontWeight: 600 }}>Add Parameter</h5>
                <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end', flexWrap: 'wrap' }}>
                  <div style={{ flex: 2, minWidth: '150px' }}>
                    <Input
                      label="Parameter Name"
                      value={newAttrName}
                      onChange={(e) => setNewAttrName(e.target.value)}
                      placeholder="e.g. Max Spindle RPM"
                      wrapperStyle={{ marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ flex: 1, minWidth: '100px' }}>
                    <Select
                      label="Data Type"
                      options={[
                        { value: 'string', label: 'Text/String' },
                        { value: 'number', label: 'Numeric/Number' },
                      ]}
                      value={newAttrType}
                      onChange={(e) => setNewAttrType(e.target.value)}
                      wrapperStyle={{ marginBottom: 0 }}
                    />
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', height: '36px', paddingBottom: '8px' }}>
                    <input
                      type="checkbox"
                      id="newAttrReq"
                      checked={newAttrRequired}
                      onChange={(e) => setNewAttrRequired(e.target.checked)}
                    />
                    <label htmlFor="newAttrReq" style={{ fontSize: 'var(--font-size-xs)', fontWeight: 500, cursor: 'pointer' }}>
                      Required (Mandatory)
                    </label>
                  </div>
                  <Button variant="secondary" onClick={handleAddAttribute}>
                    Add
                  </Button>
                </div>
              </Card>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: 'var(--space-md)' }}>
              <Button variant="secondary" onClick={() => setSelectedCatForEdit(null)}>
                Back to List
              </Button>
              <Button variant="primary" onClick={handleSaveCategory} glow>
                Save Category
              </Button>
            </div>
          </div>
        ) : (
          <Tabs
            activeTabId={managerTab}
            onTabChange={setManagerTab}
            tabs={[
              {
                id: 'categories',
                label: 'Equipment Categories',
                content: (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-md)', marginTop: 'var(--space-md)' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: 'var(--font-size-sm)' }}>
                        Define dynamic mandatory/auxiliary parameters for each machinery category.
                      </p>
                      <Button variant="primary" size="sm" onClick={handleAddNewCategoryClick}>
                        <Plus size={14} style={{ marginRight: '4px' }} /> Create Category
                      </Button>
                    </div>

                    {categories.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: 'var(--space-lg)' }}>
                        No custom categories created yet.
                      </div>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-xs)', maxHeight: '300px', overflowY: 'auto' }}>
                        {categories.map(cat => (
                          <Card key={cat.id} style={{ padding: 'var(--space-sm) var(--space-md)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <div>
                                <h4 style={{ margin: 0 }}>{cat.name}</h4>
                                <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', margin: '4px 0 0 0' }}>
                                  {cat.description || 'No description'} &bull; {cat.attributes.length} parameters defined
                                </p>
                              </div>
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <Button variant="secondary" size="sm" onClick={() => handleEditCategory(cat)}>
                                  Edit
                                </Button>
                                <Button variant="danger" size="sm" onClick={() => handleDeleteCategory(cat.id)}>
                                  Delete
                                </Button>
                              </div>
                            </div>
                          </Card>
                        ))}
                      </div>
                    )}
                  </div>
                )
              },
              {
                id: 'templates',
                label: 'Standard Fields Template',
                content: (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    {templatesContent}
                  </div>
                )
              },
              {
                id: 'mandatoryDocs',
                label: 'Mandatory Documents',
                content: (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    {mandatoryDocsContent}
                  </div>
                )
              },
              {
                id: 'uploadSettings',
                label: 'Upload Settings',
                content: (
                  <div style={{ marginTop: 'var(--space-md)' }}>
                    {uploadSettingsContent}
                  </div>
                )
              },
              {
                id: 'changeRequests',
                label: 'Change Requests',
                content: changeRequestsContent
              }
            ]}
          />
        )}
      </Modal>
    </div>
  );
};
