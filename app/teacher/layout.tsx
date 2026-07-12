'use client';

import { useRequireAuth } from '@/lib/auth-context';
import { Sidebar } from '@/components/layout/sidebar';

export default function TeacherLayout({ children }: { children: React.ReactNode }) {
  const { user, loading } = useRequireAuth(['teacher']);

  if (loading || !user) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Sidebar role="teacher" />
      <div className="lg:pl-64">
        <main className="min-h-screen p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
