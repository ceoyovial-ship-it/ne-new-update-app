'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/auth-context';
import { supabase, Class, TeacherAssignment } from '@/lib/supabase';
import { Header } from '@/components/layout/header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import {
  Users,
  BookOpen,
  Calendar,
  Clock,
  CheckCircle2,
  FileText,
  Bell,
  TrendingUp,
} from 'lucide-react';
import { format } from 'date-fns';

export default function TeacherDashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [assignedClasses, setAssignedClasses] = useState<(TeacherAssignment & { class?: { name: string }; subject?: { name: string } })[]>([]);
  const [todayClasses, setTodayClasses] = useState<any[]>([]);
  const [stats, setStats] = useState({
    totalClasses: 0,
    totalSubjects: 0,
    totalStudents: 0,
    homeworkPending: 0,
  });

  useEffect(() => {
    if (user?.teacher) {
      fetchData();
    }
  }, [user]);

  const fetchData = async () => {
    if (!user?.teacher) return;

    setLoading(true);

    // Fetch teacher assignments
    const { data: assignments } = await supabase
      .from('teacher_assignments')
      .select(`
        *,
        class:classes(*),
        subject:subjects(*)
      `)
      .eq('teacher_id', user.teacher.id)
      .eq('is_active', true);

    if (assignments) {
      setAssignedClasses(assignments);
      const uniqueClasses = new Set(assignments.map(a => a.class_id).filter(Boolean));
      const uniqueSubjects = new Set(assignments.map(a => a.subject_id).filter(Boolean));
      setStats(prev => ({
        ...prev,
        totalClasses: uniqueClasses.size,
        totalSubjects: uniqueSubjects.size,
      }));
    }

    // Fetch today's timetable
    const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const today = days[new Date().getDay()];

    const { data: timetable } = await supabase
      .from('timetable')
      .select(`
        *,
        class:classes(name),
        subject:subjects(name)
      `)
      .eq('teacher_id', user.teacher.id)
      .eq('day_of_week', today)
      .order('period_number');

    if (timetable) {
      setTodayClasses(timetable);
    }

    setLoading(false);
  };

  const getInitials = () => {
    if (!user?.profile) return 'T';
    return `${user.profile.first_name[0]}${user.profile.last_name[0]}`.toUpperCase();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="min-h-screen bg-background">
      <Header title="Dashboard" subtitle={`${getGreeting()}, ${user?.profile.first_name}`} />

      <div className="p-4 lg:p-6 max-w-7xl mx-auto space-y-6 animate-in">
        {/* Welcome Banner */}
        <Card className="bg-gradient-to-r from-primary/10 via-primary/5 to-accent/10 border-primary/20">
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
                <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 mt-2">
                  <Badge variant="secondary">Teacher ID: {user?.teacher?.employee_id}</Badge>
                  {user?.teacher?.is_class_teacher && (
                    <Badge className="bg-accent text-accent-foreground">Class Teacher</Badge>
                  )}
                  {user?.teacher?.is_hod && (
                    <Badge variant="outline">HOD</Badge>
                  )}
                </div>
                {user?.teacher?.specialization && (
                  <p className="text-muted-foreground mt-1">
                    Specialization: {user.teacher.specialization}
                  </p>
                )}
              </div>
              <div className="hidden lg:block text-right">
                <p className="text-sm text-muted-foreground">
                  Experience: {user?.teacher?.experience_years || 0} years
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  {format(new Date(), 'EEEE, MMMM d, yyyy')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <Users className="h-4 w-4 text-primary" />
                Assigned Classes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalClasses}</div>
              <p className="text-xs text-muted-foreground">Active classes</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <BookOpen className="h-4 w-4 text-green-500" />
                Subjects
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.totalSubjects}</div>
              <p className="text-xs text-muted-foreground">Teaching subjects</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <FileText className="h-4 w-4 text-orange-500" />
                Homework
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">12</div>
              <p className="text-xs text-muted-foreground">Active assignments</p>
            </CardContent>
          </Card>

          <Card className="card-hover">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 text-blue-500" />
                Submissions
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">48</div>
              <Progress value={75} className="mt-2 h-2" />
              <p className="text-xs text-muted-foreground mt-1">75% reviewed</p>
            </CardContent>
          </Card>
        </div>

        {/* Today's Schedule */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-primary" />
              Today&apos;s Schedule
            </CardTitle>
            <CardDescription>{format(new Date(), 'EEEE, MMMM d, yyyy')}</CardDescription>
          </CardHeader>
          <CardContent>
            {todayClasses.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <Clock className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No classes scheduled today</p>
              </div>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {todayClasses.map((cls) => (
                  <div key={cls.id} className="flex items-center gap-4 p-4 rounded-lg bg-muted/50 border">
                    <div className="flex flex-col items-center bg-primary text-primary-foreground rounded-lg px-3 py-2 min-w-[60px]">
                      <span className="text-xs">Period</span>
                      <span className="text-xl font-bold">{cls.period_number}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium truncate">{cls.subject?.name || 'Free'}</p>
                      <p className="text-sm text-muted-foreground truncate">{cls.class?.name}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {cls.start_time?.slice(0, 5)} - {cls.end_time?.slice(0, 5)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Assigned Classes */}
        <Card className="card-hover">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5 text-primary" />
              Assigned Classes & Subjects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
              {assignedClasses.map((assignment) => (
                <div
                  key={assignment.id}
                  className="p-4 rounded-lg bg-muted/50 border hover:bg-muted transition-colors"
                >
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="secondary">{assignment.class?.name}</Badge>
                    <Badge variant="outline">{assignment.subject?.name}</Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Click to view students and manage class
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
