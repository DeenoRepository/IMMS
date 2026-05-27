import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '@core/ui';
import api from '../utils/api';

export interface MaintenanceFormValues {
  equipmentId: string;
  type: 'PPR' | 'repair';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  plannedDate: string;
  completedDate: string | null;
}

interface EquipmentItem {
  id: string;
  name: string;
  location: string;
}

interface MaintenanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (values: MaintenanceFormValues) => void;
  initialValues?: any;
  title: string;
  isOnlyStatusAllowed?: boolean; // mechanic role restriction
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title,
  isOnlyStatusAllowed = false,
}) => {
  const [equipmentId, setEquipmentId] = useState('');
  const [type, setType] = useState<'PPR' | 'repair'>('PPR');
  const [status, setStatus] = useState<'pending' | 'in_progress' | 'completed' | 'cancelled'>('pending');
  const [plannedDate, setPlannedDate] = useState('');
  const [completedDate, setCompletedDate] = useState('');
  const [equipmentList, setEquipmentList] = useState<EquipmentItem[]>([]);
  const [loadingEquipments, setLoadingEquipments] = useState(false);

  useEffect(() => {
    const fetchEquipments = async () => {
      setLoadingEquipments(true);
      try {
        const response = await api.get<EquipmentItem[]>('/equipment');
        setEquipmentList(response.data);
      } catch (err) {
        console.error('Failed to fetch equipment list', err);
      } finally {
        setLoadingEquipments(false);
      }
    };

    if (isOpen && !isOnlyStatusAllowed) {
      fetchEquipments();
    }
  }, [isOpen, isOnlyStatusAllowed]);

  useEffect(() => {
    if (initialValues) {
      setEquipmentId(initialValues.equipmentId || '');
      setType(initialValues.type || 'PPR');
      setStatus(initialValues.status || 'pending');
      setPlannedDate(
        initialValues.plannedDate
          ? new Date(initialValues.plannedDate).toISOString().split('T')[0]
          : ''
      );
      setCompletedDate(
        initialValues.completedDate
          ? new Date(initialValues.completedDate).toISOString().split('T')[0]
          : ''
      );
    } else {
      setEquipmentId('');
      setType('PPR');
      setStatus('pending');
      setPlannedDate(new Date().toISOString().split('T')[0]);
      setCompletedDate('');
    }
  }, [initialValues, isOpen]);

  // Adjust completedDate based on status change automatically for convenience
  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus as any);
    if (newStatus === 'completed' && !completedDate) {
      setCompletedDate(new Date().toISOString().split('T')[0]);
    } else if (newStatus !== 'completed') {
      setCompletedDate('');
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!equipmentId && !isOnlyStatusAllowed) {
      alert('Please select an equipment.');
      return;
    }
    onSubmit({
      equipmentId: isOnlyStatusAllowed ? initialValues.equipmentId : equipmentId,
      type: isOnlyStatusAllowed ? initialValues.type : type,
      status,
      plannedDate: isOnlyStatusAllowed ? initialValues.plannedDate : plannedDate,
      completedDate: status === 'completed' ? (completedDate || new Date().toISOString().split('T')[0]) : null,
    });
  };

  const typeOptions = [
    { value: 'PPR', label: 'Preventive (PPR)' },
    { value: 'repair', label: 'Repair' },
  ];

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const equipmentOptions = [
    { value: '', label: 'Select Equipment...' },
    ...equipmentList.map((item) => ({
      value: item.id,
      label: `${item.name} (${item.location})`,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      footer={
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" onClick={handleSubmit} glow>
            Save Changes
          </Button>
        </div>
      }
    >
      <form onSubmit={handleSubmit}>
        {!isOnlyStatusAllowed ? (
          <>
            <Select
              label="Select Equipment"
              options={equipmentOptions}
              value={equipmentId}
              onChange={(e) => setEquipmentId(e.target.value)}
              required
              disabled={loadingEquipments}
            />
            <Select
              label="Maintenance Type"
              options={typeOptions}
              value={type}
              onChange={(e) => setType(e.target.value as any)}
            />
            <Input
              label="Scheduled Date"
              type="date"
              value={plannedDate}
              onChange={(e) => setPlannedDate(e.target.value)}
              required
            />
          </>
        ) : (
          <div style={{ marginBottom: 'var(--space-md)' }}>
            <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Equipment:</strong> {initialValues?.equipment?.name || 'Loading...'}</p>
            <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Type:</strong> {initialValues?.type === 'PPR' ? 'Preventive (PPR)' : 'Repair'}</p>
            <p style={{ margin: 'var(--space-xxs) 0' }}><strong>Scheduled Date:</strong> {initialValues?.plannedDate ? new Date(initialValues.plannedDate).toLocaleDateString() : ''}</p>
            <p style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-xs)', margin: 'var(--space-xs) 0 0 0' }}>
              * Under your role (Mechanic), you are only authorized to change the work order status and completion date.
            </p>
          </div>
        )}

        <Select
          label="Work Order Status"
          options={statusOptions}
          value={status}
          onChange={(e) => handleStatusChange(e.target.value)}
        />

        {status === 'completed' && (
          <Input
            label="Completion Date"
            type="date"
            value={completedDate}
            onChange={(e) => setCompletedDate(e.target.value)}
            required
          />
        )}
      </form>
    </Modal>
  );
};
