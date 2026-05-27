import React, { useState, useEffect } from 'react';
import { Modal, Input, Select, Button } from '@core/ui';

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
  initialValues?: EquipmentFormValues;
  title: string;
  isOnlyStatusAllowed?: boolean; // RBAC restriction for normal mechanic
}

export const EquipmentModal: React.FC<EquipmentModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialValues,
  title,
  isOnlyStatusAllowed = false,
}) => {
  const [name, setName] = useState('');
  const [type, setType] = useState('');
  const [location, setLocation] = useState('');
  const [status, setStatus] = useState<'online' | 'warning' | 'offline'>('online');
  const [commissioningDate, setCommissioningDate] = useState('');

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
    } else {
      setName('');
      setType('');
      setLocation('');
      setStatus('online');
      setCommissioningDate(new Date().toISOString().split('T')[0]);
    }
  }, [initialValues, isOpen]);

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

  const statusOptions = [
    { value: 'online', label: 'Online' },
    { value: 'warning', label: 'Warning' },
    { value: 'offline', label: 'Offline' },
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
    </Modal>
  );
};
