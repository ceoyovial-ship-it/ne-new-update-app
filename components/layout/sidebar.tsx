'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, BookOpen, GraduationCap, Users, Calendar, FileText, DollarSign, Bus, Library, Settings, LogOut, Menu, X, Bell, ChevronDown, Sun, Moon, Award, ClipboardList, BrainCircuit, Megaphone, Image as ImageIcon, MessageSquare, UserCog, Building2, BookMarked, ChartBar as FileBarChart2, UsersRound, ChartBar as BarChart3, NotebookPen, Briefcase, Presentation, CalendarClock, ShieldCheck, KeyRound, Lock } from 'lucide-react';
import { useTheme } from 'next-themes';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ScrollArea } from '@/components/ui/scroll-area';
import { LogoutDialog } from '@/components/auth/logout-dialog';

interface SidebarProps {
  portalType: 'student' | 'parent' | 'teacher' | 'admin';
}

interface NavItem {
  icon: typeof LayoutDashboard;
  label: string;
  href: string;
  permission?: string;
}

const studentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student', permission: 'dashboard.view' },
  { icon: UserCog, label: 'My Profile', href: '/student/profile' },
  { icon: Calendar, label: 'Attendance', href: '/student/attendance', permission: 'attendance.view' },
  { icon: GraduationCap, label: 'Academics', href: '/student/academics' },
  { icon: Award, label: 'Marks', href: '/student/marks', permission: 'marks.view' },
  { icon: FileText, label: 'Homework', href: '/student/homework', permission: 'homework.view' },
  { icon: ClipboardList, label: 'Assignments', href: '/student/assignments', permission: 'assignments.view' },
  { icon: BookOpen, label: 'Study Materials', href: '/student/materials' },
  { icon: BookMarked, label: 'Syllabus', href: '/student/syllabus' },
  { icon: CalendarClock, label: 'Examinations', href: '/student/exams', permission: 'exams.view' },
  { icon: DollarSign, label: 'Fee Management', href: '/student/fees', permission: 'fees.view' },
  { icon: Library, label: 'Library', href: '/student/library', permission: 'library.view' },
  { icon: Bus, label: 'Transport', href: '/student/transport', permission: 'transport.view' },
  { icon: BrainCircuit, label: 'AI Assistant', href: '/student/ai' },
];

const parentNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/parent', permission: 'dashboard.view' },
  { icon: Users, label: 'My Children', href: '/parent/children' },
  { icon: Calendar, label: 'Attendance', href: '/parent/attendance', permission: 'attendance.view' },
  { icon: GraduationCap, label: 'Academic Progress', href: '/parent/academics' },
  { icon: FileText, label: 'Homework', href: '/parent/homework', permission: 'homework.view' },
  { icon: DollarSign, label: 'Fee Management', href: '/parent/fees', permission: 'fees.view' },
  { icon: Megaphone, label: 'Notices', href: '/parent/notices', permission: 'announcements.view' },
  { icon: MessageSquare, label: 'Messages', href: '/parent/messages', permission: 'messages.view' },
  { icon: Bell, label: 'Notifications', href: '/parent/notifications' },
  { icon: UserCog, label: 'Profile', href: '/parent/profile' },
];

const teacherNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher', permission: 'dashboard.view' },
  { icon: Building2, label: 'My Classes', href: '/teacher/classes', permission: 'classes.view' },
  { icon: Calendar, label: 'Attendance', href: '/teacher/attendance', permission: 'attendance.view' },
  { icon: FileText, label: 'Homework', href: '/teacher/homework', permission: 'homework.view' },
  { icon: ClipboardList, label: 'Assignments', href: '/teacher/assignments', permission: 'assignments.view' },
  { icon: BookOpen, label: 'Study Materials', href: '/teacher/materials' },
  { icon: Award, label: 'Examinations', href: '/teacher/exams', permission: 'exams.view' },
  { icon: BarChart3, label: 'Marks Entry', href: '/teacher/marks', permission: 'marks.view' },
  { icon: Megaphone, label: 'Announcements', href: '/teacher/announcements', permission: 'announcements.view' },
  { icon: MessageSquare, label: 'Messages', href: '/teacher/messages', permission: 'messages.view' },
  { icon: Bell, label: 'Notifications', href: '/teacher/notifications' },
  { icon: UserCog, label: 'Profile', href: '/teacher/profile' },
];

