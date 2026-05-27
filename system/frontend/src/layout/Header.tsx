import React from 'react';
import { useAuthStore } from '../store/authStore';
import { Button } from '@core/ui';
import { User as UserIcon, LogOut, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const { user, logout } = useAuthStore();

  const getRoleColorClass = (role: string) => {
    switch (role) {
      case 'admin': return 'role-admin';
      case 'chief_mechanic': return 'role-chief';
      case 'warehouse_manager': return 'role-warehouse';
      default: return 'role-mechanic';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin': return 'Administrator';
      case 'chief_mechanic': return 'Chief Mechanic';
      case 'warehouse_manager': return 'Warehouse Manager';
      case 'mechanic': return 'Mechanic';
      default: return role;
    }
  };

  return (
    <header className="shell-header">
      <div className="header-brand">
        <span className="brand-logo">⚙️</span>
        <span className="brand-name">CMMS Enterprise</span>
      </div>

      {user && (
        <div className="header-actions">
          <button className="header-icon-btn" title="Notifications">
            <Bell size={20} />
          </button>
          
          <div className="user-profile">
            <div className="user-avatar">
              <UserIcon size={18} />
            </div>
            <div className="user-info">
              <span className="user-name">{user.name}</span>
              <span className={`user-role ${getRoleColorClass(user.role)}`}>
                {getRoleLabel(user.role)}
              </span>
            </div>
          </div>

          <Button variant="secondary" size="sm" onClick={logout} className="logout-btn">
            <LogOut size={16} style={{ marginRight: '6px' }} />
            Sign Out
          </Button>
        </div>
      )}
    </header>
  );
};
