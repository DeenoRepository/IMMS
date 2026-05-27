import React from 'react';
import { Badge } from './Badge.js';

// Status circles
export interface EquipmentStatusIndicatorProps {
  status: 'online' | 'warning' | 'offline' | string;
}

export const EquipmentStatusIndicator: React.FC<EquipmentStatusIndicatorProps> = ({ status }) => {
  const getPulseClass = (st: string) => {
    switch (st) {
      case 'online': return 'mech-pulse-green';
      case 'warning': return 'mech-pulse-yellow';
      case 'offline': return 'mech-pulse-red';
      default: return '';
    }
  };

  return (
    <div style={{ display: 'inline-flex', alignItems: 'center', gap: '8px' }}>
      <span className={`mech-pulse ${getPulseClass(status)}`} />
      <span style={{ textTransform: 'capitalize', fontSize: 'var(--font-size-sm)' }}>
        {status}
      </span>
    </div>
  );
};

// Downtime badge
export interface DowntimeBadgeProps {
  durationHours: number;
}

export const DowntimeBadge: React.FC<DowntimeBadgeProps> = ({ durationHours }) => {
  let variant: 'success' | 'warning' | 'danger' = 'success';
  if (durationHours > 24) variant = 'danger';
  else if (durationHours > 4) variant = 'warning';

  return (
    <Badge variant={variant}>
      {durationHours} hrs downtime
    </Badge>
  );
};

// Priority tag
export interface MaintenancePriorityTagProps {
  priority: 'low' | 'medium' | 'high' | 'critical' | string;
}

export const MaintenancePriorityTag: React.FC<MaintenancePriorityTagProps> = ({ priority }) => {
  const getBadgeVariant = (pr: string) => {
    switch (pr) {
      case 'low': return 'secondary';
      case 'medium': return 'primary';
      case 'high': return 'warning';
      case 'critical': return 'danger';
      default: return 'secondary';
    }
  };

  return (
    <Badge variant={getBadgeVariant(priority)}>
      {priority}
    </Badge>
  );
};
