import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../store/authStore';
import { Card, Input, Button, Select } from '@core/ui';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('John Doe');
  const [role, setRole] = useState<UserRole>('mechanic');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(role, username);
      navigate('/');
    } catch (err) {
      alert('Login failed: cannot connect to the backend server.');
    }
  };

  return (
    <div className="login-container">
      <Card className="login-card" glow>
        <div className="login-header">
          <div className="login-logo">⚙️</div>
          <h1>CMMS Enterprise</h1>
          <p>Chief Mechanical Engineer Department Management</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <Input
            label="Employee Name"
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
            placeholder="Enter full name"
          />

          <Select
            label="Select System Role"
            value={role}
            onChange={(e) => setRole(e.target.value as UserRole)}
            options={[
              { value: 'mechanic', label: 'Mechanic' },
              { value: 'chief_mechanic', label: 'Chief Mechanical Engineer' },
              { value: 'warehouse_manager', label: 'Warehouse Manager' },
              { value: 'admin', label: 'Administrator' },
            ]}
          />

          <Button type="submit" variant="primary" size="lg" glow style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            Sign In to System
          </Button>
        </form>
      </Card>
    </div>
  );
};
