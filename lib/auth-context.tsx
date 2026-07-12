'use client';

import { createContext, useContext, useEffect, useState, ReactNode, useCallback } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase, Profile, Student, Teacher, Parent, setRememberMe, Permission } from './supabase';
import { useRouter, usePathname } from 'next/navigation';
import { getDashboardRoute, isAdminLevel as isAdminLevelUtil } from './permissions';
import { logAudit } from './audit';
import { ensureAdminAccount, tryDevFallback, getDevFallback, clearDevFallback, type FallbackUser } from './admin-bootstrap';

interface AuthUser {
  user: User | FallbackUser;
  profile: Profile;
  student?: Student;
  teacher?: Teacher;
  parent?: Parent;
  permissions: string[];
  isFallback?: boolean;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  mustChangePassword: boolean;
  signIn: (email: string, password: string, rememberMe?: boolean) => Promise<{ error: Error | null }>;
  signUp: (email: string, password: string, profile: Partial<Profile>) => Promise<{ error: Error | null }>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  resetPassword: (email: string) => Promise<{ error: Error | null }>;
  updatePassword: (password: string) => Promise<{ error: Error | null }>;
  clearMustChangePassword: () => Promise<void>;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);



export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [mustChangePassword, setMustChangePassword] = useState(false);
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

    let student = null;
    let teacher = null;
    let parentData = null;
    let permissionsList: string[] = [];

    // Fetch permissions for the user's role
    const { data: roleRow } = await supabase
      .from('roles')
      .select('id')
      .eq('name', profile.role)
      .maybeSingle();

    if (roleRow) {
      const { data: permData } = await supabase
        .from('role_permissions')
        .select('permission:permissions(name)')
        .eq('role_id', roleRow.id);

      if (permData) {
        permissionsList = permData
          .map((item: any) => item.permission?.name)
          .filter(Boolean) as string[];
      }
    }

    if (profile.role === 'student') {
      const { data } = await supabase
        .from('students')
        .select('*, class:classes(*), house:houses(*)')
        .eq('user_id', userId)
        .maybeSingle();
      student = data;
    } else if (profile.role === 'teacher') {
      const { data } = await supabase
        .from('teachers')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      teacher = data;
    } else if (profile.role === 'parent') {
      const { data } = await supabase
        .from('parents')
        .select('*')
        .eq('user_id', userId)
        .maybeSingle();
      parentData = data;
    }

    return {
      user: null as unknown as User,
      profile,
      student: student || undefined,
      teacher: teacher || undefined,
      parent: parentData || undefined,
      permissions: permissionsList,
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
          setMustChangePassword(Boolean(authUser.profile.must_change_password));
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

    // onAuthStateChange runs synchronously; async work must be deferred to
    // avoid deadlocking the auth event loop (see bolt-database skill).
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          const authUser = await fetchUserProfile(session.user.id);
          if (authUser) {
            authUser.user = session.user;
            setUser(authUser);
            setSession(session);
            const needsChange = Boolean(authUser.profile.must_change_password);
            setMustChangePassword(needsChange);

            // First-login gate: force password change before dashboard access.
            if (needsChange && pathname !== '/force-change-password') {
              router.push('/force-change-password');
            } else if (event === 'SIGNED_IN' && pathname === '/login' && !needsChange) {
              router.push(getDashboardRoute(authUser.profile.role));
            }
          }
        } else {
          setUser(null);
          setSession(null);
          setMustChangePassword(false);
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
      // Configure session persistence before the session is created so the
      // storage adapter picks up the right store.
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
      // Audit login success
      logAudit({ action: 'user.login', targetEmail: trimmedEmail });
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Sign in failed') };
    }
  };

  const signUp = async (email: string, password: string, profileData: Partial<Profile>) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error) return { error };

    if (data.user) {
      const { error: profileError } = await supabase.from('profiles').insert({
        id: data.user.id,
        email,
        role: profileData.role || 'student',
        first_name: profileData.first_name || '',
        last_name: profileData.last_name || '',
        phone: profileData.phone,
      });

      if (profileError) return { error: profileError };
    }

    return { error: null };
  };

  const signOut = async () => {
    if (fallbackUser) {
      clearDevFallback();
      setFallbackUser(null);
    }
    if (user?.profile) {
      logAudit({ action: 'user.logout', targetEmail: user.profile.email });
    }
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    router.push('/login');
  };

  const refreshProfile = async () => {
    if (session?.user) {
      const authUser = await fetchUserProfile(session.user.id);
      if (authUser) {
        authUser.user = session.user;
        setUser(authUser);
      }
    }
  };

  const resetPassword = async (email: string) => {
    try {
      const trimmedEmail = email.trim();
      const redirectTo = `${typeof window !== 'undefined' ? window.location.origin : ''}/reset-password`;
      const { error } = await supabase.auth.resetPasswordForEmail(trimmedEmail, {
        redirectTo,
      });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Password reset request failed') };
    }
  };

  const updatePassword = async (password: string) => {
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) {
        return { error: new Error(error.message) };
      }
      return { error: null };
    } catch (err: any) {
      return { error: new Error(err.message || 'Password update failed') };
    }
  };

  const clearMustChangePassword = async () => {
    if (!session?.user) return;
    try {
      await supabase
        .from('profiles')
        .update({ must_change_password: false })
        .eq('id', session.user.id);
      setMustChangePassword(false);
      const authUser = await fetchUserProfile(session.user.id);
      if (authUser) {
        authUser.user = session.user;
        setUser(authUser);
      }
    } catch (err) {
      console.error('Failed to clear must_change_password:', err);
    }
  };

  const hasPermission = (permission: string): boolean => {
    if (!user) return false;
    if (user.profile.role === 'super_admin') return true;
    return user.permissions.includes(permission);
  };

  const hasAnyPermission = (permissions: string[]): boolean => {
    if (!user) return false;
    if (user.profile.role === 'super_admin') return true;
    return permissions.some((p) => user.permissions.includes(p));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        session,
        loading,
        mustChangePassword,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        resetPassword,
        updatePassword,
        clearMustChangePassword,
        hasPermission,
        hasAnyPermission,
      }}
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
