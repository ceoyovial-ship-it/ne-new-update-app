'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogFooter,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Loader2, LogOut, ShieldCheck } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface LogoutDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  trigger?: React.ReactNode;
}

export function LogoutDialog({ open, onOpenChange }: LogoutDialogProps) {
  const { signOut } = useAuth();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    if (loading) return;
    setLoading(true);
    try {
      await signOut();
      toast.success('Signed out successfully');
      onOpenChange(false);
    } catch {
      toast.error('Failed to sign out');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="max-w-sm">
        <AlertDialogHeader>
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto mb-2 w-14 h-14 rounded-full bg-red-500/10 flex items-center justify-center"
          >
            <LogOut className="h-7 w-7 text-red-600 dark:text-red-400" />
          </motion.div>
          <AlertDialogTitle className="text-center text-xl">Sign out?</AlertDialogTitle>
          <AlertDialogDescription className="text-center">
            You&apos;ll need to sign in again to access your portal. Your session will be cleared securely.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <AlertDialogAction
            onClick={handleLogout}
            disabled={loading}
            className="w-full bg-red-600 hover:bg-red-700 text-white focus-visible:ring-red-600"
          >
            {loading ? (
              <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Signing out...</>
            ) : (
              <><LogOut className="h-4 w-4 mr-2" /> Logout</>
            )}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full mt-0" disabled={loading}>
            Cancel
          </AlertDialogCancel>
        </AlertDialogFooter>
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground mt-1">
          <ShieldCheck className="h-3 w-3" aria-hidden="true" />
          <span>Session cleared securely</span>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
