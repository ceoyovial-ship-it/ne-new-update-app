'use client';

import { useState, useRef, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { useTheme } from 'next-themes';
import { useCountUp } from '@/hooks/use-count-up';
import { GraduationCap, Lock, Mail, Eye, EyeOff, Loader as Loader2, CircleAlert as AlertCircle, Sun, Moon, ShieldCheck, Users, Presentation, UsersRound, ChartBar as BarChart3, DollarSign, CalendarCheck, Award } from 'lucide-react';
import { toast } from 'sonner';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

interface Feature {
  icon: typeof Users;
  label: string;
}

const FEATURES: Feature[] = [
  { icon: Users, label: 'Student Management' },
  { icon: Presentation, label: 'Teacher Portal' },
  { icon: UsersRound, label: 'Parent Dashboard' },
  { icon: BarChart3, label: 'Analytics & Reports' },
  { icon: DollarSign, label: 'Fee Management' },
  { icon: CalendarCheck, label: 'Attendance Tracking' },
  { icon: Award, label: 'Examination System' },
];

interface Stat {
  label: string;
  value: number;
  suffix: string;
}

const STATS: Stat[] = [
  { label: 'Students', value: 2500, suffix: '+' },
  { label: 'Teachers', value: 150, suffix: '+' },
  { label: 'Classes', value: 75, suffix: '+' },
  { label: 'Years', value: 15, suffix: '+' },
];

function StatCard({ stat, index }: { stat: Stat; index: number }) {
  const { value, ref } = useCountUp({ end: stat.value, duration: 1800 + index * 200 });
  return (
    <div
      ref={ref}
      className="group relative bg-white/10 backdrop-blur-md rounded-xl p-4 text-center ring-1 ring-white/15 transition-all duration-300 hover:scale-[1.06] hover:bg-white/15 hover:ring-amber-400/40 hover:-translate-y-1 cursor-default"
      style={{ animationDelay: `${index * 80}ms` }}
    >
      <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-amber-400/0 to-amber-400/0 group-hover:from-amber-400/10 group-hover:to-transparent transition-all duration-300" />
      <p className="text-2xl font-bold text-white tabular-nums">
        {Math.round(value).toLocaleString()}
        {stat.suffix}
      </p>
      <p className="text-sm text-blue-200">{stat.label}</p>
    </div>
  );
}

function FloatingParticles() {
  const particles = useMemo(
    () =>
      Array.from({ length: 16 }).map((_, i) => ({
        id: i,
        size: 3 + Math.random() * 7,
        left: Math.random() * 100,
        delay: Math.random() * 12,
        duration: 14 + Math.random() * 12,
      })),
    []
  );

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {particles.map((p) => (
        <span
          key={p.id}
          className="absolute bottom-0 rounded-full bg-amber-300/40 animate-float-particle"
          style={{
            width: `${p.size}px`,
            height: `${p.size}px`,
            left: `${p.left}%`,
            animationDelay: `${p.delay}s`,
            animationDuration: `${p.duration}s`,
          }}
        />
      ))}
    </div>
  );
}

