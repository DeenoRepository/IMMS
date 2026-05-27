import React from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const AppLayout: React.FC = () => {
  return (
    <div className="shell-container">
      <Header />
      <div className="shell-main">
        <Sidebar />
        <main className="shell-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
