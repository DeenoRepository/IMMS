import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStore, type UserRole } from '../store/authStore';
import { AppLayout } from '../layout/AppLayout';
import { Login } from '../pages/Login';
import { Dashboard } from '../pages/Dashboard';
import { Equipment } from '../pages/Equipment';

// Route Guards
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RequireRole: React.FC<{ children: React.ReactNode; allowedRoles?: UserRole[] }> = ({ children, allowedRoles }) => {
  const { user } = useAuthStore();
  if (!user) return <Navigate to="/login" replace />;
  if (allowedRoles && !allowedRoles.includes(user.role)) {
    return <Navigate to="/unauthorized" replace />;
  }
  return <>{children}</>;
};

// Module Placeholder Components

const MaintenancePlaceholder = () => (
  <div className="module-placeholder">
    <h2>Maintenance (PPR) Module</h2>
    <p>This is a placeholder for the maintenance and repairs planning module.</p>
  </div>
);

const WarehousePlaceholder = () => (
  <div className="module-placeholder">
    <h2>Warehouse Inventory Module</h2>
    <p>This is a placeholder for the spare parts warehouse inventory management.</p>
  </div>
);

const RequestsPlaceholder = () => (
  <div className="module-placeholder">
    <h2>Maintenance Requests Module</h2>
    <p>This is a placeholder for submitting and tracking technical requests.</p>
  </div>
);

const AnalyticsPlaceholder = () => (
  <div className="module-placeholder">
    <h2>Operational Analytics Module</h2>
    <p>This is a placeholder for overall system and downtime metrics charts.</p>
  </div>
);

const UnauthorizedPage = () => (
  <div className="unauthorized-page">
    <h2>Access Denied</h2>
    <p>You do not have the required permissions to view this module. Please contact the administrator.</p>
  </div>
);

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      
      <Route path="/" element={<RequireAuth><AppLayout /></RequireAuth>}>
        <Route index element={<Dashboard />} />
        
        <Route path="unauthorized" element={<UnauthorizedPage />} />
        
        <Route 
          path="equipment" 
          element={
            <RequireRole allowedRoles={['mechanic', 'chief_mechanic', 'admin']}>
              <Equipment />
            </RequireRole>
          } 
        />
        
        <Route 
          path="maintenance" 
          element={
            <RequireRole allowedRoles={['mechanic', 'chief_mechanic', 'admin']}>
              <MaintenancePlaceholder />
            </RequireRole>
          } 
        />

        <Route 
          path="warehouse" 
          element={
            <RequireRole allowedRoles={['warehouse_manager', 'chief_mechanic', 'admin']}>
              <WarehousePlaceholder />
            </RequireRole>
          } 
        />

        <Route 
          path="requests" 
          element={
            <RequireRole allowedRoles={['mechanic', 'chief_mechanic', 'admin']}>
              <RequestsPlaceholder />
            </RequireRole>
          } 
        />

        <Route 
          path="analytics" 
          element={
            <RequireRole allowedRoles={['chief_mechanic', 'admin']}>
              <AnalyticsPlaceholder />
            </RequireRole>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Route>
    </Routes>
  );
};
