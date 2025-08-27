import React, { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuthStore } from '@/lib/stores/auth';

export function withAdminAuth<T extends Record<string, any>>(
  WrappedComponent: React.ComponentType<T>
) {
  const AuthenticatedComponent = (props: T) => {
    const router = useRouter();
    const { isAuthenticated, user } = useAuthStore();

    useEffect(() => {
      if (!isAuthenticated || user?.role !== 'ADMIN') {
        router.push('/login');
      }
    }, [isAuthenticated, user, router]);

    if (!isAuthenticated || user?.role !== 'ADMIN') {
      return (
        <div className="flex min-h-screen items-center justify-center">
          <div className="text-center">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-2 text-gray-600">Loading...</p>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };

  AuthenticatedComponent.displayName = `withAdminAuth(${WrappedComponent.displayName || WrappedComponent.name})`;

  return AuthenticatedComponent;
}