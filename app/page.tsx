'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Loader2 } from 'lucide-react';
import { SplashScreen } from '@/components/splash/splash-screen';

const SPLASH_KEY = 'pace:splashSeen';

export default function Home() {
  const { user, loading, mustChangePassword } = useAuth();
  const router = useRouter();
  const [showSplash, setShowSplash] = useState(false);

  // Show splash only on the first app load in this browser session.
  useEffect(() => {
    try {
      const seen = sessionStorage.getItem(SPLASH_KEY);
      if (!seen) {
        setShowSplash(true);
        sessionStorage.setItem(SPLASH_KEY, '1');
      }
    } catch {
      // sessionStorage unavailable (private mode) - skip splash
    }
  }, []);

  // Route after auth resolves (or after splash finishes, whichever is later).
  useEffect(() => {
    if (showSplash || loading) return;

    if (user) {
      if (mustChangePassword) {
        router.replace('/force-change-password');
      } else {
        const routes: Record<string, string> = {
          admin: '/admin',
          teacher: '/teacher',
          student: '/student',
          parent: '/parent',
        };
        router.replace(routes[user.profile.role] || '/');
      }
    } else {
      router.replace('/login');
    }
  }, [user, loading, mustChangePassword, router, showSplash]);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} duration={6000} />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-primary/5 via-background to-accent/5">
      <div className="flex flex-col items-center gap-4">
        <Loader2 className="h-12 w-12 animate-spin text-primary" />
        <p className="text-muted-foreground">Loading PACE NR Olympiad...</p>
      </div>
    </div>
  );
}
