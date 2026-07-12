'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { getDashboardRoute } from '@/lib/permissions';

export type PermissionCheck = {
  allowed: boolean;
  loading: boolean;
};

export function useRequirePermission(
  permissions: string[],
  requireAll: boolean = false
): PermissionCheck {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [allowed, setAllowed] = useState(false);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/login');
      return;
    }

    if (user.profile.role === 'super_admin') {
      setAllowed(true);
      return;
    }

    const hasAll = permissions.every((p) => user.permissions.includes(p));
    const hasAny = permissions.some((p) => user.permissions.includes(p));
    const granted = requireAll ? hasAll : hasAny;

    if (!granted) {
      router.replace(getDashboardRoute(user.profile.role));
      return;
    }

    setAllowed(true);
  }, [user, loading, router, permissions, requireAll]);

  return { allowed, loading };
}
