import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, Button, Input, Select, Table, Badge } from '@core/ui';
import api from '../utils/api';
import { MaintenanceModal, type MaintenanceFormValues } from './MaintenanceModal';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  location: string;
}

interface MaintenanceItem {
  id: string;
  equipmentId: string;
  equipment: EquipmentItem;
  type: 'PPR' | 'repair';
  status: 'pending' | 'in_progress' | 'completed' | 'cancelled';
  plannedDate: string;
  completedDate: string | null;
}

export const Maintenance: React.FC = () => {
  const { user } = useAuthStore();
  const [data, setData] = useState<MaintenanceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<MaintenanceItem | undefined>(undefined);

  // Sorting
  const [sortBy, setSortBy] = useState<string>('plannedDate');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');

  const isWriteAllowed = user?.role === 'chief_mechanic' || user?.role === 'admin';

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await api.get<MaintenanceItem[]>('/maintenance');
      setData(response.data);
    } catch (e: any) {
      setError(e.response?.data?.message || 'Failed to fetch maintenance registry.');
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

  const handleOpenEditModal = (item: MaintenanceItem) => {
    setSelectedItem(item);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this maintenance record?')) return;
    try {
      await api.delete(`/maintenance/${id}`);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to delete maintenance task.');
    }
  };

  const handleFormSubmit = async (values: MaintenanceFormValues) => {
    try {
      if (selectedItem) {
        // Edit existing
        if (user?.role === 'mechanic') {
          // Mechanics can only patch status and completion date
          await api.put(`/maintenance/${selectedItem.id}`, { 
            status: values.status, 
            completedDate: values.completedDate 
          });
        } else {
          await api.put(`/maintenance/${selectedItem.id}`, values);
        }
      } else {
        // Create new
        await api.post('/maintenance', values);
      }
      setIsModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Operation failed.');
    }
  };

  const handleSort = (key: string) => {
    if (sortBy === key) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(key);
      setSortDirection('asc');
    }
  };

  // Compute counters
  const counters = useMemo(() => {
    const total = data.length;
    const pending = data.filter((i) => i.status === 'pending').length;
    const inProgress = data.filter((i) => i.status === 'in_progress').length;
    const completed = data.filter((i) => i.status === 'completed').length;
    return { total, pending, inProgress, completed };
  }, [data]);

  // Filter and sort data
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const equipmentName = item.equipment?.name || '';
        const equipmentLocation = item.equipment?.location || '';
        const matchesSearch =
          equipmentName.toLowerCase().includes(search.toLowerCase()) ||
          equipmentLocation.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        let fieldA: any = (a as any)[sortBy];
        let fieldB: any = (b as any)[sortBy];

        // Special handling for equipment nested object sorting
        if (sortBy === 'equipment') {
          fieldA = a.equipment?.name || '';
          fieldB = b.equipment?.name || '';
        }

        if (fieldA === undefined || fieldA === null) fieldA = '';
        if (fieldB === undefined || fieldB === null) fieldB = '';

        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, search, statusFilter, typeFilter, sortBy, sortDirection]);

  // Table columns definition
  const columns = [
    {
      key: 'equipment',
      header: 'Equipment / Asset',
      sortable: true,
      render: (row: MaintenanceItem) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.equipment?.name || 'Unknown Equipment'}</div>
          <div style={{ fontSize: 'var(--font-size-xs)', color: 'var(--text-secondary)' }}>
            {row.equipment?.location || 'Unknown Location'}
          </div>
        </div>
      ),
    },
    {
      key: 'type',
      header: 'Type',
      sortable: true,
      render: (row: MaintenanceItem) => {
        const isPPR = row.type === 'PPR';
        return (
          <Badge variant={isPPR ? 'primary' : 'warning'}>
            {isPPR ? 'Preventive (PPR)' : 'Repair'}
          </Badge>
        );
      },
    },
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: MaintenanceItem) => {
        let variant: 'secondary' | 'primary' | 'success' | 'danger' = 'secondary';
        if (row.status === 'in_progress') variant = 'primary';
        else if (row.status === 'completed') variant = 'success';
        else if (row.status === 'cancelled') variant = 'danger';

        const label = row.status.replace('_', ' ').toUpperCase();

        return <Badge variant={variant}>{label}</Badge>;
      },
    },
    {
      key: 'plannedDate',
      header: 'Planned Date',
      sortable: true,
      render: (row: MaintenanceItem) => new Date(row.plannedDate).toLocaleDateString(),
    },
    {
      key: 'completedDate',
      header: 'Completed Date',
      sortable: true,
      render: (row: MaintenanceItem) =>
        row.completedDate ? new Date(row.completedDate).toLocaleDateString() : '-',
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: MaintenanceItem) => (
        <div style={{ display: 'flex', gap: '8px' }}>
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
    },
  ];

  return (
    <div className="maintenance-view" style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-lg)' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ margin: 0 }}>Maintenance Registry</h1>
          <p style={{ color: 'var(--text-secondary)', margin: 'var(--space-xxs) 0 0 0' }}>
            Schedule and track equipment preventive actions (PPR) and corrective repair tickets
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Button variant="secondary" onClick={fetchData} title="Reload list">
            <RefreshCw size={16} />
          </Button>
          {isWriteAllowed && (
            <Button variant="primary" onClick={handleOpenAddModal} glow>
              <Plus size={16} style={{ marginRight: '6px' }} />
              Schedule Maintenance
            </Button>
          )}
        </div>
      </div>

      {/* Metrics Header Grid */}
      <div className="dashboard-metrics-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
        <Card>
          <div style={{ color: 'var(--text-secondary)', fontSize: 'var(--font-size-sm)' }}>Total Orders</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700 }}>{counters.total}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--color-primary)', fontSize: 'var(--font-size-sm)' }}>Pending</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700, color: 'var(--color-primary)' }}>{counters.pending}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--color-warning)', fontSize: 'var(--font-size-sm)' }}>In Progress</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700, color: 'var(--color-warning)' }}>{counters.inProgress}</div>
        </Card>
        <Card>
          <div style={{ color: 'var(--color-success)', fontSize: 'var(--font-size-sm)' }}>Completed</div>
          <div style={{ fontSize: 'var(--font-size-xxl)', fontWeight: 700, color: 'var(--color-success)' }}>{counters.completed}</div>
        </Card>
      </div>

      {/* Filter Options */}
      <Card style={{ padding: 'var(--space-md)' }}>
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <Input
              placeholder="Search by equipment name or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              wrapperStyle={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select
              options={[
                { value: 'all', label: 'All Statuses' },
                { value: 'pending', label: 'Pending' },
                { value: 'in_progress', label: 'In Progress' },
                { value: 'completed', label: 'Completed' },
                { value: 'cancelled', label: 'Cancelled' },
              ]}
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              wrapperStyle={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select
              options={[
                { value: 'all', label: 'All Types' },
                { value: 'PPR', label: 'Preventive (PPR)' },
                { value: 'repair', label: 'Repair' },
              ]}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              wrapperStyle={{ marginBottom: 0 }}
            />
          </div>
        </div>
      </Card>

      {/* Main Table view */}
      {error ? (
        <div style={{ color: 'var(--color-danger)', padding: 'var(--space-md)', textAlign: 'center' }}>
          {error}
        </div>
      ) : loading ? (
        <div style={{ color: 'var(--text-secondary)', padding: 'var(--space-xl)', textAlign: 'center' }}>
          Loading maintenance records...
        </div>
      ) : (
        <Table
          columns={columns}
          data={filteredData}
          sortBy={sortBy}
          sortDirection={sortDirection}
          onSort={handleSort}
          onRowClick={(row) => handleOpenEditModal(row)}
          emptyMessage="No maintenance tasks matching criteria."
        />
      )}

      {/* Creation and Edit Modals */}
      <MaintenanceModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleFormSubmit}
        initialValues={selectedItem}
        title={selectedItem ? 'Edit Maintenance Task' : 'Schedule New Maintenance Task'}
        isOnlyStatusAllowed={user?.role === 'mechanic'}
      />
    </div>
  );
};
