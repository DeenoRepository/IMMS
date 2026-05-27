import React from 'react';
import { useAuthStore } from '../store/authStore';
import { useModuleStore } from '../store/moduleStore';
import { Card, Button } from '@mech/ui';
import { useNavigate } from 'react-router-dom';
import * as Icons from 'lucide-react';

export const Dashboard: React.FC = () => {
  const { user } = useAuthStore();
  const { getAuthorizedModules } = useModuleStore();
  const navigate = useNavigate();

  if (!user) return null;

  const authorizedModules = getAuthorizedModules(user.role);

  return (
    <div className="dashboard-view">
      <div className="dashboard-welcome">
        <h1>Welcome back, {user.name}</h1>
        <p>Operational Dashboard for the Mechanical Engineering Department</p>
      </div>

      <div className="dashboard-metrics-grid">
        <Card className="metric-card" interactive>
          <div className="metric-header">
            <Icons.Settings className="metric-icon success" size={24} />
            <span className="metric-label">Equipment Status</span>
          </div>
          <div className="metric-value">124 / 128</div>
          <div className="metric-subtext">Online & operational (96.8%)</div>
        </Card>

        <Card className="metric-card" interactive>
          <div className="metric-header">
            <Icons.Wrench className="metric-icon warning" size={24} />
            <span className="metric-label">Active Repairs</span>
          </div>
          <div className="metric-value">4</div>
          <div className="metric-subtext">Work orders currently in progress</div>
        </Card>

        <Card className="metric-card" interactive>
          <div className="metric-header">
            <Icons.Box className="metric-icon danger" size={24} />
            <span className="metric-label">Low Stock Spare Parts</span>
          </div>
          <div className="metric-value">3</div>
          <div className="metric-subtext">Critical parts below limit level</div>
        </Card>

        <Card className="metric-card" interactive>
          <div className="metric-header">
            <Icons.ClipboardList className="metric-icon primary" size={24} />
            <span className="metric-label">Technical Requests</span>
          </div>
          <div className="metric-value">8</div>
          <div className="metric-subtext">New requests pending review</div>
        </Card>
      </div>

      <div className="dashboard-modules-section">
        <h2>Quick Module Access</h2>
        <div className="modules-grid">
          {authorizedModules.map((module) => {
            const Icon = (Icons as any)[module.icon] || Icons.HelpCircle;
            return (
              <Card key={module.key} className="module-access-card" interactive>
                <div className="module-access-header">
                  <Icon size={28} className="module-access-icon" />
                  <h3>{module.title}</h3>
                </div>
                <p className="module-access-desc">
                  Access and manage system operations related to {module.title.toLowerCase()}.
                </p>
                <Button 
                  variant="primary" 
                  size="sm" 
                  onClick={() => navigate(module.route)}
                  className="module-access-btn"
                >
                  Open Module
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </div>
  );
};
