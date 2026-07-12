'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  GraduationCap,
  Mail,
  Loader2,
  ArrowLeft,
  AlertCircle,
  CheckCircle2,
} from 'lucide-react';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [fieldError, setFieldError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { resetPassword } = useAuth();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldError('');

    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setFieldError('Email is required.');
      return;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setFieldError('Please enter a valid email address.');
      return;
    }

    if (loading) return;
    setLoading(true);

    try {
      const { error: resetError } = await resetPassword(trimmedEmail);

      if (resetError) {
        const message = resetError.message.toLowerCase();
        let friendly = 'Could not send reset email. Please try again.';

        if (message.includes('rate limit') || message.includes('too many')) {
          friendly = 'Too many requests. Please wait a few minutes before trying again.';
        } else if (
          message.includes('network') ||
          message.includes('failed to fetch') ||
          message.includes('fetch') ||
          message.includes('offline')
        ) {
          friendly = 'Network error. Please check your connection and try again.';
        }

        setError(friendly);
        setLoading(false);
      } else {
        setSuccess(true);
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      setLoading(false);
    }
  };

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
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to sign in
                </Link>
                <h2 className="text-2xl font-bold text-foreground tracking-tight">Forgot password?</h2>
                <p className="text-sm text-muted-foreground mt-1.5 leading-relaxed">
                  Enter your registered email and we&apos;ll send you a secure link to reset your password.
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

                <div className="space-y-2">
                  <Label htmlFor="email">Email address</Label>
                  <div className="relative">
                    <Mail
                      className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
                      aria-hidden="true"
                    />
                    <Input
                      ref={emailRef}
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (fieldError) setFieldError('');
                      }}
                      onBlur={() => {
                        if (email && !EMAIL_REGEX.test(email.trim())) {
                          setFieldError('Please enter a valid email address.');
                        }
                      }}
                      className={`pl-10 ${fieldError ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                      aria-invalid={!!fieldError}
                      aria-describedby={fieldError ? 'email-error' : undefined}
                      disabled={loading}
                      required
                    />
                  </div>
                  {fieldError && (
                    <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" aria-hidden="true" />
                      {fieldError}
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
                      Sending reset link...
                    </>
                  ) : (
                    'Send reset link'
                  )}
                </Button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 animate-in">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-green-500/10 mb-5">
                <CheckCircle2 className="h-9 w-9 text-green-600 dark:text-green-400" aria-hidden="true" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Check your email</h2>
              <p className="text-sm text-muted-foreground mt-3 leading-relaxed max-w-sm mx-auto">
                We&apos;ve sent a password reset link to
              </p>
              <p className="text-sm font-semibold text-foreground mt-1 break-all">{email.trim()}</p>
              <p className="text-xs text-muted-foreground mt-4 leading-relaxed">
                The link will expire in 60 minutes. If you don&apos;t see the email, check your spam folder.
              </p>

              <div className="mt-8 space-y-3">
                <Button
                  onClick={() => router.push('/login')}
                  className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 h-11 font-semibold shadow-md"
                >
                  Back to sign in
                </Button>
                <button
                  type="button"
                  onClick={() => {
                    setSuccess(false);
                    setEmail('');
                  }}
                  className="text-sm text-muted-foreground hover:text-foreground transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                >
                  Use a different email
                </button>
              </div>
            </div>
          )}
        </div>

        <p className="text-xs text-muted-foreground text-center mt-6">
          &copy; {new Date().getFullYear()} PACE NR Olympiad School. All rights reserved.
        </p>
      </div>
    </div>
  );
}