function AnimatedWaves() {
  return (
    <div className="absolute bottom-0 left-0 right-0 h-48 overflow-hidden pointer-events-none" aria-hidden="true">
      <svg
        className="absolute bottom-0 w-[200%] h-full animate-wave opacity-20"
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,100 C150,160 350,40 600,100 C850,160 1050,40 1200,100 L1200,200 L0,200 Z"
          fill="url(#wave-grad)"
        />
        <defs>
          <linearGradient id="wave-grad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fbbf24" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#fbbf24" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
      <svg
        className="absolute bottom-0 w-[200%] h-full animate-wave opacity-15"
        style={{ animationDuration: '24s' }}
        viewBox="0 0 1200 200"
        preserveAspectRatio="none"
        fill="none"
      >
        <path
          d="M0,120 C200,60 400,180 600,120 C800,60 1000,180 1200,120 L1200,200 L0,200 Z"
          fill="url(#wave-grad-2)"
        />
        <defs>
          <linearGradient id="wave-grad-2" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#60a5fa" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#60a5fa" stopOpacity="0" />
          </linearGradient>
        </defs>
      </svg>
    </div>
  );
}

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({});
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
        super_admin: '/admin',
        admin: '/admin',
        principal: '/admin',
        teacher: '/teacher',
        student: '/student',
        parent: '/parent',
        accountant: '/admin',
        receptionist: '/admin',
      };
      router.replace(routes[user.profile.role] || '/');
    }
  }, [user, router]);

  useEffect(() => {
    emailRef.current?.focus();
  }, []);

  const validate = (): boolean => {
    const errors: { email?: string; password?: string } = {};
    const trimmedEmail = email.trim();

    if (!trimmedEmail) {
      errors.email = 'Email is required.';
    } else if (!EMAIL_REGEX.test(trimmedEmail)) {
      errors.email = 'Please enter a valid email address.';
    }

    if (!password) {
      errors.password = 'Password is required.';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters.';
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
      const { error: signInError } = await signIn(email, password, rememberMe);

      if (signInError) {
        const message = signInError.message.toLowerCase();
        let friendly = 'Unable to sign in. Please check your credentials and try again.';

        if (message.includes('invalid login credentials')) {
          friendly = 'Incorrect email or password. Please try again.';
        } else if (message.includes('email not confirmed')) {
          friendly = 'Your email has not been confirmed. Please contact your administrator.';
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
    <div className="min-h-screen flex flex-col lg:flex-row bg-background">
      {/* Left side - Branding */}
      <div className="hidden lg:flex lg:flex-1 bg-gradient-to-br from-blue-900 via-blue-800 to-blue-950 relative overflow-hidden">
        {/* Decorative glow blobs */}
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-500/10 blur-3xl animate-float-y" />
        <div className="absolute -bottom-32 -left-16 w-96 h-96 rounded-full bg-blue-500/10 blur-3xl animate-float-y" style={{ animationDelay: '2s' }} />

        {/* Particles + waves */}
        <FloatingParticles />
        <AnimatedWaves />

        <div className="flex flex-col items-center justify-center w-full px-12 relative z-10">
          {/* Logo with glow animation */}
          <div className="w-28 h-28 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-8 shadow-2xl ring-1 ring-white/20 animate-logo-glow">
            <GraduationCap className="h-16 w-16 text-amber-400" />
          </div>
          <h1
            className="text-5xl font-bold text-white mb-4 text-center tracking-tight animate-fade-in-up"
            style={{ fontFamily: 'Playfair Display, serif' }}
          >
            PACE NR Olympiad
          </h1>
          <p className="text-xl text-blue-100 max-w-md text-center leading-relaxed animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
            AI-Powered School ERP System for Excellence in Education
          </p>

          {/* Feature highlights */}
          <div className="mt-10 max-w-lg w-full">
            <p className="text-sm font-semibold text-amber-400 mb-4 text-center uppercase tracking-wider animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              Everything your school needs
            </p>
            <div className="grid grid-cols-2 gap-x-6 gap-y-3">
              {FEATURES.map((feature, idx) => (
                <div
                  key={feature.label}
                  className="flex items-center gap-3 animate-fade-in-up group transition-all duration-300 hover:translate-x-1"
                  style={{ animationDelay: `${0.3 + idx * 0.08}s` }}
                >
                  <div className="flex items-center justify-center w-9 h-9 rounded-lg bg-white/10 ring-1 ring-white/15 group-hover:bg-amber-400/20 group-hover:ring-amber-400/40 transition-all duration-300 flex-shrink-0">
                    <feature.icon className="h-5 w-5 text-amber-400" />
                  </div>
                  <span className="text-sm text-blue-100 group-hover:text-white transition-colors">
                    {feature.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Statistics with count-up */}
          <div className="mt-12 grid grid-cols-4 gap-4 max-w-xl w-full">
            {STATS.map((stat, idx) => (
              <StatCard key={stat.label} stat={stat} index={idx} />
            ))}
          </div>

          <div className="mt-12 flex items-center gap-2 text-sm text-blue-200/80 animate-fade-in-up" style={{ animationDelay: '0.9s' }}>
            <ShieldCheck className="h-4 w-4 text-amber-400" />
            <span>Secure access for students, parents, teachers &amp; staff</span>
          </div>
        </div>

        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-black/20 to-transparent" />
      </div>

      {/* Right side - Login form */}
      <div className="flex-1 flex items-center justify-center p-4 sm:p-8 bg-gradient-to-br from-background to-primary/5 relative">
        {/* Theme toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="absolute top-4 right-4 z-10 text-muted-foreground hover:text-foreground"
          aria-label="Toggle dark mode"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <div className="w-full max-w-md animate-fade-in">
          {/* Mobile branding */}
          <div className="lg:hidden text-center mb-8 animate-fade-in-up">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-blue-900 to-blue-700 mb-4 shadow-lg animate-logo-glow">
              <GraduationCap className="h-12 w-12 text-amber-400" />
            </div>
            <h1
              className="text-2xl font-bold text-primary"
              style={{ fontFamily: 'Playfair Display, serif' }}
            >
              PACE NR Olympiad
            </h1>
            <p className="text-muted-foreground mt-1">Smart School ERP</p>
          </div>

          <div className="rounded-2xl border bg-card shadow-xl p-6 sm:p-8 transition-all duration-300 hover:shadow-2xl">
            {/* Logo + welcome */}
            <div className="flex flex-col items-center text-center mb-6">
              <div className="hidden sm:flex w-14 h-14 rounded-xl bg-gradient-to-br from-blue-900 to-blue-700 items-center justify-center mb-3 shadow-md">
                <GraduationCap className="h-8 w-8 text-amber-400" />
              </div>
              <h2 className="text-2xl font-bold text-foreground tracking-tight">Welcome back</h2>
              <p className="text-sm text-muted-foreground mt-1">
                Sign in to access your portal
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {error && (
                <div
                  role="alert"
                  className="flex items-start gap-2 p-3 rounded-lg bg-destructive/10 text-destructive text-sm border border-destructive/20 animate-fade-in-up"
                >
                  <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" aria-hidden="true" />
                  <p>{error}</p>
                </div>
              )}

              {/* Email */}
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <div className="relative group">
                  <Mail
                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors"
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
                      if (fieldErrors.email) {
                        setFieldErrors((prev) => ({ ...prev, email: undefined }));
                      }
                    }}
                    onBlur={() => {
                      if (email && !EMAIL_REGEX.test(email.trim())) {
                        setFieldErrors((prev) => ({
                          ...prev,
                          email: 'Please enter a valid email address.',
                        }));
                      }
                    }}
                    className={`pl-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary ${fieldErrors.email ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    aria-invalid={!!fieldErrors.email}
                    aria-describedby={fieldErrors.email ? 'email-error' : undefined}
                    disabled={loading}
                    required
                  />
                </div>
                {fieldErrors.email && (
                  <p id="email-error" className="text-xs text-destructive flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" aria-hidden="true" />
                    {fieldErrors.email}
                  </p>
                )}
              </div>

              {/* Password */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-medium text-primary hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring rounded"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative group">
                  <Lock
                    className="left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-focus-within:text-primary transition-colors absolute"
                    aria-hidden="true"
                  />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    autoComplete="current-password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (fieldErrors.password) {
                        setFieldErrors((prev) => ({ ...prev, password: undefined }));
                      }
                    }}
                    className={`pl-10 pr-10 transition-all duration-200 focus-visible:ring-2 focus-visible:ring-primary/40 focus-visible:border-primary ${fieldErrors.password ? 'border-destructive focus-visible:ring-destructive' : ''}`}
                    aria-invalid={!!fieldErrors.password}
                    aria-describedby={fieldErrors.password ? 'password-error' : undefined}
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
              </div>

              {/* Remember me */}
              <div className="flex items-center gap-2">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                  disabled={loading}
                />
                <Label htmlFor="remember" className="text-sm font-normal cursor-pointer select-none">
                  Remember me on this device
                </Label>
              </div>

              {/* Submit */}
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-blue-900 to-blue-700 hover:from-blue-800 hover:to-blue-600 dark:from-blue-700 dark:to-blue-600 h-11 text-base font-semibold shadow-md transition-all duration-200 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                disabled={loading}
                aria-busy={loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" aria-hidden="true" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </Button>
            </form>
          </div>

          <p className="text-xs text-muted-foreground text-center mt-6">
            &copy; {new Date().getFullYear()} PACE NR Olympiad ERP • Powered by Yovial Technologies
          </p>
        </div>
      </div>
    </div>
  );
}
