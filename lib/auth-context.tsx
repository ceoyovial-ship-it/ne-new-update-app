'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, setRememberMe } from './supabase';
import { useRouter, usePathname } from 'next/navigation';
import { getDashboardRoute } from './permissions';
import { logAudit } from './audit';
import { ensureAdminAccount, tryDevFallback, getDevFallback, clearDevFallback, type FallbackUser } from './admin-bootstrap';

interface AuthUser {
  user: User | FallbackUser;
  profile: Profile;
  permissions: string[];
  isFallback?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [fallbackUser, setFallbackUser] = useState<FallbackUser | null>(null);
  const router = useRouter();
  const pathname = usePathname();

  const fetchUserProfile = useCallback(async (userId: string): Promise<AuthUser | null> => {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (error || !profile) {
      console.error('Profile fetch error:', error);
      return null;
    }

    return {
      user: null as unknown as User,
      profile,
      permissions: [],
    } as AuthUser;
  }, []);

  const getSession = useCallback(async () => {
    ensureAdminAccount();

    const existingFallback = getDevFallback();
    if (existingFallback) {
      setFallbackUser(existingFallback);
      setUser({
        user: existingFallback,
        profile: existingFallback.profile,
        permissions: existingFallback.permissions,
        isFallback: true,
      });
      setLoading(false);
      return;
    }

    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (session?.user) {
        const authUser = await fetchUserProfile(session.user.id);
        if (authUser) {
          authUser.user = session.user;
          setUser(authUser);
          setSession(session);
        }
      }
    } catch (error) {
      console.error('Session fetch error:', error);
    } finally {
      setLoading(false);
    }
  }, [fetchUserProfile]);

  useEffect(() => {
    getSession();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const authUser = await fetchUserProfile(session.user.id);
          if (authUser) {
            authUser.user = session.user;
            setUser(authUser);
            setSession(session);

            if (event === 'SIGNED_IN' && pathname === '/login') {
              router.push(getDashboardRoute(authUser.profile.role));
            }
          }
        } else {
          setUser(null);
          setSession(null);
          if (event === 'SIGNED_OUT') {
            router.push('/login');
          }
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, [getSession, fetchUserProfile, router, pathname]);

  const signIn = async (email: string, password: string, rememberMe = true) => {
    try {
      setRememberMe(rememberMe);

      const trimmedEmail = email.trim();
      const { error } = await supabase.auth.signInWithPassword({
        email: trimmedEmail,
        password,
      });

      if (error) {
        const fb = await tryDevFallback(email, password);
        if (fb) {
          setFallbackUser(fb);
          setUser({
            user: fb,
            profile: fb.profile,
            permissions: fb.permissions,
            isFallback: true,
          });
          return { error: null };
        }
        return { error: new Error(error.message) };
      }

      logAudit({ action: 'user.login', targetEmail: trimmedEmail });
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Sign in failed') };
    }
  };

  const signOut = async () => {
    if (fallbackUser) {
      clearDevFallback();
      setFallbackUser(null);
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/login');
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.profile.role === 'super_admin') return true;
    return user.permissions.includes(permission);
  };

  return (
    <AuthContext.Provider
      value={{ user, session, loading, signIn, signOut, hasPermission }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export function useRequireAuth(allowedRoles?: string[]) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/login');
      } else if (allowedRoles && !allowedRoles.includes(user.profile.role)) {
        router.push(getDashboardRoute(user.profile.role));
      }
    }
  }, [user, loading, router, allowedRoles, pathname]);

  return { user, loading };
}
