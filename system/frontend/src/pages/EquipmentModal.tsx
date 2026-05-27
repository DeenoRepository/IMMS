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
  Trash2
} from 'lucide-react';

export interface EquipmentFormValues {
  name: string;
  type: string;
  location: string;
  status: 'online' | 'warning' | 'offline';
  commissioningDate: string;
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
  createdAt: string;
  versions: DocumentVersion[];
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

  // Specs form states
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'online' | 'warning' | 'offline'>('online');
  const [commissioningDate, setCommissioningDate] = useState('');

  // Passport / Documents states
  const [documents, setDocuments] = useState<EquipmentDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);
  const [expandedDocId, setExpandedDocId] = useState<string | null>(null);
  
  // Document creation form states
  const [newDocTitle, setNewDocTitle] = useState('');
  const [newDocDesc, setNewDocDesc] = useState('');
  const [newDocFile, setNewDocFile] = useState<File | null>(null);
  const [isAddingDoc, setIsAddingDoc] = useState(false);

  // New version form states
  const [uploadVersionDocId, setUploadVersionDocId] = useState<string | null>(null);
  const [newVersionSummary, setNewVersionSummary] = useState('');
  const [newVersionFile, setNewVersionFile] = useState<File | null>(null);

  const isWriteAllowed = user?.role === 'chief_mechanic' || user?.role === 'admin';

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
      setActiveTab('specs'); // Reset to specs tab when opening modal
    } else {
      setName('');
      setType('');
      setLocation('');
      setStatus('online');
      setCommissioningDate(new Date().toISOString().split('T')[0]);
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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      name,
      type,
      location,
      status,
      commissioningDate,
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

  const handleAddDocument = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDocFile) {
      alert('Please select a passport document file to upload.');
      return;
    }
    const formData = new FormData();
    formData.append('title', newDocTitle);
    formData.append('description', newDocDesc);
    formData.append('file', newDocFile);

    try {
      await api.post(`/equipment/${initialValues.id}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      setNewDocTitle('');
      setNewDocDesc('');
      setNewDocFile(null);
      setIsAddingDoc(false);
      fetchDocuments();
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
        <>
          <Input
            label="Equipment Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            placeholder="e.g. Lathe 1A"
          />
          <Input
            label="Type / Class"
            value={type}
            onChange={(e) => setType(e.target.value)}
            required
            placeholder="e.g. Lathe, Pump, Boiler"
          />
          <Input
            label="Location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
            placeholder="e.g. Main Hall, Workshop 2"
          />
          <Input
            label="Commissioning Date"
            type="date"
            value={commissioningDate}
            onChange={(e) => setCommissioningDate(e.target.value)}
            required
          />
        </>
      ) : (
        <div style={{ marginBottom: 'var(--space-md)' }}>
          <p><strong>Equipment:</strong> {name}</p>
          <p><strong>Type:</strong> {type}</p>
          <p><strong>Location:</strong> {location}</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)' }}>
            * Under your role (Mechanic), you are only authorized to change the operational status.
          </p>
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
            <Input
              label="Description"
              value={newDocDesc}
              onChange={(e) => setNewDocDesc(e.target.value)}
              placeholder="Brief summary of document content"
            />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <label style={{ fontSize: 'var(--font-size-sm)', fontWeight: 500 }}>Select File (PDF, DOCX, ZIP, etc.)</label>
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
                      <h4 style={{ margin: 0, fontWeight: 600 }}>{doc.title}</h4>
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
                      <Button variant="secondary" size="sm" onClick={() => handleDownload(activeVersion.fileUrl, activeVersion.fileName)} title="Download Latest Version">
                        <Download size={14} />
                      </Button>
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
                          <Button variant="secondary" size="sm" onClick={() => handleDownload(v.fileUrl, v.fileName)} title="Download version file">
                            <Download size={12} />
                          </Button>
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

  // Tab definitions
  const tabsList = [
    { id: 'specs', label: 'Specifications', content: specsContent },
    { id: 'docs', label: 'Technical Passport / Docs', content: docsContent }
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
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={modalFooter}
    >
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
  );
};
