import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/stores/auth';

export function withAdminAuth<T extends Record<string, any>>(Wrapped: React.ComponentType<T>) {
  const Guard: React.FC<T> = (props) => {
    const router = useRouter();
    const { isAuthenticated, user, hasHydrated } = useAuthStore();
    const redirected = useRef(false);

    useEffect(() => {
      if (!hasHydrated) return;
      if (redirected.current) return;
      const ok = isAuthenticated && user?.role === 'ADMIN';
      if (!ok) {
        redirected.current = true;
        const redirect = typeof window !== 'undefined' ? window.location.pathname : '/admin';
        router.replace(`/login?redirect=${encodeURIComponent(redirect)}`);
      }
    }, [hasHydrated, isAuthenticated, user, router]);

    if (!hasHydrated) {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    if (!(isAuthenticated && user?.role === 'ADMIN')) return null;
    return <Wrapped {...(props as T)} />;
  };

  Guard.displayName = `withAdminAuth(${Wrapped.displayName || Wrapped.name})`;
  return Guard;
}
