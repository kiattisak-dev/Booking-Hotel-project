import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { AuthState, User } from '@/types';

export const useAuth = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      intendedPath: null,
      login: (user: User) => set({ user, isAuthenticated: true }),
      logout: () => set({ user: null, isAuthenticated: false, intendedPath: null }),
      setIntendedPath: (path: string) => set({ intendedPath: path }),
    }),
    {
      name: 'auth-store',
    }
  )
);