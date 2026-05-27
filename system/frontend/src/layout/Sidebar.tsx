import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useModuleStore } from '../store/moduleStore';
import * as Icons from 'lucide-react';

export const Sidebar: React.FC = () => {
  const { user } = useAuthStore();
  const { getAuthorizedModules } = useModuleStore();

  if (!user) return null;

  const authorizedModules = getAuthorizedModules(user.role);

  return (
    <aside className="shell-sidebar">
      <nav className="sidebar-nav">
        <NavLink 
          to="/" 
          className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
          end
        >
          <Icons.LayoutDashboard size={18} className="link-icon" />
          <span>Dashboard</span>
        </NavLink>

        <div className="nav-divider">Modules</div>

        {authorizedModules.map((moduleConfig) => {
          // Dynamically resolve the Lucide Icon component
          const IconComponent = (Icons as any)[moduleConfig.icon] || Icons.HelpCircle;

          return (
            <NavLink
              key={moduleConfig.key}
              to={moduleConfig.route}
              className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''}`}
            >
              <IconComponent size={18} className="link-icon" />
              <span>{moduleConfig.title}</span>
            </NavLink>
          );
        })}
      </nav>
      <div className="sidebar-footer">
        <span className="system-version">v1.0.0-beta</span>
      </div>
    </aside>
  );
};