const adminNavItems: NavItem[] = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin', permission: 'dashboard.view' },
  { icon: Users, label: 'Students', href: '/admin/students', permission: 'students.view' },
  { icon: UsersRound, label: 'Teachers', href: '/admin/teachers', permission: 'teachers.view' },
  { icon: Users, label: 'Parents', href: '/admin/parents', permission: 'parents.view' },
  { icon: Building2, label: 'Classes', href: '/admin/classes', permission: 'classes.view' },
  { icon: Calendar, label: 'Attendance', href: '/admin/attendance', permission: 'attendance.view' },
  { icon: Award, label: 'Examinations', href: '/admin/exams', permission: 'exams.view' },
  { icon: BarChart3, label: 'Marks', href: '/admin/marks', permission: 'marks.view' },
  { icon: FileText, label: 'Homework', href: '/admin/homework', permission: 'homework.view' },
  { icon: DollarSign, label: 'Fee Management', href: '/admin/fees', permission: 'fees.view' },
  { icon: Library, label: 'Library', href: '/admin/library', permission: 'library.view' },
  { icon: Bus, label: 'Transport', href: '/admin/transport', permission: 'transport.view' },
  { icon: Calendar, label: 'Events', href: '/admin/events', permission: 'events.view' },
  { icon: ImageIcon, label: 'Gallery', href: '/admin/gallery', permission: 'gallery.view' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements', permission: 'announcements.view' },
  { icon: FileBarChart2, label: 'Reports', href: '/admin/reports', permission: 'reports.view' },
  { icon: Settings, label: 'Settings', href: '/admin/settings', permission: 'settings.view' },
  { icon: UserCog, label: 'Profile', href: '/admin/profile' },
];

const adminAdminSection: NavItem[] = [
  { icon: ShieldCheck, label: 'User Management', href: '/admin/users', permission: 'users.view' },
  { icon: KeyRound, label: 'Roles', href: '/admin/roles', permission: 'roles.view' },
  { icon: Lock, label: 'Permissions', href: '/admin/permissions', permission: 'permissions.view' },
  { icon: FileBarChart2, label: 'Audit Logs', href: '/admin/audit-logs' },
];

const navItemsByRole = {
  student: studentNavItems,
  parent: parentNavItems,
  teacher: teacherNavItems,
  admin: adminNavItems,
  super_admin: adminNavItems,
  principal: adminNavItems,
  accountant: adminNavItems,
  receptionist: adminNavItems,
};

