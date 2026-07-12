'use client';

import { useState, useMemo, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import {
  GraduationCap,
  Lock,
  Eye,
  EyeOff,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
  Check,
  X,
} from 'lucide-react';
import { toast } from 'sonner';

interface StrengthResult {
  score: number; // 0-4
  label: string;
  color: string;
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

  const passedCount = checks.filter((c) => c.passed).length;
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
    checks,
  };
}

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ password?: string; confirm?: string }>({});
  const [success, setSuccess] = useState(false);
  const [verifying, setVerifying] = useState(true);
  const { updatePassword } = useAuth();
  const router = useRouter();

  const strength = useMemo(() => evaluatePassword(password), [password]);

  // Supabase delivers the recovery token in the URL hash. Resolve it into a
  // session so updateUser() can set the new password.
  useEffect(() => {
    (async () => {
      try {
        const { data, error: hashError } = await supabase.auth.getSession();
        if (hashError || !data.session) {
          // No session from hash yet; try to detect an error fragment.
          const hash = typeof window !== 'undefined' ? window.location.hash : '';
          if (hash.includes('error')) {
            setError('This password reset link is invalid or has expired. Please request a new one.');
          }
        }
      } catch {
        // ignore - user can still attempt the update
      } finally {
        setVerifying(false);
      }
    })();
  }, []);

  const validate = (): boolean => {
    const errors: { password?: string; confirm?: string } = {};

    if (!password) {
      errors.password = 'Please enter a new password.';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters.';
    } else if (strength.score < 2) {
      errors.password = 'Please choose a stronger password.';
    }

    if (!confirmPassword) {
      errors.confirm = 'Please confirm your password.';
    } else if (password !== confirmPassword) {
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
      const { error: updateError } = await updatePassword(password);

      if (updateError) {
        const message = updateError.message.toLowerCase();
        let friendly = 'Could not update your password. Please try again.';

        if (message.includes('session') || message.includes('not found') || message.includes('expired')) {
          friendly = 'Your reset session has expired. Please request a new reset link.';
        } else if (message.includes('same as') || message.includes('weak')) {
          friendly = 'Please choose a different, stronger password.';
        } else if (
          message.includes('network') ||
          message.includes('failed to fetch') ||
          message.includes('fetch') ||
          message.includes('offline')
        ) {
          friendly = 'Network error. Please check your connection and try again.';
        }

        setError(friendly);
        toast.error('Password update failed');
        setLoading(false);
      } else {
        setSuccess(true);
        toast.success('Password updated successfully');
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

  if (verifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-primary" />
          <p className="text-muted-foreground">Verifying reset link...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-primary/5 p-4 relative">
      <div className="w-full max-w-md animate-in">
        {/* Mobile logo */}
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

        <div className="rounded-2xl border bg-card shadow-xl p-6 sm:p-8">
          {!success ? (
            <>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Set a new password</h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Choose a strong password for your account. You&apos;ll use it to sign in next time.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5" noValidate>
                {error && (
                  <div
                    role="alert"
                    className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-in"
                  >
                    <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                    <p>{error}</p>
                  </div>
                )}

                {/* New password */}
                <div className="space-y-2">
                  <Label htmlFor="password">New password</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="password"
                      name="password"
                      type={showPassword ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Enter new password"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value);
                        if (fieldErrors.password) {
                          setFieldErrors((prev) => ({ ...prev, password: undefined }));
                        }
                      }}
                      className={`pl-10 pr-10 ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      aria-invalid={!!fieldErrors.password}
                      aria-describedby={fieldErrors.password ? 'password-error' : 'strength-meter'}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      aria-label={showPassword ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.password && (
                    <p id="password-error" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {fieldErrors.password}
                    </p>
                  )}

                  {/* Strength indicator */}
                  {password && (
                    <div id="strength-meter" className="space-y-2 pt-1">
                      <div className="flex items-center justify-between">
                        <Progress value={(strength.score / 4) * 100} className={`h-2 ${strength.color}`} />
                        <span className={`text-xs font-medium ml-3 w-20 text-right ${strength.score >= 4 ? 'text-green-600 dark:text-green-400' : strength.score >= 3 ? 'text-blue-600 dark:text-blue-400' : strength.score >= 2 ? 'text-amber-600 dark:text-amber-400' : 'text-orange-600 dark:text-orange-400'}`}>
                          {strength.label}
                        </span>
                      </div>
                      <ul className="grid grid-cols-1 gap-1">
                        {strength.checks.map((check) => (
                          <li
                            key={check.label}
                            className={`flex items-center gap-1.5 text-xs ${check.passed ? 'text-green-600 dark:text-green-400' : 'text-muted-foreground'}`}
                          >
                            {check.passed ? (
                              <Check className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                            ) : (
                              <X className="h-3 w-3 flex-shrink-0" aria-hidden="true" />
                            )}
                            {check.label}
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>

                {/* Confirm password */}
                <div className="space-y-2">
                  <Label htmlFor="confirm">Confirm new password</Label>
                  <div className="relative">
                    <Lock
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      id="confirm"
                      name="confirm"
                      type={showConfirm ? 'text' : 'password'}
                      autoComplete="new-password"
                      placeholder="Re-enter new password"
                      value={confirmPassword}
                      onChange={(e) => {
                        setConfirmPassword(e.target.value);
                        if (fieldErrors.confirm) {
                          setFieldErrors((prev) => ({ ...prev, confirm: undefined }));
                        }
                      }}
                      className={`pl-10 pr-10 ${fieldErrors.confirm ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      aria-invalid={!!fieldErrors.confirm}
                      aria-describedby={fieldErrors.confirm ? 'confirm-error' : undefined}
                      disabled={loading}
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                      aria-label={showConfirm ? 'Hide password' : 'Show password'}
                      tabIndex={-1}
                    >
                      {showConfirm ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                  {fieldErrors.confirm && (
                    <p id="confirm-error" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {fieldErrors.confirm}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 h-11 text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg"
                  disabled={loading}
                  aria-busy={loading}
                >
                  {loading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                      Updating password...
                    </>
                  ) : (
                    'Update password'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-5">
                <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Password updated</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
                Your password has been changed successfully. You can now sign in with your new password.
              </p>

              <div className="mt-8">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 h-11 font-semibold shadow-md"
                >
                  Continue to sign in
                </Button>
              </div>
            </div>
          )}
        </div>

        {!success && (
          <div className="mt-6 text-center">
            <Link
              href="/login"
              className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to sign in
            </Link>
          </div>
        )}

        <p className="text-xs text-muted-foreground text-center mt-6">
          &copy; {new Date().getFullYear()} PACE NR Olympiad School. All rights reserved.
        </p>
      </div>
    </div>
  );
}
