'use client';

import { useState, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Lock, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2, Check, X, KeyRound } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { toast } from 'sonner';

interface ChangePasswordProps {
  /**
   * When true (first-login gate), the current-password field is hidden
   * because the user is authenticating with a temporary password that
   * Supabase has already accepted as the active session.
   */
  hideCurrent?: boolean;
  /** Called after a successful password change. */
  onSuccess?: () => void;
  /** Compact layout for embedding inside profile cards. */
  compact?: boolean;
}

interface StrengthResult {
  score: number;
  label: string;
  color: string;
  textColor: string;
  checks: { label: string; passed: boolean }[];
}

function evaluatePassword(password: string): StrengthResult {
  const checks = [
    { label: 'At least 8 characters', passed: password.length >= 8 },
    { label: 'An uppercase letter', passed: /[A-Z]/.test(password) },
    { label: 'A lowercase letter', passed: /[a-z]/.test(password) },
    { label: 'A number', passed: /[0-9]/.test(password) },
    { label: 'A special character', passed: /[^A-Za-z0-9]/.test(password) },
  ];

  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  score = Math.min(score, 4);

  const labels = ['Very weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const colors = ['bg-destructive', 'bg-orange-500', 'bg-amber-500', 'bg-blue-500', 'bg-green-500'];
  const textColors = [
    'text-destructive',
    'text-orange-600 dark:text-orange-400',
    'text-amber-600 dark:text-amber-400',
    'text-blue-600 dark:text-blue-400',
    'text-green-600 dark:text-green-400',
  ];
  const index = password ? Math.max(1, score) : 0;

  return {
    score: password ? score : 0,
    label: password ? labels[Math.max(0, index)] : '',
    color: colors[Math.max(0, index)],
    textColor: textColors[Math.max(0, index)],
    checks,
  };
}

export function ChangePassword({ hideCurrent = false, onSuccess, compact = false }: ChangePasswordProps) {
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ current?: string; new?: string; confirm?: string }>({});
  const { updatePassword, clearMustChangePassword } = useAuth();
  const newRef = useRef<HTMLInputElement>(null);

  const strength = useMemo(() => evaluatePassword(newPassword), [newPassword]);

  const validate = (): boolean => {
    const errors: { current?: string; new?: string; confirm?: string } = {};

    if (!hideCurrent && !currentPassword) {
      errors.current = 'Current password is required.';
    }

    if (!newPassword) {
      errors.new = 'New password is required.';
    } else if (newPassword.length < 8) {
      errors.new = 'Password must be at least 8 characters.';
    } else if (strength.score < 2) {
      errors.new = 'Please choose a stronger password.';
    } else if (!hideCurrent && newPassword === currentPassword) {
      errors.new = 'New password must be different from the current one.';
    }

    if (!confirmPassword) {
      errors.confirm = 'Please confirm your new password.';
    } else if (newPassword !== confirmPassword) {
      errors.confirm = 'Passwords do not match.';
    }

    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;
    if (loading) return;
    setLoading(true);

    try {
      const { error: updateError } = await updatePassword(newPassword);

      if (updateError) {
        const message = updateError.message.toLowerCase();
        let friendly = 'Could not update your password. Please try again.';
        if (message.includes('same') || message.includes('weak')) {
          friendly = 'Please choose a different, stronger password.';
        } else if (
          message.includes('network') ||
          message.includes('failed to fetch') ||
          message.includes('fetch')
        ) {
          friendly = 'Network error. Please check your connection and try again.';
        }
        setError(friendly);
        toast.error('Password update failed');
        setLoading(false);
      } else {
        // Clear the first-login flag if this was a forced change.
        await clearMustChangePassword();
        toast.success('Password changed successfully');
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setLoading(false);
        onSuccess?.();
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  const fieldClass = (hasError?: string) =>
    `pl-10 pr-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary ${
      hasError ? 'border-destructive focus-visible:ring-destructive' : ''
    }`;

  return (
    <motion.form
      onSubmit={handleSubmit}
      className="space-y-5"
      noValidate
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {error && (
        <motion.div
          role="alert"
          className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: 'auto' }}
        >
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
          <p>{error}</p>
        </motion.div>
      )}

      {!hideCurrent && (
        <div className="space-y-2">
          <Label htmlFor="cp-current">Current password</Label>
          <div className="relative group">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
            <Input
              id="cp-current"
              type={showCurrent ? 'text' : 'password'}
              autoComplete="current-password"
              placeholder="Enter current password"
              value={currentPassword}
              onChange={(e) => {
                setCurrentPassword(e.target.value);
                if (fieldErrors.current) setFieldErrors((p) => ({ ...p, current: undefined }));
              }}
              className={fieldClass(fieldErrors.current)}
              aria-invalid={!!fieldErrors.current}
              aria-describedby={fieldErrors.current ? 'cp-current-error' : undefined}
              disabled={loading}
              required
            />
            <button type="button" onClick={() => setShowCurrent((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label={showCurrent ? 'Hide password' : 'Show password'} tabIndex={-1}>
              {showCurrent ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          </div>
          {fieldErrors.current && (
            <p id="cp-current-error" className="text-xs text-destructive flex items-center gap-1">
              <AlertCircle className="h-3 w-3" aria-hidden="true" />
              {fieldErrors.current}
            </p>
          )}
        </div>
      )}

      <div className="space-y-2">
        <Label htmlFor="cp-new">New password</Label>
        <div className="relative group">
          <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
          <Input
            ref={newRef}
            id="cp-new"
            type={showNew ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => {
              setNewPassword(e.target.value);
              if (fieldErrors.new) setFieldErrors((p) => ({ ...p, new: undefined }));
            }}
            className={fieldClass(fieldErrors.new)}
            aria-invalid={!!fieldErrors.new}
            aria-describedby={fieldErrors.new ? 'cp-new-error' : 'cp-strength'}
            disabled={loading}
            required
          />
          <button type="button" onClick={() => setShowNew((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label={showNew ? 'Hide password' : 'Show password'} tabIndex={-1}>
            {showNew ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.new && (
          <p id="cp-new-error" className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {fieldErrors.new}
          </p>
        )}

        {newPassword && (
          <div id="cp-strength" className="space-y-2 pt-1">
            <div className="flex items-center gap-3">
              <Progress value={(strength.score / 4) * 100} className={`h-2 flex-1 ${strength.color}`} />
              <span className={`text-xs font-medium w-20 text-right ${strength.textColor}`}>{strength.label}</span>
            </div>
            {!compact && (
              <ul className="grid grid-cols-1 gap-1">
                {strength.checks.map((check) => (
                  <li key={check.label} className={`flex items-center gap-1.5 text-xs ${check.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}>
                    {check.passed ? <Check className="h-3 w-3 flex-shrink-0" aria-hidden="true" /> : <X className="h-3 w-3 flex-shrink-0" aria-hidden="true" />}
                    {check.label}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="cp-confirm">Confirm new password</Label>
        <div className="relative group">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors" aria-hidden="true" />
          <Input
            id="cp-confirm"
            type={showConfirm ? 'text' : 'password'}
            autoComplete="new-password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => {
              setConfirmPassword(e.target.value);
              if (fieldErrors.confirm) setFieldErrors((p) => ({ ...p, confirm: undefined }));
            }}
            className={fieldClass(fieldErrors.confirm)}
            aria-invalid={!!fieldErrors.confirm}
            aria-describedby={fieldErrors.confirm ? 'cp-confirm-error' : undefined}
            disabled={loading}
            required
          />
          <button type="button" onClick={() => setShowConfirm((p) => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded" aria-label={showConfirm ? 'Hide password' : 'Show password'} tabIndex={-1}>
            {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        {fieldErrors.confirm && (
          <p id="cp-confirm-error" className="text-xs text-destructive flex items-center gap-1">
            <AlertCircle className="h-3 w-3" aria-hidden="true" />
            {fieldErrors.confirm}
          </p>
        )}
      </div>

      <Button
        type="submit"
        className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 h-11 text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
        disabled={loading}
        aria-busy={loading}
      >
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
            Updating password...
          </>
        ) : (
          <>
            <CheckCircle2 className="mr-2 h-4 w-4" aria-hidden="true" />
            {hideCurrent ? 'Set new password' : 'Update password'}
          </>
        )}
      </Button>
    </motion.form>
  );
}
