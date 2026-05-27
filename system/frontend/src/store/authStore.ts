import { create } from 'zustand';

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
  login: (role: UserRole, name?: string) => void;
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
    login: (role: UserRole, name = 'Test User') => {
      const user: User = { id: `usr-${role}`, name, role };
      const token = `mock-jwt-token-for-${role}`;

      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);

      set({ user, token, isAuthenticated: true });
    },
    logout: () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      set({ user: null, token: null, isAuthenticated: false });
    },
  };
});
