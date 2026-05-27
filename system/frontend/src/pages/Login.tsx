import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../store/authStore';
import { Card, Input, Button } from '@mech/ui';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const login = useAuthStore((state) => state.login);
  
  const [username, setUsername] = useState('John Doe');
  const [role, setRole] = useState<UserRole>('mechanic');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    login(role, username);
    navigate('/');
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

          <div className="mech-input-wrapper">
            <label className="mech-input-label">Select System Role</label>
            <select
              className="mech-input"
              value={role}
              onChange={(e) => setRole(e.target.value as UserRole)}
              style={{ width: '100%', height: '42px', padding: '0 var(--space-sm)' }}
            >
              <option value="mechanic">Mechanic</option>
              <option value="chief_mechanic">Chief Mechanical Engineer</option>
              <option value="warehouse_manager">Warehouse Manager</option>
              <option value="admin">Administrator</option>
            </select>
          </div>

          <Button type="submit" variant="primary" size="lg" glow style={{ width: '100%', marginTop: 'var(--space-md)' }}>
            Sign In to System
          </Button>
        </form>
      </Card>
    </div>
  );
};
