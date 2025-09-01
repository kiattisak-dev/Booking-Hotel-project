import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { AuthState, User } from '@/types';

export const useAuth = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,
      intendedPath: null,
      login: (user: User) => {
        if (typeof document !== 'undefined' && user.token) {
          const isProd = window.location.protocol === 'https:';
          document.cookie = `auth_token=${user.token}; path=/; ${isProd ? 'Secure; SameSite=None;' : ''}`;
          const role = user.role || 'USER';
          document.cookie = `auth_role=${role}; path=/; ${isProd ? 'Secure; SameSite=None;' : ''}`;
        }
        set({ user, isAuthenticated: true });
      },
      logout: () => {
        if (typeof document !== 'undefined') {
          // ลบคุกกี้
          document.cookie = 'auth_token=; Max-Age=0; path=/;';
          document.cookie = 'auth_role=; Max-Age=0; path=/;';
        }
        set({ user: null, isAuthenticated: false, intendedPath: null });
      },
      setIntendedPath: (path: string) => set({ intendedPath: path }),
    }),
    {
      name: 'auth-store',
    }
  )
);
