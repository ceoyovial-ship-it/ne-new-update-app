'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/lib/auth-context';
import { ChangePassword } from '@/components/auth/change-password';
import { GraduationCap, ShieldAlert, ArrowRight } from 'lucide-react';

export default function ForceChangePasswordPage() {
  const { user, loading, mustChangePassword, clearMustChangePassword } = useAuth();
  const router = useRouter();

  // If somehow the flag is already clear and the user is authed, send them on.
  useEffect(() => {
    if (!loading && !mustChangePassword && user) {
      const routes: Record<string, string> = {
        admin: '/admin',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent',
      };
      router.replace(routes[user.profile.role] || '/');
    }
  }, [loading, mustChangePassword, user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 flex items-center justify-center animate-pulse">
            <GraduationCap className="h-7 w-7 text-amber-400" />
          </div>
          <p className="text-muted-foreground text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  const handleSuccess = async () => {
    await clearMustChangePassword();
    if (user) {
      const routes: Record<string, string> = {
        admin: '/admin',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent',
      };
      router.replace(routes[user.profile.role] || '/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4 relative">
      <div className="w-full max-w-md animate-fade-in">
        {/* Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 mb-4 shadow-lg">
            <GraduationCap className="h-10 w-10 text-amber-400" />
          </div>
          <h1
            className="text-2xl font-bold text-primary"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            PACE NR Olympiad
          </h1>
          <p className="text-muted-foreground mt-1">Smart School ERP</p>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-2xl border bg-card shadow-xl p-6 sm:p-8"
        >
          {/* Alert banner */}
          <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-6">
            <ShieldAlert className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" aria-hidden="true" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">Password change required</p>
              <p className="text-xs text-amber-700/80 dark:text-amber-400/70 mt-0.5">
                For your security, please set a new password before accessing your dashboard.
              </p>
            </div>
          </div>

          <h2 className="text-xl font-bold text-foreground tracking-tight mb-1">Set your new password</h2>
          <p className="text-sm text-muted-foreground mb-6">
            Welcome, {user?.profile.first_name}. Choose a strong password you&apos;ll remember.
          </p>

          <ChangePassword hideCurrent onSuccess={handleSuccess} />

          <div className="mt-5 flex items-center gap-2 text-xs text-muted-foreground">
            <ArrowRight className="h-3.5 w-3.5" aria-hidden="true" />
            <span>You&apos;ll be taken to your dashboard after updating.</span>
          </div>
        </motion.div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          &copy; {new Date().getFullYear()} PACE NR Olympiad ERP • Powered by Yovial Technologies
        </p>
      </div>
    </div>
  );
}
