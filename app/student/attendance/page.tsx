'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Attendance } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Calendar } from '@/components/ui/calendar';
import { Button } from '@/components/ui/button';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isWeekend, isSameMonth } from 'date-fns';
import {
  CheckCircle,
  XCircle,
  Clock,
  CalendarDays,
  TrendingUp,
  AlertCircle,
} from 'lucide-react';

export default function StudentAttendance() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [month, setMonth] = useState<Date>(new Date());
  const [stats, setStats] = useState({
    present: 0,
    absent: 0,
    late: 0,
    excused: 0,
    total: 0,
    percentage: 0,
  });

  useEffect(() => {
    if (user?.student) {
      fetchAttendance();
    }
  }, [user]);

  const fetchAttendance = async () => {
    if (!user?.student) return;

    setLoading(true);

    const { data } = await supabase
      .from('attendance')
      .select('*')
      .eq('student_id', user.student.id)
      .order('date', { ascending: false });

    if (data) {
      setAttendance(data);
      const present = data.filter(a => a.status === 'present').length;
      const absent = data.filter(a => a.status === 'absent').length;
      const late = data.filter(a => a.status === 'late').length;
      const excused = data.filter(a => a.status === 'excused').length;
      const total = data.length;
      const percentage = total > 0 ? Math.round(((present + late) / total) * 100) : 0;

      setStats({ present, absent, late, excused, total, percentage });
    }

    setLoading(false);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'present':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'absent':
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 'late':
        return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'excused':
        return <AlertCircle className="h-4 w-4 text-blue-500" />;
      default:
        return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'bg-green-100 text-green-700 border-green-200';
      case 'absent':
        return 'bg-red-100 text-red-700 border-red-200';
      case 'late':
        return 'bg-yellow-100 text-yellow-700 border-yellow-200';
      case 'excused':
        return 'bg-blue-100 text-blue-700 border-blue-200';
      default:
        return 'bg-muted';
    }
  };

  const getAttendanceForDate = (date: Date): Attendance | undefined => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return attendance.find(a => a.date === dateStr);
  };

  const monthlyDays = eachDayOfInterval({
    start: startOfMonth(month),
    end: endOfMonth(month),
  });

  const monthlyAttendance = monthlyDays.map((day) => {
    const dayAttendance = getAttendanceForDate(day);
    return {
      date: day,
      status: dayAttendance?.status,
      isWeekend: isWeekend(day),
    };
  });

  return (
    <div className="min-h-screen bg-background">
      <Header title="Attendance" subtitle="Track your attendance record" />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Stats Overview */}
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Present</p>
                  <p className="text-2xl font-bold text-green-600">{stats.present}</p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Absent</p>
                  <p className="text-2xl font-bold text-red-600">{stats.absent}</p>
                </div>
                <XCircle className="h-8 w-8 text-red-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Late</p>
                  <p className="text-2xl font-bold text-yellow-600">{stats.late}</p>
                </div>
                <Clock className="h-8 w-8 text-yellow-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Excused</p>
                  <p className="text-2xl font-bold text-blue-600">{stats.excused}</p>
                </div>
                <AlertCircle className="h-8 w-8 text-blue-500 opacity-50" />
              </div>
            </CardContent>
          </Card>

          <Card className="card-hover bg-gradient-to-br from-primary/10 to-accent/10">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">Total</p>
                  <p className="text-2xl font-bold">{stats.percentage}%</p>
                </div>
                <TrendingUp className="h-8 w-8 text-primary opacity-50" />
              </div>
              <Progress value={stats.percentage} className="mt-2 h-2" />
            </CardContent>
          </Card>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Calendar View */}
          <Card className="lg:col-span-2 card-hover">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5 text-primary" />
                Attendance Calendar
              </CardTitle>
              <CardDescription>
                Click on a date to see details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                month={month}
                onMonthChange={setMonth}
                className="rounded-md border mx-auto"
                modifiers={{
                  present: attendance.filter(a => a.status === 'present').map(a => new Date(a.date)),
                  absent: attendance.filter(a => a.status === 'absent').map(a => new Date(a.date)),
                  late: attendance.filter(a => a.status === 'late').map(a => new Date(a.date)),
                }}
                modifiersStyles={{
                  present: { backgroundColor: '#22c55e', color: 'white', borderRadius: '50%' },
                  absent: { backgroundColor: '#ef4444', color: 'white', borderRadius: '50%' },
                  late: { backgroundColor: '#eab308', color: 'white', borderRadius: '50%' },
                }}
              />

              <div className="flex justify-center gap-6 mt-4">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-green-500" />
                  <span className="text-sm">Present</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-red-500" />
                  <span className="text-sm">Absent</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-yellow-500" />
                  <span className="text-sm">Late</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Selected Date Details */}
          <Card className="card-hover">
            <CardHeader>
              <CardTitle>Day Details</CardTitle>
              <CardDescription>{format(selectedDate, 'EEEE, MMMM d, yyyy')}</CardDescription>
            </CardHeader>
            <CardContent>
              {isWeekend(selectedDate) ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CalendarDays className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p>Weekend - No classes</p>
                </div>
              ) : (
                (() => {
                  const dayAttendance = getAttendanceForDate(selectedDate);
                  return dayAttendance ? (
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-4 rounded-lg bg-muted/50">
                        <span className="font-medium">Status</span>
                        <Badge className={getStatusColor(dayAttendance.status)}>
                          <span className="flex items-center gap-1">
                            {getStatusIcon(dayAttendance.status)}
                            {dayAttendance.status.charAt(0).toUpperCase() + dayAttendance.status.slice(1)}
                          </span>
                        </Badge>
                      </div>
                      {dayAttendance.remarks && (
                        <div className="p-4 rounded-lg bg-muted/50">
                          <p className="text-sm text-muted-foreground">Remarks</p>
                          <p className="mt-1">{dayAttendance.remarks}</p>
                        </div>
                      )}
                      <div className="p-4 rounded-lg bg-muted/50">
                        <p className="text-sm text-muted-foreground">Marked at</p>
                        <p className="mt-1">
                          {format(new Date(dayAttendance.marked_at), 'MMM d, yyyy h:mm a')}
                        </p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-muted-foreground">
                      <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                      <p>No attendance record for this date</p>
                    </div>
                  );
                })()
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Attendance Grid */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle>Monthly Overview</CardTitle>
            <CardDescription>{format(month, 'MMMM yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-7 gap-1">
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
                <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                  {day}
                </div>
              ))}
              {monthlyAttendance.map((day, index) => (
                <div
                  key={index}
                  className={`
                    text-center py-2 rounded-md text-sm
                    ${!isSameMonth(day.date, month) ? 'opacity-30' : ''}
                    ${day.isWeekend ? 'bg-muted' : ''}
                    ${day.status === 'present' ? 'bg-green-100 text-green-700' : ''}
                    ${day.status === 'absent' ? 'bg-red-100 text-red-700' : ''}
                    ${day.status === 'late' ? 'bg-yellow-100 text-yellow-700' : ''}
                    ${day.status === 'excused' ? 'bg-blue-100 text-blue-700' : ''}
                  `}
                >
                  {format(day.date, 'd')}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
