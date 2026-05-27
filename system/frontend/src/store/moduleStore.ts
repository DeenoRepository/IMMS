import { create } from 'zustand';
import { type UserRole } from './authStore';

export interface ModuleConfig {
  key: string;
  title: string;
  route: string;
  icon: string; // Name of Lucide React icon to render
  allowedRoles?: UserRole[];
  loader: () => Promise<any>;
}

interface ModuleState {
  modules: ModuleConfig[];
  registerModule: (module: ModuleConfig) => void;
  getAuthorizedModules: (role: UserRole) => ModuleConfig[];
}

export const useModuleStore = create<ModuleState>((set, get) => {
  // Initial list of modules as specified in the monorepo architecture
  const initialModules: ModuleConfig[] = [
    {
      key: 'equipment',
      title: 'Equipment Management',
      route: '/equipment',
      icon: 'Settings',
      allowedRoles: ['mechanic', 'chief_mechanic', 'admin'],
      loader: () => Promise.resolve({ default: () => null })
    },
    {
      key: 'maintenance',
      title: 'Maintenance (PPR)',
      route: '/maintenance',
      icon: 'Wrench',
      allowedRoles: ['mechanic', 'chief_mechanic', 'admin'],
      loader: () => Promise.resolve({ default: () => null })
    },
    {
      key: 'warehouse',
      title: 'Warehouse Inventory',
      route: '/warehouse',
      icon: 'Box',
      allowedRoles: ['warehouse_manager', 'chief_mechanic', 'admin'],
      loader: () => Promise.resolve({ default: () => null })
    },
    {
      key: 'requests',
      title: 'Maintenance Requests',
      route: '/requests',
      icon: 'ClipboardList',
      allowedRoles: ['mechanic', 'chief_mechanic', 'admin'],
      loader: () => Promise.resolve({ default: () => null })
    },
    {
      key: 'analytics',
      title: 'Operational Analytics',
      route: '/analytics',
      icon: 'BarChart3',
      allowedRoles: ['chief_mechanic', 'admin'],
      loader: () => Promise.resolve({ default: () => null })
    }
  ];

  return {
    modules: initialModules,
    registerModule: (moduleConfig) => {
      const exists = get().modules.some((m) => m.key === moduleConfig.key);
      if (!exists) {
        set((state) => ({ modules: [...state.modules, moduleConfig] }));
      }
    },
    getAuthorizedModules: (role: UserRole) => {
      return get().modules.filter((m) => !m.allowedRoles || m.allowedRoles.includes(role));
    }
  };
});
