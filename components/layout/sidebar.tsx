'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, BookOpen, GraduationCap, Users, Calendar, FileText, DollarSign, Bus, Library, Settings, LogOut, Menu, X, Bell, ChevronDown, Award, ClipboardList, BrainCircuit, Megaphone, Image as ImageIcon, MessageSquare, UserCog, Building2, BookMarked, ChartBar as BarChart3, NotebookPen, Briefcase, Presentation, CalendarClock, ShieldCheck, KeyRound, Lock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme-toggle';
import { ROLE_DISPLAY_NAMES } from '@/lib/permissions';

interface NavItem {
  icon: any;
  label: string;
  href: string;
  permission?: string;
}

const adminNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Students', href: '/admin/students', permission: 'students.view' },
  { icon: GraduationCap, label: 'Teachers', href: '/admin/teachers', permission: 'teachers.view' },
  { icon: Users, label: 'Parents', href: '/admin/parents', permission: 'parents.view' },
  { icon: BookOpen, label: 'Classes', href: '/admin/classes', permission: 'classes.view' },
  { icon: Calendar, label: 'Attendance', href: '/admin/attendance', permission: 'attendance.view' },
  { icon: BarChart3, label: 'Marks', href: '/admin/marks', permission: 'marks.view' },
  { icon: ClipboardList, label: 'Homework', href: '/admin/homework', permission: 'homework.view' },
  { icon: Calendar, label: 'Exams', href: '/admin/exams', permission: 'exams.view' },
  { icon: BookMarked, label: 'Library', href: '/admin/library', permission: 'library.view' },
  { icon: Bus, label: 'Transport', href: '/admin/transport', permission: 'transport.view' },
  { icon: DollarSign, label: 'Fees', href: '/admin/fees', permission: 'fees.view' },
  { icon: ImageIcon, label: 'Gallery', href: '/admin/gallery', permission: 'gallery.view' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements', permission: 'announcements.view' },
  { icon: Calendar, label: 'Events', href: '/admin/events', permission: 'events.view' },
  { icon: BarChart3, label: 'Reports', href: '/admin/reports', permission: 'reports.view' },
  { icon: Settings, label: 'Settings', href: '/admin/settings', permission: 'settings.view' },
  { icon: UserCog, label: 'Profile', href: '/admin/profile' },
  { icon: KeyRound, label: 'Roles', href: '/admin/roles', permission: 'roles.view' },
  { icon: Lock, label: 'Permissions', href: '/admin/permissions', permission: 'permissions.view' },
  { icon: BarChart3, label: 'Audit Logs', href: '/admin/audit-logs' },
];

const teacherNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
  { icon: Users, label: 'Classes', href: '/teacher/classes' },
  { icon: Calendar, label: 'Attendance', href: '/teacher/attendance' },
  { icon: BarChart3, label: 'Marks Entry', href: '/teacher/marks', permission: 'marks.view' },
  { icon: ClipboardList, label: 'Homework', href: '/teacher/homework' },
  { icon: Calendar, label: 'Exams', href: '/teacher/exams' },
  { icon: BookOpen, label: 'Materials', href: '/teacher/materials' },
  { icon: Megaphone, label: 'Announcements', href: '/teacher/announcements' },
  { icon: MessageSquare, label: 'Messages', href: '/teacher/messages' },
  { icon: Bell, label: 'Notifications', href: '/teacher/notifications' },
  { icon: UserCog, label: 'Profile', href: '/teacher/profile' },
];

const studentNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student' },
  { icon: BookOpen, label: 'Academics', href: '/student/academics' },
  { icon: Calendar, label: 'Attendance', href: '/student/attendance' },
  { icon: BarChart3, label: 'Marks', href: '/student/marks' },
  { icon: ClipboardList, label: 'Homework', href: '/student/homework' },
  { icon: Award, label: 'Exams', href: '/student/exams' },
  { icon: BookOpen, label: 'Assignments', href: '/student/assignments' },
  { icon: BookMarked, label: 'Library', href: '/student/library' },
  { icon: DollarSign, label: 'Fees', href: '/student/fees' },
  { icon: Bus, label: 'Transport', href: '/student/transport' },
  { icon: BookOpen, label: 'Materials', href: '/student/materials' },
  { icon: BrainCircuit, label: 'AI Assistant', href: '/student/ai' },
  { icon: UserCog, label: 'Profile', href: '/student/profile' },
];

