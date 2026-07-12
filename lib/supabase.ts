import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

const REMEMBER_KEY = 'pace:rememberMe';

type SessionStorageLike = Pick<globalThis.Storage, 'getItem' | 'setItem' | 'removeItem'>;

function readRememberMe(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    return window.localStorage.getItem(REMEMBER_KEY) !== 'false';
  } catch {
    return true;
  }
}

function activeStorage(): SessionStorageLike {
  if (typeof window === 'undefined') {
    const noop = () => null;
    return { getItem: noop, setItem: noop, removeItem: noop } as SessionStorageLike;
  }
  return readRememberMe() ? window.localStorage : window.sessionStorage;
}

export const rememberMeStorage = {
  getItem: (key: string) => activeStorage().getItem(key),
  setItem: (key: string, value: string) => activeStorage().setItem(key, value),
  removeItem: (key: string) => activeStorage().removeItem(key),
};

export function setRememberMe(enabled: boolean) {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(REMEMBER_KEY, String(enabled));
  } catch {}
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
    storage: rememberMeStorage,
    storageKey: 'pace-auth-session',
  },
});

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'principal'
  | 'teacher'
  | 'student'
  | 'parent'
  | 'accountant'
  | 'receptionist';

export interface Profile {
  id: string;
  role: UserRole;
  first_name: string;
  last_name: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
  pincode?: string;
  avatar_url?: string;
  date_of_birth?: string;
  gender?: string;
  is_active: boolean;
  must_change_password: boolean;
  created_at: string;
  updated_at: string;
  branch_id?: string;
  department?: string;
  last_login?: string;
}
