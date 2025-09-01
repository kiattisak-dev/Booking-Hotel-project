import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/useAuth';

type Props = { children: React.ReactNode };

export default function ProtectedRoute({ children }: Props) {
  const router = useRouter();
  const { isAuthenticated, setIntendedPath } = useAuth();
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => { setHydrated(true); }, []);

  useEffect(() => {
    if (!hydrated) return;
    if (!isAuthenticated) {
      setIntendedPath(router.asPath);
      router.replace('/login');
    }
  }, [hydrated, isAuthenticated, router, setIntendedPath]);

  if (!hydrated) {
    return (
      <div className="flex min-h-[50vh] items-center justify-center text-gray-500">
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) return null;
  return <>{children}</>;
}