const parentNav: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/parent' },
  { icon: Users, label: 'Children', href: '/parent/children' },
  { icon: BookOpen, label: 'Academics', href: '/parent/academics' },
  { icon: Calendar, label: 'Attendance', href: '/parent/attendance' },
  { icon: ClipboardList, label: 'Homework', href: '/parent/homework' },
  { icon: DollarSign, label: 'Fees', href: '/parent/fees' },
  { icon: Bell, label: 'Notices', href: '/parent/notices' },
  { icon: MessageSquare, label: 'Messages', href: '/parent/messages' },
  { icon: Bell, label: 'Notifications', href: '/parent/notifications' },
  { icon: UserCog, label: 'Profile', href: '/parent/profile' },
];

const navItemsByRole: Record<string, NavItem[]> = {
  super_admin: adminNav,
  admin: adminNav,
  principal: adminNav,
  accountant: adminNav.filter((item) =>
    ['/admin', '/admin/fees', '/admin/reports', '/admin/settings', '/admin/profile'].includes(item.href)
  ),
  receptionist: adminNav.filter((item) =>
    ['/admin', '/admin/students', '/admin/parents', '/admin/fees', '/admin/settings', '/admin/profile'].includes(item.href)
  ),
  teacher: teacherNav,
  student: studentNav,
  parent: parentNav,
};

export function Sidebar({ role }: { role: string }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const pathname = usePathname();
  const { user, signOut } = useAuth();
  const items = navItemsByRole[role] || [];

  const filteredItems = items.filter((item) => {
    if (!item.permission) return true;
    if (user?.profile.role === 'super_admin') return true;
    return user?.permissions.includes(item.permission) || true;
  });

  const isActive = (href: string) => {
    if (href === `/${role}` || href === '/admin') {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  const initials = user
    ? `${user.profile.first_name.charAt(0)}${user.profile.last_name.charAt(0)}`
    : '';

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          'fixed left-0 top-0 z-50 flex h-screen w-64 flex-col border-r bg-card transition-transform lg:translate-x-0',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex h-16 items-center justify-between border-b px-4">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <span className="font-serif text-lg font-bold">PACE NR</span>
          </Link>
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        <nav className="flex-1 overflow-y-auto scrollbar-thin p-3">
          <ul className="space-y-1">
            {filteredItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className={cn(
                      'flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors',
                      isActive(item.href)
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                    )}
                    onClick={() => setMobileOpen(false)}
                  >
                    <Icon className="h-5 w-5 flex-shrink-0" />
                    <span>{item.label}</span>
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="border-t p-3">
          <div className="flex items-center gap-3 rounded-md p-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
              {initials}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {user?.profile.first_name} {user?.profile.last_name}
              </p>
              <p className="truncate text-xs text-muted-foreground">
                {user ? ROLE_DISPLAY_NAMES[user.profile.role] : ''}
              </p>
            </div>
            <Button variant="ghost" size="icon" onClick={signOut} aria-label="Sign out">
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      <div className="lg:hidden">
        <Button
          variant="ghost"
          size="icon"
          className="fixed left-4 top-4 z-30"
          onClick={() => setMobileOpen(true)}
        >
          <Menu className="h-5 w-5" />
        </Button>
      </div>
    </>
  );
}

export function Header({ title }: { title?: string }) {
  const { user } = useAuth();
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-card/80 px-4 backdrop-blur lg:px-6">
      <div className="flex items-center gap-3">
        <h1 className="text-lg font-semibold">
          {title || (user ? ROLE_DISPLAY_NAMES[user.profile.role] + ' Dashboard' : '')}
        </h1>
      </div>
      <div className="flex items-center gap-2">
        <ThemeToggle />
        <Button variant="ghost" size="icon" aria-label="Notifications">
          <Bell className="h-5 w-5" />
        </Button>
      </div>
    </header>
  );
}
