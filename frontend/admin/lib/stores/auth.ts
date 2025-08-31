import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { clearAuthCookies } from '@/lib/auth-cookies';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  hasHydrated: boolean;
  login: (user: User, token: string) => void;
  logout: () => void;
  setUser: (user: User) => void;
  setHasHydrated: (v: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      hasHydrated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true }),
      logout: () => {
        clearAuthCookies();
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user) => set({ user }),
      setHasHydrated: (v) => set({ hasHydrated: v }),
    }),
    {
      name: 'admin-auth',
      onRehydrateStorage: () => (state) => {
        state?.setHasHydrated(true);
      },
    }
  )
);
