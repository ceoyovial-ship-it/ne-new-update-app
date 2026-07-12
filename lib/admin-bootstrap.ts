'use client';

import { supabase } from './supabase';
import type { Profile, UserRole } from './supabase';

const ADMIN_EMAIL = 'admin@pacenr.com';
const ADMIN_PASSWORD = 'admin123';
const BOOTSTRAP_KEY = 'pace:adminBootstrap';
const FALLBACK_KEY = 'pace:devFallback';

export interface FallbackUser {
  id: string;
  email: string;
  profile: Profile;
  permissions: string[];
  isFallback: true;
}

function isDevelopment(): boolean {
  if (typeof window === 'undefined') return false;
  return (
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname.includes('dev')
  );
}

/**
 * Calls the seed-admin edge function to ensure the default admin
 * account exists in Supabase. Runs once per browser session.
 */
export async function ensureAdminAccount(): Promise<void> {
  if (typeof window === 'undefined') return;

  try {
    const done = sessionStorage.getItem(BOOTSTRAP_KEY);
    if (done) return;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) return;

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    const res = await fetch(`${supabaseUrl}/functions/v1/seed-admin`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${anonKey}`,
        'Content-Type': 'application/json',
      },
      body: '{}',
      signal: controller.signal,
    });
    clearTimeout(timeout);

    if (res.ok) {
      sessionStorage.setItem(BOOTSTRAP_KEY, '1');
    }
  } catch {
    // Network error — Supabase may be unreachable; dev fallback handles this.
  }
}

/**
 * Development fallback: when Supabase is unreachable and we're in dev,
 * allow login with admin@pacenr.com / admin123 as a mock session.
 */
export async function tryDevFallback(
  email: string,
  password: string
): Promise<FallbackUser | null> {
  if (!isDevelopment()) return null;
  if (email.trim().toLowerCase() !== ADMIN_EMAIL || password !== ADMIN_PASSWORD) return null;

  const fallbackProfile: Profile = {
    id: 'dev-admin-0000-0000-0000-000000000001',
    role: 'super_admin' as UserRole,
    first_name: 'System',
    last_name: 'Administrator',
    email: ADMIN_EMAIL,
    is_active: true,
    must_change_password: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  };

  const user: FallbackUser = {
    id: fallbackProfile.id,
    email: ADMIN_EMAIL,
    profile: fallbackProfile,
    permissions: [],
    isFallback: true,
  };

  sessionStorage.setItem(FALLBACK_KEY, JSON.stringify(user));
  return user;
}

export function getDevFallback(): FallbackUser | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(FALLBACK_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as FallbackUser;
  } catch {
    return null;
  }
}

export function clearDevFallback(): void {
  if (typeof window === 'undefined') return;
  sessionStorage.removeItem(FALLBACK_KEY);
}
