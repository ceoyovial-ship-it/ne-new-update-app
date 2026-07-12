'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/lib/auth-context';
import { LayoutDashboard, BookOpen, GraduationCap, Users, Calendar, FileText, DollarSign, Bus, Library, Settings, LogOut, Menu, X, Bell, ChevronDown, Sun, Moon, Award, ClipboardList, BrainCircuit, Megaphone, Image as ImageIcon, MessageSquare, UserCog, Building2, BookMarked, FileBarChart, UsersRound, BarChart3, NotebookPen, Briefcase, Presentation, CalendarClock, ShieldCheck, KeyRound, Lock } from 'lucide-react';
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

const studentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/student' },
  { icon: UserCog, label: 'My Profile', href: '/student/profile' },
  { icon: Calendar, label: 'Attendance', href: '/student/attendance' },
  { icon: GraduationCap, label: 'Academics', href: '/student/academics' },
  { icon: Award, label: 'Marks', href: '/student/marks' },
  { icon: FileText, label: 'Homework', href: '/student/homework' },
  { icon: ClipboardList, label: 'Assignments', href: '/student/assignments' },
  { icon: BookOpen, label: 'Study Materials', href: '/student/materials' },
  { icon: BookMarked, label: 'Syllabus', href: '/student/syllabus' },
  { icon: CalendarClock, label: 'Examinations', href: '/student/exams' },
  { icon: DollarSign, label: 'Fee Management', href: '/student/fees' },
  { icon: Library, label: 'Library', href: '/student/library' },
  { icon: Bus, label: 'Transport', href: '/student/transport' },
  { icon: BrainCircuit, label: 'AI Assistant', href: '/student/ai' },
];

const parentNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/parent' },
  { icon: Users, label: 'My Children', href: '/parent/children' },
  { icon: Calendar, label: 'Attendance', href: '/parent/attendance' },
  { icon: GraduationCap, label: 'Academic Progress', href: '/parent/academics' },
  { icon: FileText, label: 'Homework', href: '/parent/homework' },
  { icon: DollarSign, label: 'Fee Management', href: '/parent/fees' },
  { icon: Megaphone, label: 'Notices', href: '/parent/notices' },
  { icon: MessageSquare, label: 'Messages', href: '/parent/messages' },
  { icon: Bell, label: 'Notifications', href: '/parent/notifications' },
  { icon: UserCog, label: 'Profile', href: '/parent/profile' },
];

const teacherNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/teacher' },
  { icon: Building2, label: 'My Classes', href: '/teacher/classes' },
  { icon: Calendar, label: 'Attendance', href: '/teacher/attendance' },
  { icon: FileText, label: 'Homework', href: '/teacher/homework' },
  { icon: ClipboardList, label: 'Assignments', href: '/teacher/assignments' },
  { icon: BookOpen, label: 'Study Materials', href: '/teacher/materials' },
  { icon: Award, label: 'Examinations', href: '/teacher/exams' },
  { icon: BarChart3, label: 'Marks Entry', href: '/teacher/marks' },
  { icon: Megaphone, label: 'Announcements', href: '/teacher/announcements' },
  { icon: MessageSquare, label: 'Messages', href: '/teacher/messages' },
  { icon: Bell, label: 'Notifications', href: '/teacher/notifications' },
  { icon: UserCog, label: 'Profile', href: '/teacher/profile' },
];

const adminNavItems = [
  { icon: LayoutDashboard, label: 'Dashboard', href: '/admin' },
  { icon: Users, label: 'Students', href: '/admin/students' },
  { icon: UsersRound, label: 'Teachers', href: '/admin/teachers' },
  { icon: Users, label: 'Parents', href: '/admin/parents' },
  { icon: Building2, label: 'Classes', href: '/admin/classes' },
  { icon: Calendar, label: 'Attendance', href: '/admin/attendance' },
  { icon: Award, label: 'Examinations', href: '/admin/exams' },
  { icon: BarChart3, label: 'Marks', href: '/admin/marks' },
  { icon: FileText, label: 'Homework', href: '/admin/homework' },
  { icon: DollarSign, label: 'Fee Management', href: '/admin/fees' },
  { icon: Library, label: 'Library', href: '/admin/library' },
  { icon: Bus, label: 'Transport', href: '/admin/transport' },
  { icon: Calendar, label: 'Events', href: '/admin/events' },
  { icon: ImageIcon, label: 'Gallery', href: '/admin/gallery' },
  { icon: Megaphone, label: 'Announcements', href: '/admin/announcements' },
  { icon: FileBarChart, label: 'Reports', href: '/admin/reports' },
  { icon: Settings, label: 'Settings', href: '/admin/settings' },
  { icon: UserCog, label: 'Profile', href: '/admin/profile' },
];

const adminAdminSection = [
  { icon: ShieldCheck, label: 'User Management', href: '/admin/users' },
  { icon: KeyRound, label: 'Roles', href: '/admin/roles' },
  { icon: Lock, label: 'Permissions', href: '/admin/permissions' },
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
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();
  const pathname = usePathname();

  const handleLogoutClick = () => setLogoutOpen(true);

  const navItems = navItemsByRole[portalType] || adminNavItems;

  const showAdminSection = ['super_admin', 'admin'].includes(portalType);

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
                  {adminAdminSection.map((item) => {
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
