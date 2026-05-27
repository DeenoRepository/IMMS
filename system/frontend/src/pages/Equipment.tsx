import React, { useEffect, useState, useMemo } from 'react';
import { useAuthStore } from '../store/authStore';
import { Card, Button, Input, Select, Table, EquipmentStatusIndicator } from '@core/ui';
import api from '../utils/api';
import { EquipmentModal, type EquipmentFormValues } from './EquipmentModal';
import { Plus, Trash2, Edit, RefreshCw } from 'lucide-react';

interface EquipmentItem {
  id: string;
  name: string;
  type: string;
  location: string;
  status: 'online' | 'warning' | 'offline';
  commissioningDate: string;
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

  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<EquipmentItem | undefined>(undefined);

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
          // Mechanics can only patch status
          await api.put(`/equipment/${selectedItem.id}`, { status: values.status });
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

  // Filter and sort data
  const filteredData = useMemo(() => {
    return data
      .filter((item) => {
        const matchesSearch =
          item.name.toLowerCase().includes(search.toLowerCase()) ||
          item.location.toLowerCase().includes(search.toLowerCase()) ||
          item.type.toLowerCase().includes(search.toLowerCase());
        const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
        const matchesType = typeFilter === 'all' || item.type === typeFilter;
        return matchesSearch && matchesStatus && matchesType;
      })
      .sort((a, b) => {
        const fieldA = (a as any)[sortBy] || '';
        const fieldB = (b as any)[sortBy] || '';
        if (fieldA < fieldB) return sortDirection === 'asc' ? -1 : 1;
        if (fieldA > fieldB) return sortDirection === 'asc' ? 1 : -1;
        return 0;
      });
  }, [data, search, statusFilter, typeFilter, sortBy, sortDirection]);

  // Table columns definition
  const columns = [
    {
      key: 'status',
      header: 'Status',
      sortable: true,
      render: (row: EquipmentItem) => <EquipmentStatusIndicator status={row.status} />,
    },
    { key: 'name', header: 'Name', sortable: true },
    { key: 'type', header: 'Type / Class', sortable: true },
    { key: 'location', header: 'Location', sortable: true },
    {
      key: 'commissioningDate',
      header: 'Commissioned On',
      sortable: true,
      render: (row: EquipmentItem) => new Date(row.commissioningDate).toLocaleDateString(),
    },
    {
      key: 'actions',
      header: 'Actions',
      render: (row: EquipmentItem) => (
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
            <Button variant="primary" onClick={handleOpenAddModal} glow>
              <Plus size={16} style={{ marginRight: '6px' }} />
              Add Equipment
            </Button>
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
        <div style={{ display: 'flex', gap: '15px', flexWrap: 'wrap' }}>
          <div style={{ flex: 2, minWidth: '200px' }}>
            <Input
              placeholder="Search by name, type, or location..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ marginBottom: 0 }}
            />
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
              style={{ marginBottom: 0 }}
            />
          </div>
          <div style={{ flex: 1, minWidth: '150px' }}>
            <Select
              options={uniqueTypes.map((type) => ({
                value: type,
                label: type === 'all' ? 'All Types' : type,
              }))}
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              style={{ marginBottom: 0 }}
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
    </div>
  );
};