export function Sidebar({ portalType }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const { user, hasPermission } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const handleLogoutClick = () => setLogoutOpen(true);

  const allNavItems = navItemsByRole[portalType] || adminNavItems;
  const navItems = allNavItems.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const visibleAdminSection = adminAdminSection.filter(
    (item) => !item.permission || hasPermission(item.permission)
  );

  const showAdminSection = ['super_admin', 'admin'].includes(portalType) && visibleAdminSection.length > 0;

  const getInitials = () => {
    if (!user?.profile) return 'U';
    return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
  };

  const getRoleLabel = () => {
    const labels = {
      admin: 'Administrator',
      teacher: 'Teacher',
      student: 'Student',
      parent: 'Parent',
    };
    return labels[portalType];
  };

  const isActiveLink = (href: string) => {
    if (href === `/${portalType}`) {
      return pathname === href;
    }
    return pathname.startsWith(href);
  };

  return (
    <>
      {/* Mobile header */}
      <div className="lg:hidden fixed top-0 left-0 right-0 h-16 bg-gradient-to-r from-blue-900 to-blue-800 z-50 flex items-center justify-between px-4 shadow-lg">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setMobileOpen(true)}
          className="text-white hover:bg-white/10"
        >
          <Menu className="h-6 w-6" />
        </Button>
        <Link href={`/${portalType}`} className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
            <GraduationCap className="h-5 w-5 text-blue-900" />
          </div>
          <span className="font-bold text-white" style={{ fontFamily: 'Playfair Display, serif' }}>PACE NR</span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
          className="text-white hover:bg-white/10"
        >
          {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>
      </div>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/50 z-50"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={cn(
          'lg:hidden fixed inset-y-0 left-0 w-72 bg-gradient-to-b from-blue-900 to-blue-950 z-50 transform transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-white/10">
            <Link href={`/${portalType}`} className="flex items-center gap-2" onClick={() => setMobileOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center">
                <GraduationCap className="h-6 w-6 text-blue-900" />
              </div>
              <div>
                <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'Playfair Display, serif' }}>PACE NR</h1>
                <p className="text-xs text-amber-400">Olympiad School</p>
              </div>
            </Link>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setMobileOpen(false)}
              className="text-white hover:bg-white/10"
            >
              <X className="h-6 w-6" />
            </Button>
          </div>

          <ScrollArea className="flex-1 py-4">
            <nav className="px-3 space-y-1">
              {navItems.map((item) => {
                const isActive = isActiveLink(item.href);
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setMobileOpen(false)}
                    className={cn(
                      'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                      isActive
                        ? 'bg-amber-500 text-blue-900 font-semibold shadow-lg'
                        : 'text-white/80 hover:bg-white/10 hover:text-white'
                    )}
                  >
                    <item.icon className="h-5 w-5" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}

              {showAdminSection && (
                <>
                  <div className="pt-4 pb-1 px-3">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      Administration
                    </p>
                  </div>
                  {visibleAdminSection.map((item) => {
                    const isActive = isActiveLink(item.href);
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setMobileOpen(false)}
                        className={cn(
                          'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                          isActive
                            ? 'bg-amber-500 text-blue-900 font-semibold shadow-lg'
                            : 'text-white/80 hover:bg-white/10 hover:text-white'
                        )}
                      >
                        <item.icon className="h-5 w-5" />
                        <span>{item.label}</span>
                      </Link>
                    );
                  })}
                </>
              )}
            </nav>
          </ScrollArea>

          <div className="p-4 border-t border-white/10">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-3 px-3 py-2 h-auto hover:bg-white/10 text-white"
                >
                  <Avatar className="h-10 w-10 border-2 border-amber-400">
                    <AvatarImage src={user?.profile.avatar_url} />
                    <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-blue-900 font-semibold">
                      {getInitials()}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 text-left">
                    <p className="text-sm font-medium">
                      {user?.profile.first_name} {user?.profile.last_name}
                    </p>
                    <p className="text-xs text-white/60">{getRoleLabel()}</p>
                  </div>
                  <ChevronDown className="h-4 w-4 text-white/60" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                  {theme === 'dark' ? (
                    <>
                      <Sun className="mr-2 h-4 w-4" />
                      Light Mode
                    </>
                  ) : (
                    <>
                      <Moon className="mr-2 h-4 w-4" />
                      Dark Mode
                    </>
                  )}
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600">
                  <LogOut className="mr-2 h-4 w-4" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </aside>

      {/* Desktop sidebar */}
      <aside
        className={cn(
          'hidden lg:flex flex-col fixed inset-y-0 left-0 bg-gradient-to-b from-blue-900 to-blue-950 transition-all duration-300 z-40',
          collapsed ? 'w-20' : 'w-64'
        )}
      >
        <div className={cn('h-16 flex items-center border-b border-white/10', collapsed ? 'justify-center px-2' : 'px-4')}>
          <Link href={`/${portalType}`} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400 to-amber-500 flex items-center justify-center flex-shrink-0">
              <GraduationCap className="h-6 w-6 text-blue-900" />
            </div>
            {!collapsed && (
              <div>
                <h1 className="font-bold text-lg text-white" style={{ fontFamily: 'Playfair Display, serif' }}>PACE NR</h1>
                <p className="text-xs text-amber-400">Olympiad School</p>
              </div>
            )}
          </Link>
        </div>

        <ScrollArea className="flex-1 py-4">
          <nav className={cn('space-y-1', collapsed ? 'px-2' : 'px-3')}>
            {navItems.map((item) => {
              const isActive = isActiveLink(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  title={collapsed ? item.label : undefined}
                  className={cn(
                    'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                    collapsed && 'justify-center',
                    isActive
                      ? 'bg-amber-500 text-blue-900 font-semibold shadow-lg'
                      : 'text-white/80 hover:bg-white/10 hover:text-white'
                  )}
                >
                  <item.icon className="h-5 w-5 flex-shrink-0" />
                  {!collapsed && <span>{item.label}</span>}
                </Link>
              );
            })}

            {showAdminSection && (
              <>
                <div className="pt-4 pb-1 px-3">
                  {!collapsed && (
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                      Administration
                    </p>
                  )}
                </div>
                {adminAdminSection.map((item) => {
                  const isActive = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      title={collapsed ? item.label : undefined}
                      className={cn(
                        'flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200',
                        collapsed && 'justify-center',
                        isActive
                          ? 'bg-amber-500 text-blue-900 font-semibold shadow-lg'
                          : 'text-white/80 hover:bg-white/10 hover:text-white'
                      )}
                    >
                      <item.icon className="h-5 w-5 flex-shrink-0" />
                      {!collapsed && <span>{item.label}</span>}
                    </Link>
                  );
                })}
              </>
            )}
          </nav>
        </ScrollArea>

        <div className={cn('border-t border-white/10 py-2', collapsed ? 'px-2' : 'px-4')}>
          {collapsed ? (
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(false)}
                className="text-white hover:bg-white/10"
              >
                <Menu className="h-4 w-4" />
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/10">
                    <Avatar className="h-8 w-8 border-2 border-amber-400">
                      <AvatarImage src={user?.profile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-blue-900 text-xs font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="flex items-center justify-between">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="flex-1 justify-start gap-3 px-2 py-2 h-auto hover:bg-white/10 text-white"
                  >
                    <Avatar className="h-9 w-9 border-2 border-amber-400">
                      <AvatarImage src={user?.profile.avatar_url} />
                      <AvatarFallback className="bg-gradient-to-br from-amber-400 to-amber-500 text-blue-900 text-sm font-semibold">
                        {getInitials()}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <p className="text-sm font-medium truncate">
                        {user?.profile.first_name} {user?.profile.last_name}
                      </p>
                      <p className="text-xs text-white/60">{getRoleLabel()}</p>
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="start" className="w-48">
                  <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
                    {theme === 'dark' ? (
                      <>
                        <Sun className="mr-2 h-4 w-4" />
                        Light Mode
                      </>
                    ) : (
                      <>
                        <Moon className="mr-2 h-4 w-4" />
                        Dark Mode
                      </>
                    )}
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogoutClick} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    Sign Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setCollapsed(true)}
                className="text-white hover:bg-white/10"
              >
                <Menu className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content spacer for fixed sidebar */}
      <div className={cn('hidden lg:block transition-all duration-300', collapsed ? 'w-20' : 'w-64')} />

      <LogoutDialog open={logoutOpen} onOpenChange={setLogoutOpen} />
    </>
  );
}
