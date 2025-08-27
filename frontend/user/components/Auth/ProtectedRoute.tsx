import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { useAuth } from '@/store/useAuth';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const router = useRouter();
  const { isAuthenticated, setIntendedPath } = useAuth();

  useEffect(() => {
    if (!isAuthenticated) {
      setIntendedPath(router.asPath);
      router.push('/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return <div>กำลังตรวจสอบการเข้าสู่ระบบ...</div>;
  }

  return <>{children}</>;
}