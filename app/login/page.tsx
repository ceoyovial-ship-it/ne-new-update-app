'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Loader2, Lock, Mail, ShieldCheck, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ThemeToggle } from '@/components/theme-toggle';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from 'next-themes';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signIn, user } = useAuth();
  const { theme, setTheme } = useTheme();
  const router = useRouter();
  const emailRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    try {
      const saved = window.localStorage.getItem('pace:rememberMe');
      setRememberMe(saved !== 'false');
    } catch {
      setRememberMe(true);
    }
  }, []);

  useEffect(() => {
    if (user) {
      const routes: Record<string, string> = {
        super_admin: '/admin/dashboard',
        admin: '/admin/dashboard',
        principal: '/admin/dashboard',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent',
        accountant: '/admin/dashboard',
        receptionist: '/admin/dashboard',
      };
      router.replace(routes[user.profile.role] || '/');
    }
  }, [user, router]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const trimmedEmail = email.trim();
    if (!trimmedEmail) {
      setError('Email is required.');
      return false;
    }
    if (!EMAIL_REGEX.test(trimmedEmail)) {
      setError('Please enter a valid email address.');
      return false;
    }
    if (!password) {
      setError('Password is required.');
      return false;
    }
    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!validate()) return;
    if (loading) return;
    setLoading(true);

    try {
      const { error: signInError } = await signIn(email, password, rememberMe);

      if (signInError) {
        const message = signInError.message.toLowerCase();
        let friendly = 'Unable to sign in. Please check your credentials and try again.';

        if (message.includes('invalid login credentials')) {
          friendly = 'Incorrect email or password. Please try again.';
        } else if (message.includes('email not confirmed')) {
          friendly = 'Your email has not been confirmed. Please contact your administrator.';
        } else if (message.includes('row level security') || message.includes('rls')) {
          friendly = 'Access denied by security policy. Please contact your administrator.';
        } else if (message.includes('timeout') || message.includes('timed out')) {
          friendly = 'Request timed out. Please check your connection and try again.';
        } else if (message.includes('rate limit') || message.includes('too many')) {
          friendly = 'Too many attempts. Please wait a moment and try again.';
        } else if (
          message.includes('network') ||
          message.includes('failed to fetch') ||
          message.includes('fetch') ||
          message.includes('offline')
        ) {
          friendly = 'Network error. Please check your connection and try again.';
        } else if (signInError.message) {
          friendly = signInError.message;
        }

        setError(friendly);
        toast.error('Sign in failed');
        setLoading(false);
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
      toast.error('Sign in failed');
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-gradient-to-br from-sky-50 via-white to-blue-50 dark:from-slate-900 dark:via-slate-950 dark:to-slate-900">
      <div className="absolute right-4 top-4 z-10">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-md px-4">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg">
            <ShieldCheck className="h-8 w-8" />
          </div>
          <h1 className="font-serif text-3xl font-bold tracking-tight text-foreground">
            PACE NR Olympiad
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Smart School ERP System
          </p>
        </div>

        <Card className="border-border/40 shadow-xl">
          <CardHeader>
            <CardTitle className="text-2xl">Welcome Back</CardTitle>
            <CardDescription>Sign in to access your dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-sm text-destructive">
                  <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    ref={emailRef}
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    className="pl-10"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    autoComplete="email"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Enter your password"
                    className="pl-10 pr-10"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-muted-foreground">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-input accent-primary"
                  />
                  Remember me
                </label>
              </div>

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="mt-6 text-center text-xs text-muted-foreground">
          PACE NR Olympiad School ERP &copy; {new Date().getFullYear()}
        </p>
      </div>
    </div>
  );
}
