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

export const ROLE_DESCRIPTIONS: Record<UserRole, string> = {
  super_admin: 'Full system access with no restrictions',
  admin: 'Full school management except super admin settings',
  principal: 'Academic management and oversight',
  teacher: 'Manage assigned classes - attendance, marks, homework',
  student: 'Personal dashboard and academic information',
  parent: "View children's academic progress and information",
  accountant: 'Fee management and financial transactions',
  receptionist: 'Admissions and visitor management',
};

export const ALL_ROLES: UserRole[] = [
  'super_admin',
  'admin',
  'principal',
  'teacher',
  'student',
  'parent',
  'accountant',
  'receptionist',
];

export const ADMIN_LEVEL_ROLES: UserRole[] = ['super_admin', 'admin'];

export function isAdminLevel(role: string | undefined): boolean {
  return role === 'super_admin' || role === 'admin';
}

export function isSuperAdmin(role: string | undefined): boolean {
  return role === 'super_admin';
}

export const DASHBOARD_ROUTES: Record<string, string> = {
  super_admin: '/admin',
  admin: '/admin',
  principal: '/admin',
  teacher: '/teacher',
  student: '/student',
  parent: '/parent',
  accountant: '/admin',
  receptionist: '/admin',
};

export function getDashboardRoute(role: string): string {
  return DASHBOARD_ROUTES[role] || '/';
}

export const PERMISSION_MODULES = [
  'dashboard',
  'users',
  'roles',
  'permissions',
  'students',
  'teachers',
  'parents',
  'classes',
  'attendance',
  'exams',
  'marks',
  'homework',
  'assignments',
  'fees',
  'library',
  'transport',
  'events',
  'gallery',
  'announcements',
  'reports',
  'settings',
  'messages',
  'admissions',
  'visitors',
] as const;

export type PermissionModule = (typeof PERMISSION_MODULES)[number];

export const MODULE_LABELS: Record<string, string> = {
  dashboard: 'Dashboard',
  users: 'User Management',
  roles: 'Roles',
  permissions: 'Permissions',
  students: 'Students',
  teachers: 'Teachers',
  parents: 'Parents',
  classes: 'Classes',
  attendance: 'Attendance',
  exams: 'Examinations',
  marks: 'Marks & Grades',
  homework: 'Homework',
  assignments: 'Assignments',
  fees: 'Fee Management',
  library: 'Library',
  transport: 'Transport',
  events: 'Events',
  gallery: 'Gallery',
  announcements: 'Announcements',
  reports: 'Reports',
  settings: 'Settings',
  messages: 'Messages',
  admissions: 'Admissions',
  visitors: 'Visitor Management',
};
