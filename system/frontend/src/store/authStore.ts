import { create } from 'zustand';
import api from '../utils/api';

export type UserRole = 'mechanic' | 'chief_mechanic' | 'warehouse_manager' | 'admin';

export interface User {
  id: string;
  name: string;
  role: UserRole;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (role: UserRole, name?: string) => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => {
  // Retrieve initial state from localStorage
  let user = null;
  try {
    const savedUser = localStorage.getItem('user');
    user = savedUser ? JSON.parse(savedUser) : null;
  } catch (e) {
    console.error('Failed to parse user from localStorage', e);
    localStorage.removeItem('user');
  }
  const savedToken = localStorage.getItem('token');

  return {
    user,
    token: savedToken || null,
    isAuthenticated: !!savedToken,
    login: async (role: UserRole, name = 'Test User') => {
      const response = await api.post('/auth/login', { username: name, role });
      const { access_token, user: loggedUser } = response.data;

      localStorage.setItem('user', JSON.stringify(loggedUser));
      localStorage.setItem('token', access_token);

      set({ user: loggedUser, token: access_token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
