'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  GraduationCap,
  BookOpen,
  DollarSign,
  Building2,
  Calendar,
  TrendingUp,
  Bus,
  Library,
  Bell,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend,
} from 'recharts';
import { format } from 'date-fns';

export default function AdminDashboard() {
  const { user, hasPermission } = useAuth();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalStudents: 0,
    totalTeachers: 0,
    totalClasses: 0,
    totalParents: 0,
    totalRevenue: 0,
    pendingFees: 0,
  });
  const [recentStudents, setRecentStudents] = useState<any[]>([]);
  const [recentTeachers, setRecentTeachers] = useState<any[]>([]);
  const [events, setEvents] = useState<any[]>([]);
  const [notices, setNotices] = useState<any[]>([]);

  useEffect(() => {
    fetchDashboard();
  }, []);

  const fetchDashboard = async () => {
    setLoading(true);

    // Count students
    const { count: studentCount } = await supabase
      .from('students')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Count teachers
    const { count: teacherCount } = await supabase
      .from('teachers')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Count classes
    const { count: classCount } = await supabase
      .from('classes')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Count parents
    const { count: parentCount } = await supabase
      .from('parents')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true);

    // Get fee stats
    const { data: feeData } = await supabase
      .from('student_fees')
      .select('amount, status');

    let totalRevenue = 0;
    let pendingFees = 0;
    if (feeData) {
      totalRevenue = feeData.filter(f => f.status === 'paid').reduce((sum, f) => sum + f.amount, 0);
      pendingFees = feeData.filter(f => f.status === 'pending' || f.status === 'overdue').reduce((sum, f) => sum + f.amount, 0);
    }

    // Get recent students
    const { data: recentStudentsData } = await supabase
      .from('students')
      .select(`
        id,
        created_at,
        user:profiles(first_name, last_name, avatar_url)
      `)
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (recentStudentsData) setRecentStudents(recentStudentsData);

    // Get events
    const { data: eventData } = await supabase
      .from('events')
      .select('*')
      .eq('is_active', true)
      .gte('start_date', new Date().toISOString().split('T')[0])
      .order('start_date')
      .limit(5);

    if (eventData) setEvents(eventData);

    // Get notices
    const { data: noticeData } = await supabase
      .from('notices')
      .select('*')
      .eq('is_active', true)
      .order('created_at', { ascending: false })
      .limit(5);

    if (noticeData) setNotices(noticeData);

    setStats({
      totalStudents: studentCount || 0,
      totalTeachers: teacherCount || 0,
      totalClasses: classCount || 0,
      totalParents: parentCount || 0,
      totalRevenue,
      pendingFees,
    });

    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = () => {
    if (!user?.profile) return 'A';
    return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
  };

  const COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6'];

  const monthlyRevenueData = [
    { month: 'Jul', revenue: 450000 },
    { month: 'Aug', revenue: 380000 },
    { month: 'Sep', revenue: 520000 },
    { month: 'Oct', revenue: 480000 },
    { month: 'Nov', revenue: 350000 },
    { month: 'Dec', revenue: 420000 },
  ];

  const classDistributionData = [
    { name: 'Class 1-5', value: 450, color: '#3b82f6' },
    { name: 'Class 6-8', value: 380, color: '#22c55e' },
    { name: 'Class 9-10', value: 320, color: '#f59e0b' },
    { name: 'Class 11-12', value: 280, color: '#8b5cf6' },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Header title="Admin Dashboard" subtitle={`${getGreeting()}, ${user?.profile.first_name}`} />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={user?.profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {getGreeting()}, {user?.profile.first_name}!
                </h1>
                <p className="text-muted-foreground mt-1 flex items-center justify-center lg:justify-start gap-2">
                  <Badge>FULL ACCESS</Badge>
                  <span className="text-muted-foreground/50">-</span>
                  <span>School Administrator</span>
                </p>
              </div>
              <div className="text-right hidden lg:block">
                <p className="text-sm text-muted-foreground">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  Academic Year: 2024-25
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
          {hasPermission('students.view') && (
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Students</p>
                  <p className="text-2xl font-bold text-primary">{stats.totalStudents}</p>
                </div>
                <div className="p-2 rounded-full bg-primary/10">
                  <GraduationCap className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {hasPermission('teachers.view') && (
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Teachers</p>
                  <p className="text-2xl font-bold text-green-600">{stats.totalTeachers}</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {hasPermission('classes.view') && (
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Classes</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.totalClasses}</p>
                </div>
                <div className="p-2 rounded-full bg-blue-100">
                  <Building2 className="h-6 w-6 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {hasPermission('parents.view') && (
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Parents</p>
                  <p className="text-2xl font-bold text-orange-600">{stats.totalParents}</p>
                </div>
                <div className="p-2 rounded-full bg-orange-100">
                  <Users className="h-6 w-6 text-orange-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {hasPermission('fees.view') && (
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Revenue</p>
                  <p className="text-2xl font-bold text-green-600">${(stats.totalRevenue / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-2 rounded-full bg-green-100">
                  <DollarSign className="h-6 w-6 text-green-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          )}

          {hasPermission('fees.view') && (
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Pending</p>
                  <p className="text-2xl font-bold text-red-600">${(stats.pendingFees / 1000).toFixed(0)}K</p>
                </div>
                <div className="p-2 rounded-full bg-red-100">
                  <DollarSign className="h-6 w-6 text-red-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          )}
        </div>

        {/* Charts */}
        <div className="grid lg:grid-cols-2 gap-6">
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Revenue Trend
              </CardTitle>
              <CardDescription>Monthly fee collection</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <AreaChart data={monthlyRevenueData}>
                  <defs>
                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-muted-foreground" />
                  <YAxis className="text-muted-foreground" tickFormatter={(value) => `${value / 1000}K`} />
                  <Tooltip
                    formatter={(value: any) => [`$${Number(value).toLocaleString()}`, 'Revenue']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="revenue"
                    stroke="#3b82f6"
                    fill="url(#colorRevenue)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Student Distribution
              </CardTitle>
              <CardDescription>By class level</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={250}>
                <PieChart>
                  <Pie
                    data={classDistributionData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {classDistributionData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) => [Number(value), 'Students']}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Recent & Events */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Recent Students */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <GraduationCap className="h-5 w-5 text-primary" />
                Recent Students
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {recentStudents.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent students</p>
                ) : (
                  recentStudents.map((student: any) => (
                    <div key={student.id} className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src={student.user?.avatar_url} />
                        <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-xs">
                          {student.user?.first_name?.[0]}
                          {student.user?.last_name?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {student.user?.first_name} {student.user?.last_name}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(student.created_at), 'MMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Upcoming Events */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Calendar className="h-5 w-5 text-primary" />
                Upcoming Events
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {events.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No upcoming events</p>
                ) : (
                  events.map((event) => (
                    <div key={event.id} className="p-3 rounded-lg bg-muted/50">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(event.start_date), 'MMM d, yyyy')}
                        {event.venue && ` - ${event.venue}`}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Notices */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Recent Notices
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {notices.length === 0 ? (
                  <p className="text-center text-muted-foreground py-4">No recent notices</p>
                ) : (
                  notices.map((notice) => (
                    <div key={notice.id} className="p-3 rounded-lg bg-muted/50">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{notice.title}</p>
                        {notice.is_pinned && (
                          <Badge variant="secondary" className="text-xs">Pinned</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {format(new Date(notice.created_at), 'MMM d, yyyy')}
                      </p>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
