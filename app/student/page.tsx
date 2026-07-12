'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Class, House, Attendance, Notification, TimetableEntry } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  BookOpen,
  GraduationCap,
  Clock,
  Award,
  Bell,
  CheckCircle2,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { format } from 'date-fns';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [studentClass, setStudentClass] = useState<Class | null>(null);
  const [house, setHouse] = useState<House | null>(null);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [todayTimetable, setTodayTimetable] = useState<(TimetableEntry & { subject?: { name: string } })[]>([]);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [attendancePercent, setAttendancePercent] = useState(0);

  useEffect(() => {
    if (user?.student) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.student) return;

    setLoading(true);

    // Fetch class
    if (user.student.class_id) {
      const { data } = await supabase
        .from('classes')
        .select('*')
        .eq('id', user.student.class_id)
        .maybeSingle();
      if (data) setStudentClass(data);
    }

    // Fetch house
    if (user.student.house_id) {
      const { data } = await supabase
        .from('houses')
        .select('*')
        .eq('id', user.student.house_id)
        .maybeSingle();
      if (data) setHouse(data);
    }

    // Fetch attendance
    const { data: attData } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', user.student.id)
      .order('date', { ascending: false })
      .limit(30);
    if (attData) {
      setAttendance(attData);
      const present = attData.filter(a => a.status === 'present' || a.status === 'late').length;
      setAttendancePercent(attData.length > 0 ? Math.round((present / attData.length) * 100) : 0);
    }

    // Fetch today's timetable
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];

    const { data: timetableData } = await supabase
      .from('timetable')
      .select('*, subject:subjects(name)')
      .eq('class_id', user.student.class_id)
      .eq('day_of_week', today)
      .order('period_number');
    if (timetableData) setTodayTimetable(timetableData);

    // Fetch notifications
    const { data: notifData } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', user.user.id)
      .is('is_read', false)
      .limit(5);
    if (notifData) setNotifications(notifData);

    setLoading(false);
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  const getInitials = () => {
    if (!user?.profile) return 'S';
    return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
  };

  const formatTime = (time: string) => {
    const [hours, minutes] = time.split(':');
    const h = parseInt(hours);
    const ampm = h >= 12 ? 'PM' : 'AM';
    const hour12 = h % 12 || 12;
    return `${hour12}:${minutes} ${ampm}`;
  };

  // Attendance chart data for last 7 days
  const attendanceChartData = attendance.slice(0, 7).reverse().map(a => ({
    date: format(new Date(a.date), 'EEE'),
    status: a.status === 'present' ? 100 : a.status === 'late' ? 75 : 0,
  }));

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard" subtitle={`${getGreeting()}, ${user?.profile.first_name}`} />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20 overflow-hidden relative">
          <CardContent className="p-6">
            <div className="flex flex-col lg:flex-row items-center gap-6">
              <Avatar className="h-24 w-24 border-4 border-primary/20 shadow-lg">
                <AvatarImage src={user?.profile.avatar_url} />
                <AvatarFallback className="bg-gradient-to-br from-primary to-accent text-white text-2xl font-semibold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-center lg:text-left">
                <h1 className="text-2xl lg:text-3xl font-bold text-foreground">
                  {getGreeting()}, {user?.profile.first_name}!
                </h1>
                <p className="text-muted-foreground mt-1 flex flex-wrap items-center justify-center lg:justify-start gap-2">
                  <Badge variant="secondary" className="font-normal">
                    {studentClass?.name || 'Loading...'}
                  </Badge>
                  {user?.student?.roll_number && (
                    <>
                      <span className="text-muted-foreground/50">-</span>
                      <span>Roll No: {user.student.roll_number}</span>
                    </>
                  )}
                  {house && (
                    <>
                      <span className="text-muted-foreground/50">-</span>
                      <Badge
                        variant="outline"
                        style={{ borderColor: house.color || undefined, color: house.color }}
                      >
                        {house.name}
                      </Badge>
                    </>
                  )}
                </p>
              </div>
              <div className="hidden lg:flex flex-col items-end gap-2">
                <p className="text-sm text-muted-foreground">Academic Year: 2024-25</p>
                <Button variant="outline">View Profile</Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Attendance</CardTitle>
              <CheckCircle2 className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{attendancePercent}%</div>
              <Progress value={attendancePercent} className="mt-2 h-2" />
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Academic Score</CardTitle>
              <GraduationCap className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">78.5%</div>
              <p className="text-xs text-muted-foreground mt-1">Class Rank: 5th</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Homework</CardTitle>
              <BookOpen className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">3</div>
              <p className="text-xs text-orange-500">Pending submissions</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Exams</CardTitle>
              <Calendar className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">2</div>
              <p className="text-xs text-muted-foreground mt-1">In next 30 days</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Today's Timetable */}
          <Card className="lg:col-span-2 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Today&apos;s Timetable
              </CardTitle>
              <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              {todayTimetable.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>No classes scheduled today</p>
                </div>
              ) : (
                <div className="grid md:grid-cols-2 gap-3">
                  {todayTimetable.map((period) => (
                    <div key={period.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                      <div className="flex flex-col items-center bg-primary text-primary-foreground rounded-lg px-3 py-2 min-w-[60px]">
                        <span className="text-xs">Period</span>
                        <span className="text-xl font-bold">{period.period_number}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium truncate">{period.subject?.name || 'Free Period'}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {formatTime(period.start_time)} - {formatTime(period.end_time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Notifications */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Bell className="h-5 w-5 text-primary" />
                Notifications
              </CardTitle>
              <CardDescription>Recent updates</CardDescription>
            </CardHeader>
            <CardContent>
              {notifications.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Bell className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>All caught up!</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {notifications.map((notif) => (
                    <div key={notif.id} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50 border">
                      <div className="w-2 h-2 rounded-full bg-primary mt-2 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{notif.title}</p>
                        <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">
                          {notif.message}
                        </p>
                        <p className="text-xs text-muted-foreground/70 mt-1">
                          {format(new Date(notif.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Attendance Chart */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Award className="h-5 w-5 text-primary" />
              Attendance Overview
            </CardTitle>
            <CardDescription>Last 7 days</CardDescription>
          </CardHeader>
          <CardContent>
            {attendanceChartData.length > 0 ? (
              <ResponsiveContainer width="100%" height={200}>
                <AreaChart data={attendanceChartData}>
                  <defs>
                    <linearGradient id="colorStatus" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="date" className="text-muted-foreground" tickLine={false} axisLine={false} />
                  <YAxis hide domain={[0, 100]} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="status"
                    stroke="hsl(var(--primary))"
                    fill="url(#colorStatus)"
                    strokeWidth={2}
                  />
                </AreaChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-[200px] flex items-center justify-center text-muted-foreground">
                No attendance data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
