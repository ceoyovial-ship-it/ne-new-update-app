import { UserRole } from './supabase';

export const ROLE_DISPLAY_NAMES: Record<UserRole, string> = {
  super_admin: 'Super Admin',
  admin: 'Administrator',
  principal: 'Principal',
  teacher: 'Teacher',
  student: 'Student',
  parent: 'Parent',
  accountant: 'Accountant',
  receptionist: 'Receptionist',
};

export const ADMIN_LEVEL_ROLES: UserRole[] = ['super_admin', 'admin'];

export function isAdminLevel(role: string | undefined): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function isSuperAdmin(role: string | undefined): boolean {
  return role === 'super_admin';
}

export const DASHBOARD_ROUTES: Record<string, string> = {
  super_admin: '/admin/dashboard',
  admin: '/admin/dashboard',
  principal: '/admin/dashboard',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
  accountant: '/admin/dashboard',
  receptionist: '/admin/dashboard',
};

export function getDashboardRoute(role: string): string {
  return DASHBOARD_ROUTES[role] || '/';
}
