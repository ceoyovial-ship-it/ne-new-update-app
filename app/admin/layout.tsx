'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/layout/sidebar';
import { Loader as Loader2 } from 'lucide-react';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    } else if (!loading && user && !['super_admin', 'admin', 'principal', 'accountant', 'receptionist'].includes(user.profile.role)) {
      const routes: Record<string, string> = {
        teacher: '/teacher',
        student: '/student',
        parent: '/parent',
      };
      router.push(routes[user.profile.role] || '/');
    }
  }, [user, loading, router]);

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="text-muted-foreground">Loading admin portal...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex">
      <Sidebar portalType="admin" />
      <main className="flex-1 pt-16 lg:pt-0 min-h-screen overflow-auto">
        {children}
      </main>
    </div>
  );
}
